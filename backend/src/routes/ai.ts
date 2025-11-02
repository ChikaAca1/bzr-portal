/**
 * AI Chat API Routes
 *
 * Endpoints for AI-powered conversations:
 * - POST /api/ai/chat - Send message, receive AI response
 * - GET /api/ai/conversation/:id - Get conversation details
 * - POST /api/ai/conversation/:id/end - End conversation
 * - GET /api/ai/conversation/:id/messages - Get conversation messages
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { rateLimiter } from 'hono-rate-limiter';
import { handleChat, endConversation, getConversation, getMessages } from '../services/ai/orchestrator.service';

const ai = new Hono();

// =============================================================================
// Rate Limiting
// =============================================================================

// Stricter rate limit for AI endpoints (cost control)
const aiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // 50 requests per 15 minutes
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    // Use session ID for anonymous, user ID for authenticated
    const sessionId = c.req.header('X-Session-Id');
    const userId = c.req.header('X-User-Id');
    return userId || sessionId || c.req.header('X-Real-IP') || 'unknown';
  },
});

// =============================================================================
// Validation Schemas
// =============================================================================

const chatRequestSchema = z.object({
  conversationId: z.number().optional(),
  sessionId: z.string().optional(),
  userId: z.number().optional(),
  message: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    type: z.enum(['image', 'document', 'file']),
    url: z.string(),
    filename: z.string().optional(),
    mimeType: z.string().optional(),
    ocrText: z.string().optional(),
  })).optional(),
  mode: z.enum(['sales', 'document_creation', 'help']).optional(),
});

// =============================================================================
// Routes
// =============================================================================

/**
 * POST /api/ai/chat
 * Send a message and receive AI response
 *
 * Body:
 * {
 *   conversationId?: number,
 *   sessionId?: string,
 *   userId?: number,
 *   message: string,
 *   attachments?: [...],
 *   mode?: 'sales' | 'document_creation' | 'help'
 * }
 *
 * Response:
 * {
 *   conversationId: number,
 *   message: string,
 *   mode: string,
 *   cost: { inputTokens, outputTokens, costUsd, provider }
 * }
 */
ai.post('/chat', aiRateLimiter, async (c) => {
  try {
    // Parse and validate request
    const body = await c.req.json();
    const validatedRequest = chatRequestSchema.parse(body);

    // Handle chat (TypeScript needs explicit cast here)
    const response = await handleChat(validatedRequest as any);

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      }, 400);
    }

    return c.json({
      success: false,
      error: 'Failed to process chat message',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * GET /api/ai/conversation/:id
 * Get conversation details
 *
 * Response:
 * {
 *   id: number,
 *   userId: number,
 *   sessionId: string,
 *   mode: string,
 *   status: string,
 *   totalTokensInput: number,
 *   totalTokensOutput: number,
 *   totalCostUsd: string,
 *   startedAt: string,
 *   endedAt: string,
 *   lastMessageAt: string
 * }
 */
ai.get('/conversation/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid conversation ID',
      }, 400);
    }

    const conversation = await getConversation(id);

    if (!conversation) {
      return c.json({
        success: false,
        error: 'Conversation not found',
      }, 404);
    }

    // Authorization check - user can only access their own conversations
    const userId = c.req.header('X-User-Id');
    const sessionId = c.req.header('X-Session-Id');

    const isAuthorized =
      (userId && conversation.userId && conversation.userId.toString() === userId) ||
      (sessionId && conversation.sessionId === sessionId);

    if (!isAuthorized) {
      return c.json({
        success: false,
        error: 'Unauthorized access to conversation',
      }, 403);
    }

    return c.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);

    return c.json({
      success: false,
      error: 'Failed to get conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * GET /api/ai/conversation/:id/messages
 * Get all messages in a conversation
 *
 * Response:
 * {
 *   messages: [
 *     {
 *       id: number,
 *       conversationId: number,
 *       role: 'user' | 'assistant' | 'system',
 *       content: string,
 *       attachments: [...],
 *       aiProvider: string,
 *       aiModel: string,
 *       tokensInput: number,
 *       tokensOutput: number,
 *       costUsd: string,
 *       createdAt: string
 *     }
 *   ]
 * }
 */
ai.get('/conversation/:id/messages', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid conversation ID',
      }, 400);
    }

    // Get conversation first to check authorization
    const conversation = await getConversation(id);

    if (!conversation) {
      return c.json({
        success: false,
        error: 'Conversation not found',
      }, 404);
    }

    // Authorization check
    const userId = c.req.header('X-User-Id');
    const sessionId = c.req.header('X-Session-Id');

    const isAuthorized =
      (userId && conversation.userId && conversation.userId.toString() === userId) ||
      (sessionId && conversation.sessionId === sessionId);

    if (!isAuthorized) {
      return c.json({
        success: false,
        error: 'Unauthorized access to conversation',
      }, 403);
    }

    const messages = await getMessages(id);

    return c.json({
      success: true,
      data: {
        messages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);

    return c.json({
      success: false,
      error: 'Failed to get messages',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

/**
 * POST /api/ai/conversation/:id/end
 * End a conversation
 *
 * Response:
 * {
 *   success: true
 * }
 */
ai.post('/conversation/:id/end', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid conversation ID',
      }, 400);
    }

    // Get conversation first to check authorization
    const conversation = await getConversation(id);

    if (!conversation) {
      return c.json({
        success: false,
        error: 'Conversation not found',
      }, 404);
    }

    // Authorization check
    const userId = c.req.header('X-User-Id');
    const sessionId = c.req.header('X-Session-Id');

    const isAuthorized =
      (userId && conversation.userId && conversation.userId.toString() === userId) ||
      (sessionId && conversation.sessionId === sessionId);

    if (!isAuthorized) {
      return c.json({
        success: false,
        error: 'Unauthorized access to conversation',
      }, 403);
    }

    await endConversation(id);

    return c.json({
      success: true,
      message: 'Conversation ended successfully',
    });
  } catch (error) {
    console.error('End conversation error:', error);

    return c.json({
      success: false,
      error: 'Failed to end conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// =============================================================================
// Health Check
// =============================================================================

/**
 * GET /api/ai/health
 * Health check endpoint
 */
ai.get('/health', async (c) => {
  return c.json({
    status: 'ok',
    service: 'ai-chat',
    timestamp: new Date().toISOString(),
  });
});

export default ai;
