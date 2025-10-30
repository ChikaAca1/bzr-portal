/**
 * AI Orchestrator Service
 *
 * Routes user messages to the appropriate AI agent:
 * - Sales Agent: Landing page conversations, product questions
 * - Document Agent: Document creation workflow
 * - Help Agent: User support and guidance
 *
 * Maintains conversation state and tracks costs.
 */

import { db } from '../../db';
import { conversations, conversationMessages, type Conversation, type ConversationMessage } from '../../db/schema/conversations';
import { eq, and, desc } from 'drizzle-orm';
import { getProviderForTask, getModelForProvider, getSystemPrompt, calculateCost, type AIProvider } from '../../lib/ai/providers';
import {
  processDocumentConversation,
  initializeDocumentConversation,
  getConversationProgress,
  type DocumentConversationState,
  type DocumentAgentResponse,
} from './document-agent.service';

// =============================================================================
// Types
// =============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Array<{
    type: 'image' | 'document' | 'file';
    url: string;
    filename?: string;
    mimeType?: string;
    ocrText?: string;
  }>;
}

export interface ChatRequest {
  // Conversation identification
  conversationId?: number;
  sessionId?: string; // For anonymous users
  userId?: number; // For authenticated users

  // Message
  message: string;
  attachments?: ChatMessage['attachments'];

  // Context
  mode?: 'sales' | 'document_creation' | 'help';
}

export interface ChatResponse {
  conversationId: number;
  message: string;
  mode: 'sales' | 'document_creation' | 'help';
  metadata?: {
    intentDetected?: string;
    nextSteps?: string[];
    dataCollected?: Record<string, unknown>;
  };
  cost: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    provider: AIProvider;
  };
}

// =============================================================================
// Intent Detection
// =============================================================================

/**
 * Detect user intent from message content
 * Used to route new conversations to the appropriate agent
 */
function detectIntent(message: string): 'sales' | 'document_creation' | 'help' {
  const lowerMessage = message.toLowerCase();

  // Document creation keywords (Serbian)
  const documentKeywords = [
    'акт', 'процена', 'ризик', 'документ', 'образац',
    'радно место', 'опасност', 'мера', 'генериши'
  ];
  if (documentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'document_creation';
  }

  // Help keywords
  const helpKeywords = [
    'помоћ', 'како', 'не разумем', 'не знам', 'упутство', 'објасни'
  ];
  if (helpKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'help';
  }

  // Default to sales for new visitors
  return 'sales';
}

// =============================================================================
// Conversation Management
// =============================================================================

/**
 * Get or create conversation
 */
async function getOrCreateConversation(request: ChatRequest): Promise<Conversation> {
  // Try to find existing conversation
  if (request.conversationId) {
    const existing = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, request.conversationId))
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }
  }

  // Create new conversation
  const sessionId = request.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const mode = request.mode || detectIntent(request.message);

  const [newConversation] = await db.insert(conversations).values({
    userId: request.userId,
    sessionId,
    mode,
    status: 'active',
    totalTokensInput: 0,
    totalTokensOutput: 0,
    totalCostUsd: '0.00',
  }).returning();

  return newConversation;
}

/**
 * Get conversation history
 */
async function getConversationHistory(conversationId: number, limit: number = 20): Promise<ChatMessage[]> {
  const messages = await db
    .select()
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, conversationId))
    .orderBy(desc(conversationMessages.createdAt))
    .limit(limit);

  return messages.reverse().map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    attachments: msg.attachments as ChatMessage['attachments'],
  }));
}

/**
 * Save message to database
 */
async function saveMessage(
  conversationId: number,
  message: ChatMessage,
  aiProvider?: string,
  aiModel?: string,
  tokensInput?: number,
  tokensOutput?: number,
  costUsd?: number
): Promise<void> {
  await db.insert(conversationMessages).values({
    conversationId,
    role: message.role,
    content: message.content,
    attachments: message.attachments ? JSON.parse(JSON.stringify(message.attachments)) : undefined,
    aiProvider,
    aiModel,
    tokensInput,
    tokensOutput,
    costUsd: costUsd?.toFixed(6),
  });
}

/**
 * Update conversation costs
 */
async function updateConversationCosts(
  conversationId: number,
  inputTokens: number,
  outputTokens: number,
  cost: number
): Promise<void> {
  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv[0]) return;

  const newTotalInput = (conv[0].totalTokensInput || 0) + inputTokens;
  const newTotalOutput = (conv[0].totalTokensOutput || 0) + outputTokens;
  const newTotalCost = parseFloat(conv[0].totalCostUsd || '0') + cost;

  await db
    .update(conversations)
    .set({
      totalTokensInput: newTotalInput,
      totalTokensOutput: newTotalOutput,
      totalCostUsd: newTotalCost.toFixed(6),
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));
}

// =============================================================================
// AI Agent Routing
// =============================================================================

/**
 * Call appropriate AI agent based on conversation mode
 */
async function callAIAgent(
  mode: 'sales' | 'document_creation' | 'help',
  messages: ChatMessage[]
): Promise<{ response: string; provider: AIProvider; model: string; inputTokens: number; outputTokens: number }> {
  // Select provider based on mode
  const task = mode === 'sales' ? 'sales_conversation' :
                mode === 'document_creation' ? 'document_planning' :
                'simple_chat';

  const { provider, client } = getProviderForTask(task);
  const model = getModelForProvider(provider);
  const systemPrompt = getSystemPrompt(
    mode === 'sales' ? 'sales' : mode === 'document_creation' ? 'document' : 'help'
  );

  // Prepare messages for API call
  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))
  ];

  // Call AI provider
  if (provider === 'claude') {
    // Anthropic Claude API
    const anthropic = await import('@anthropic-ai/sdk');
    const claude = client as InstanceType<typeof anthropic.default>;

    // Claude expects messages without system role (system is passed separately)
    const claudeMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    const response = await claude.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: claudeMessages,
    });

    return {
      response: response.content[0].type === 'text' ? response.content[0].text : '',
      provider,
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  } else {
    // OpenAI-compatible API (GPT-4, DeepSeek)
    const OpenAI = await import('openai');
    const openai = client as InstanceType<typeof OpenAI.default>;

    const response = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    return {
      response: response.choices[0]?.message?.content || '',
      provider,
      model,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
    };
  }
}

// =============================================================================
// Main Orchestrator Function
// =============================================================================

/**
 * Main chat orchestrator - handles incoming messages and routes to appropriate agent
 */
export async function handleChat(request: ChatRequest): Promise<ChatResponse> {
  // 1. Get or create conversation
  const conversation = await getOrCreateConversation(request);

  // 2. Get conversation history
  const history = await getConversationHistory(conversation.id);

  // 3. Add user message to history
  const userMessage: ChatMessage = {
    role: 'user',
    content: request.message,
    attachments: request.attachments,
  };
  history.push(userMessage);

  // 4. Save user message to database
  await saveMessage(conversation.id, userMessage);

  // 5. Call appropriate agent based on mode
  let aiResponse: {
    response: string;
    provider: AIProvider;
    model: string;
    inputTokens: number;
    outputTokens: number;
  };
  let documentAgentResult: DocumentAgentResponse | null = null;

  if (conversation.mode === 'document_creation') {
    // Use document creation agent (conversational state machine)
    const documentState: DocumentConversationState =
      (conversation.metadata as { documentState?: DocumentConversationState })?.documentState ||
      initializeDocumentConversation();

    documentAgentResult = await processDocumentConversation(request.message, documentState);

    // Update conversation metadata with new state
    await db.update(conversations)
      .set({
        metadata: { documentState: documentAgentResult.state },
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversation.id));

    // Prepare response in AI format (for consistent handling below)
    aiResponse = {
      response: documentAgentResult.question
        ? `${documentAgentResult.message}\n\n${documentAgentResult.question}`
        : documentAgentResult.message,
      provider: 'claude', // Document creation uses Claude
      model: 'claude-3-5-sonnet-20241022',
      inputTokens: Math.ceil(request.message.length / 4), // Rough estimate
      outputTokens: Math.ceil((documentAgentResult.message + (documentAgentResult.question || '')).length / 4),
    };
  } else {
    // Use generic AI agent (LLM calls)
    aiResponse = await callAIAgent(conversation.mode as any, history);
  }

  // 6. Save assistant message
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: aiResponse.response,
  };

  await saveMessage(
    conversation.id,
    assistantMessage,
    aiResponse.provider,
    aiResponse.model,
    aiResponse.inputTokens,
    aiResponse.outputTokens,
    calculateCost({
      provider: aiResponse.provider,
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
    }).totalCost
  );

  // 7. Update conversation costs
  const cost = calculateCost({
    provider: aiResponse.provider,
    model: aiResponse.model,
    inputTokens: aiResponse.inputTokens,
    outputTokens: aiResponse.outputTokens,
  });

  await updateConversationCosts(
    conversation.id,
    aiResponse.inputTokens,
    aiResponse.outputTokens,
    cost.totalCost
  );

  // 8. Return response with metadata
  const response: ChatResponse = {
    conversationId: conversation.id,
    message: aiResponse.response,
    mode: conversation.mode as any,
    cost: {
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costUsd: cost.totalCost,
      provider: aiResponse.provider,
    },
  };

  // Add document creation metadata if applicable
  if (documentAgentResult) {
    const progress = getConversationProgress(documentAgentResult.state);
    response.metadata = {
      intentDetected: conversation.mode,
      documentProgress: progress.summary,
      documentComplete: documentAgentResult.isComplete,
      dataCollected: documentAgentResult.state.collectedData,
    };

    // If document generation is complete, include document data
    if (documentAgentResult.isComplete && documentAgentResult.documentData) {
      response.metadata.documentData = documentAgentResult.documentData;
    }
  }

  return response;
}

/**
 * End conversation
 */
export async function endConversation(conversationId: number): Promise<void> {
  await db
    .update(conversations)
    .set({
      status: 'completed',
      endedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));
}

/**
 * Get conversation details
 */
export async function getConversation(conversationId: number): Promise<Conversation | null> {
  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get conversation messages
 */
export async function getMessages(conversationId: number): Promise<ConversationMessage[]> {
  return await db
    .select()
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, conversationId))
    .orderBy(conversationMessages.createdAt);
}
