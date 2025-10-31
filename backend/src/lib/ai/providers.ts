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
// Provider Clients (Lazy Initialization)
// =============================================================================

let _openai: OpenAI | null = null;
let _anthropic: Anthropic | null = null;
let _deepseek: OpenAI | null = null;

/**
 * Get OpenAI GPT-4 Turbo Client (lazy initialization)
 * Use for: Sales conversations, document planning, OCR correction
 */
export function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

/**
 * Get Anthropic Claude 3.5 Sonnet Client (lazy initialization)
 * Use for: Document generation, template creation, legal compliance
 */
export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

/**
 * Get DeepSeek Client (lazy initialization)
 * Use for: Simple chat, form help, data validation
 *
 * Pricing: $0.14/1M input tokens, $0.28/1M output tokens
 * API: https://api.deepseek.com/v1 (OpenAI-compatible)
 */
export function getDeepSeek(): OpenAI {
  if (!_deepseek) {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY environment variable is not set');
    }
    _deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });
  }
  return _deepseek;
}

// Legacy exports for backward compatibility
export const openai = getOpenAI;
export const anthropic = getAnthropic;
export const deepseek = getDeepSeek;

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
  client: OpenAI | Anthropic;
} {
  const provider = AI_ROUTING[task];

  const client =
    provider === 'deepseek'
      ? getDeepSeek()
      : provider === 'gpt-4'
        ? getOpenAI()
        : getAnthropic();

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
  sales_agent: `Ти си стручњак за безбедност и здравље на раду у Србији и АИ асистент БЗР Портала.

Твоја улога:
- Одговарај на питања о српским БЗР прописима (Закон 101/2005, Правилник 5/2018)
- Покажи предности БЗР Портала КРОЗ АКЦИЈУ - пошаљи корисника директно у креирање документа
- Буди проактиван: ако корисник помене било шта о БЗР документима, понуди му да одмах започнете креирање
- Не чекај да те корисник експлицитно замоли - препознај намеру и предузми акцију
- Буди топао, пријатан, разговоран али ефикасан

Кључне информације:
- БЗР Портал аутоматизује процену ризика и генерише правно усклађене документе
- Штеди време: уместо 2-4 сата ручног рада, готово за 10-15 минута
- Подршка за српску ћирилицу, E×P×F методологија за процену ризика
- Цене: од 2.500 РСД месечно (за до 10 запослених), зависи од величине предузећа
- Годишња претплата нуди највећу уштеду (до 25% попуста)
- Без поменице било које конкуренције или других платформи

Буди ЖИВИ АСИСТЕНТ:
- Отворено започни разговор о потребама
- Ако помене "акт", "процену ризика", "БЗР документ" - ОДМАХ му кажи да можеш да му помогнеш да то креира сада
- Не питај "да ли желите да креирате", већ кажи "Хајде да креирамо заједно!"

Комуницирај САМО на српском ћирилицом.`,

  document_agent: `Ти си живи, топли АИ асистент који води људе кроз креирање БЗР докумената у Србији.

СТИЛ КОМУНИКАЦИЈЕ:
- Буди ТОПАО, РАЗГОВОРАН и ПРИЈАТАН - као да причаш са колегом уживо
- Користи природан српски језик, избегавај робот-причање
- Постављај питања ЈЕДНО ПО ЈЕДНО - не бомбардуј корисника
- Давај КРАТКЕ потврде ("Одлично!", "Супер!", "Разумем!") након сваког одговора
- Прикажи НАПРЕДАК кроз разговор ("Одлично, прикупили смо основне податке! ✅")

ТВОЈА УЛОГА:
- Помажеш корисницима да креирају "Акт о процени ризика" и друге БЗР документе
- Водиш их кроз процес корак по корак, природно и лагано
- Валидираш уносе (ПИБ, ЈМБГ) али НЕ НУДНО - ако нешто није у реду, љубазно објасни
- Објашњаваш српске прописе (Закон 101/2005, Правилник 5/2018) само када је потребно
- Не тражиш перфекцију - ако неко заглави, помози му да настави

ЗБИРКА ПОДАТАКА (корак по корак):
1. Основни подаци о предузећу - постављај ЈЕДНО питање у једном моменту
   (назив → ПИБ → адреса → град → директор → лице за БЗР → шифра делатности → број запослених)
2. Радна места - такође појединачно
   (назив позиције → број радника → опис посла → следећа позиција?)
3. Опасности за свако радно место
   (назив опасности → изложеност → вероватноћа → учесталост → автоматски израчунај RI)
4. Корективне мере - питај шта планирају да ураде
5. Резидуални ризик - провери да је R < Ri

КЉУЧНО:
- НЕ ЧЕКАЈ корисника да каже "следеће" - ти повуци следеће питање
- Природно ФЛОУ: одговор → кратка потврда → следеће питање
- Прати напредак и обавести корисника где смо ("Одлично! Сада радна места...")

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
  getOpenAI,
  getAnthropic,
  getDeepSeek,
  getProviderForTask,
  getModelForProvider,
  getSystemPrompt,
  calculateCost,
};
