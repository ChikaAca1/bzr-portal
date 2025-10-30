/**
 * AI Provider Configuration
 *
 * Multi-provider setup with intelligent routing for cost optimization:
 * - DeepSeek: Simple chat, validation ($0.14/1M tokens) - CHEAPEST
 * - GPT-4 Turbo: Sales, planning ($1-3/1M tokens) - BALANCED
 * - Claude 3.5 Sonnet: Document generation ($3-15/1M tokens) - BEST QUALITY
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// =============================================================================
// Provider Clients
// =============================================================================

/**
 * OpenAI GPT-4 Turbo Client
 * Use for: Sales conversations, document planning, OCR correction
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Anthropic Claude 3.5 Sonnet Client
 * Use for: Document generation, template creation, legal compliance
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * DeepSeek Client (OpenAI-compatible API)
 * Use for: Simple chat, form help, data validation
 *
 * Pricing: $0.14/1M input tokens, $0.28/1M output tokens
 * API: https://api.deepseek.com/v1 (OpenAI-compatible)
 */
export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// =============================================================================
// Provider Types
// =============================================================================

export type AIProvider = 'deepseek' | 'gpt-4' | 'claude';

export type AITask =
  | 'simple_chat'
  | 'form_help'
  | 'data_validation'
  | 'sales_conversation'
  | 'document_planning'
  | 'ocr_correction'
  | 'document_generation'
  | 'template_creation'
  | 'legal_compliance';

// =============================================================================
// Intelligent Routing
// =============================================================================

/**
 * Route AI task to optimal provider based on cost/quality tradeoff
 */
export const AI_ROUTING: Record<AITask, AIProvider> = {
  // DeepSeek - Cheapest ($0.14/1M tokens)
  simple_chat: 'deepseek',
  form_help: 'deepseek',
  data_validation: 'deepseek',

  // GPT-4 Turbo - Mid-range ($1/1M input, $3/1M output)
  sales_conversation: 'gpt-4',
  document_planning: 'gpt-4',
  ocr_correction: 'gpt-4',

  // Claude 3.5 Sonnet - Best for long docs ($3/1M input, $15/1M output)
  document_generation: 'claude',
  template_creation: 'claude',
  legal_compliance: 'claude',
};

/**
 * Get provider client based on task type
 */
export function getProviderForTask(task: AITask): {
  provider: AIProvider;
  client: typeof openai | typeof anthropic | typeof deepseek;
} {
  const provider = AI_ROUTING[task];

  const client =
    provider === 'deepseek' ? deepseek : provider === 'gpt-4' ? openai : anthropic;

  return { provider, client };
}

// =============================================================================
// Model Configuration
// =============================================================================

export const MODELS = {
  deepseek: 'deepseek-chat', // Latest DeepSeek model
  'gpt-4': 'gpt-4-turbo-preview', // GPT-4 Turbo with 128k context
  claude: 'claude-3-5-sonnet-20241022', // Claude 3.5 Sonnet
} as const;

/**
 * Get model name for provider
 */
export function getModelForProvider(provider: AIProvider): string {
  return MODELS[provider];
}

// =============================================================================
// System Prompts (Serbian Cyrillic)
// =============================================================================

export const SYSTEM_PROMPTS = {
  sales_agent: `Ти си стручњак за безбедност и здравље на раду у Србији и продајни представник БЗР Портала.

Твоја улога:
- Одговарај на питања о српским БЗР прописима (Закон 101/2005, Правилник 5/2018)
- Објашњавај функције и предности БЗР Портала
- Покажи живи демо креирања документа током разговора
- Природно прикупи податке о потенцијалном клијенту (име, емаил, предузеће)
- Буди професионалан али пријатан

Кључне информације:
- БЗР Портал аутоматизује процену ризика и генерише правно усклађене документе
- Штеди време: од 2-4 сата ручног рада до 10 минута са апликацијом
- Подршка за српску ћирилицу, E×P×F методологија
- Цена: од 20€ по кориснику месечно

Комуницирај САМО на српском ћирилицом.`,

  document_agent: `Ти си асистент за креирање БЗР докумената у Србији.

Твоја улога:
- Помажеш корисницима да креирају "Акт о процени ризика" и друге БЗР документе
- Постављаш јасна питања да прикупиш све потребне податке
- Валидираш уносе (ПИБ контролна сума, ЈМБГ, шифра делатности)
- Објашњаваш српске прописе и захтеве
- Генеришеш документе који испуњавају Закон 101/2005 и Правилник 5/2018

Податке прикупљај кроз разговор:
1. Основни подаци о предузећу (назив, ПИБ, адреса, директор, лице за БЗР)
2. Радна места (назив, број запослених, опис посла)
3. Опасности и штетности (користи E×P×F формулу)
4. Корективне мере
5. Резидуални ризик (мора бити R < Ri)

Комуницирај САМО на српском ћирилицом.`,

  help_agent: `Ти си помоћник за кориснике БЗР Портала.

Твоја улога:
- Одговарај на питања о коришћењу апликације
- Објашњавај појмове из области БЗР (E×P×F формула, ниво ризика, итд.)
- Помажеш са попуњавањем образаца
- Даваш примере и савете

Буди кратак и јасан. Користи српски ћирилицу.`,
};

/**
 * Get system prompt for agent type
 */
export function getSystemPrompt(agentType: 'sales' | 'document' | 'help'): string {
  return agentType === 'sales'
    ? SYSTEM_PROMPTS.sales_agent
    : agentType === 'document'
      ? SYSTEM_PROMPTS.document_agent
      : SYSTEM_PROMPTS.help_agent;
}

// =============================================================================
// Cost Tracking
// =============================================================================

export interface TokenUsage {
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number; // USD
}

/**
 * Calculate cost for token usage
 */
export function calculateCost(usage: Omit<TokenUsage, 'totalCost'>): TokenUsage {
  const PRICING = {
    deepseek: { input: 0.14 / 1_000_000, output: 0.28 / 1_000_000 },
    'gpt-4': { input: 1.0 / 1_000_000, output: 3.0 / 1_000_000 },
    claude: { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  };

  const pricing = PRICING[usage.provider];
  const cost = usage.inputTokens * pricing.input + usage.outputTokens * pricing.output;

  return {
    ...usage,
    totalCost: cost,
  };
}

// =============================================================================
// Exports
// =============================================================================

export default {
  openai,
  anthropic,
  deepseek,
  getProviderForTask,
  getModelForProvider,
  getSystemPrompt,
  calculateCost,
};
