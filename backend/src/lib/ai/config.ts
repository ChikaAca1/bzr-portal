/**
 * LangChain Configuration (Phase 3a: T114)
 *
 * Multi-provider AI support: Anthropic Claude, DeepSeek, OpenAI
 * Configure via AI_PROVIDER environment variable in .env
 * AI requirements: FR-022-024 (per updated research.md section 5)
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

// =============================================================================
// Environment Variables & Provider Configuration
// =============================================================================

export type AIProvider = 'anthropic' | 'deepseek' | 'openai';

const AI_PROVIDER = (process.env.AI_PROVIDER || 'anthropic') as AIProvider;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Validate configuration based on selected provider
function validateConfig() {
  console.log(`🤖 AI Provider: ${AI_PROVIDER.toUpperCase()}\n`);

  if (AI_PROVIDER === 'anthropic') {
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.startsWith('sk-ant-REPLACE')) {
      console.warn('⚠️  ANTHROPIC_API_KEY is not configured properly in .env!');
      console.warn('   Get your key from: https://console.anthropic.com/\n');
    }
  } else if (AI_PROVIDER === 'deepseek') {
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_key') {
      console.warn('⚠️  DEEPSEEK_API_KEY is not configured properly in .env!');
      console.warn('   Get your key from: https://platform.deepseek.com/\n');
    }
  } else if (AI_PROVIDER === 'openai') {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key') {
      console.warn('⚠️  OPENAI_API_KEY is not configured properly in .env!');
      console.warn('   Get your key from: https://platform.openai.com/\n');
    }
  }
}

validateConfig();

// =============================================================================
// Multi-Provider Chat Model Factory
// =============================================================================

/**
 * Supported Models:
 *
 * 1. ANTHROPIC (default) - Claude 3.5 Sonnet
 *    - Best reasoning quality
 *    - Price: $3/$15 per 1M tokens (input/output)
 *    - 200K context window
 *
 * 2. DEEPSEEK - DeepSeek R1
 *    - Very good quality, excellent value
 *    - Price: $0.55/$2.19 per 1M tokens
 *    - Good Serbian language support
 *
 * 3. OPENAI - GPT-4 Turbo
 *    - Good quality
 *    - Price: $10/$30 per 1M tokens
 *    - 128K context window
 *
 * Temperature: 0.3 (low for consistency, but not 0 to allow some creativity)
 * Max tokens: 2048 (sufficient for JSON responses)
 */
export const createChatModel = (options?: {
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}): BaseChatModel => {
  const temperature = options?.temperature ?? 0.3;
  const maxTokens = options?.maxTokens ?? 2048;
  const streaming = options?.streaming ?? false;

  switch (AI_PROVIDER) {
    case 'anthropic':
      return new ChatAnthropic({
        modelName: 'claude-3-5-sonnet-20241022',
        anthropicApiKey: ANTHROPIC_API_KEY,
        temperature,
        maxTokens,
        streaming,
        maxRetries: 2,
        timeout: 20000,
      });

    case 'deepseek':
      return new ChatOpenAI({
        modelName: 'deepseek-chat', // DeepSeek R1
        openAIApiKey: DEEPSEEK_API_KEY,
        configuration: {
          baseURL: 'https://api.deepseek.com/v1',
        },
        temperature,
        maxTokens,
        streaming,
        maxRetries: 2,
        timeout: 20000,
      });

    case 'openai':
      return new ChatOpenAI({
        modelName: 'gpt-4-turbo-preview',
        openAIApiKey: OPENAI_API_KEY,
        temperature,
        maxTokens,
        streaming,
        maxRetries: 2,
        timeout: 20000,
      });

    default:
      throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
  }
};

/**
 * Default chat model instance
 *
 * Usage:
 *   import { chatModel } from './config';
 *   const response = await chatModel.invoke("Translate to Serbian: Hello");
 */
export const chatModel = createChatModel();

// =============================================================================
// Model Variants
// =============================================================================

/**
 * High-consistency model (temperature 0.1)
 *
 * Use for: Risk calculation validation, hazard code matching
 */
export const consistentChatModel = createChatModel({
  temperature: 0.1,
});

/**
 * Creative model (temperature 0.7)
 *
 * Use for: Mitigation suggestions (need variety)
 */
export const creativeChatModel = createChatModel({
  temperature: 0.7,
});

/**
 * Fast model (max 512 tokens)
 *
 * Use for: Quick validations, yes/no questions
 */
export const fastChatModel = createChatModel({
  maxTokens: 512,
});

// =============================================================================
// Utilities
// =============================================================================

/**
 * Get current AI provider
 */
export const getAIProvider = (): AIProvider => AI_PROVIDER;

/**
 * Check if AI is configured and available
 */
export const isAIConfigured = (): boolean => {
  switch (AI_PROVIDER) {
    case 'anthropic':
      return !!ANTHROPIC_API_KEY && !ANTHROPIC_API_KEY.startsWith('sk-ant-REPLACE');
    case 'deepseek':
      return !!DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'your_deepseek_key';
    case 'openai':
      return !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key';
    default:
      return false;
  }
};
