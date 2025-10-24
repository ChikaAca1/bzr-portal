/**
 * AI Service Test Script
 *
 * Manual test for HazardIdentifierAgent
 * Run with: npm run test:ai
 *
 * Requirements:
 * - ANTHROPIC_API_KEY must be configured in .env
 * - API key must start with sk-ant-api03-
 */

import 'dotenv/config';
import { aiService } from './services/ai.service.js';
import type { HazardIdentifierInput } from './lib/ai/agents/hazard-identifier.agent.js';

// =============================================================================
// Test Cases
// =============================================================================

const TEST_CASES: { name: string; input: HazardIdentifierInput }[] = [
  {
    name: '👨‍💻 Programer (Седење + Екрани)',
    input: {
      positionName: 'Програмер',
      jobDescription: 'Пише код за веб апликације, учествује у team meeting-има, ради code review',
      equipment: ['Компјутер', '2 монитора', 'Тастатура', 'Миш'],
      workspace: 'Канцеларија (затворен простор)',
      workHours: {
        daily: 8,
        overtime: true,
        shifts: false,
        nightWork: false,
      },
    },
  },
  {
    name: '🚜 Виљушкариста (Машине + Саобраћај)',
    input: {
      positionName: 'Виљушкариста',
      jobDescription: 'Управља виљушкаром у магацину, преноси терет, утоварује камионе',
      equipment: ['Виљушкар (електрични)', 'Палетне дизалице'],
      workspace: 'Магацин са високим полицама',
      workHours: {
        daily: 8,
        shifts: true,
        nightWork: false,
        overtime: false,
      },
    },
  },
  {
    name: '👔 Извршни директор (Стрес + Одговорност)',
    input: {
      positionName: 'Извршни директор',
      jobDescription: 'Руководи компанијом, доноси стратешке одлуке, учествује у састанцима са клијентима',
      equipment: ['Лаптоп', 'Мобилни телефон'],
      workspace: 'Канцеларија + теренски састанци',
      workHours: {
        daily: 10,
        overtime: true,
        shifts: false,
        nightWork: false,
      },
    },
  },
];

// =============================================================================
// Main Test Function
// =============================================================================

async function runTests() {
  console.log('\n┌─────────────────────────────────────────────────────────┐');
  console.log('│  🤖 BZR Portal - AI Hazard Identifier Test             │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  // Check if AI is available
  const isAvailable = aiService.isAvailable();

  if (!isAvailable) {
    console.log('❌ ANTHROPIC_API_KEY nije konfigurisan!\n');
    console.log('Koraci za konfigurisanje:');
    console.log('1. Registruj se na https://console.anthropic.com/');
    console.log('2. Kreiraj API key');
    console.log('3. Dodaj u backend/.env:');
    console.log('   ANTHROPIC_API_KEY=sk-ant-api03-...\n');
    process.exit(1);
  }

  console.log('✅ API Key konfigurisan\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Run tests
  for (const testCase of TEST_CASES) {
    console.log(`\n📋 TEST: ${testCase.name}`);
    console.log('─'.repeat(60));
    console.log(`Позиција: ${testCase.input.positionName}`);
    console.log(`Опис: ${testCase.input.jobDescription}`);
    console.log(`Опрема: ${testCase.input.equipment.join(', ')}`);
    console.log(`Простор: ${testCase.input.workspace}`);
    console.log(`Радно време: ${testCase.input.workHours.daily}h дневно${testCase.input.workHours.overtime ? ' + прековремени' : ''}`);
    console.log('');

    try {
      const startTime = Date.now();
      const result = await aiService.suggestHazards(testCase.input);
      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`✅ AI успешно предложио опасности (${duration}ms)\n`);

        result.suggestions.forEach((suggestion, idx) => {
          console.log(`${idx + 1}. Шифра: ${suggestion.hazardCode} | Поузданост: ${(suggestion.confidence * 100).toFixed(0)}%`);
          console.log(`   💬 ${suggestion.rationale}`);
          console.log('');
        });

        console.log(`📊 Укупно предложено: ${result.suggestions.length} опасности\n`);
      } else {
        console.log(`⚠️  AI fallback - ${result.source}`);
        console.log(`Грешка: ${result.error}`);
        console.log(`Порука кориснику: ${result.userMessage}\n`);
      }
    } catch (error) {
      console.log('❌ ГРЕШКА:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  console.log('\n✅ Сви тестови завршени!\n');
}

// =============================================================================
// Run
// =============================================================================

runTests().catch((error) => {
  console.error('\n❌ КРИТИЧНА ГРЕШКА:', error);
  process.exit(1);
});
