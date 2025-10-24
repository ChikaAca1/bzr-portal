/**
 * AI Semantic Caching Test Script (Phase 3b)
 *
 * Demonstrates the semantic caching system:
 * 1. First call: AI (slow, expensive)
 * 2. Same job: Cache hit (instant, free)
 * 3. Similar job (different wording): Semantic cache hit (instant, free)
 * 4. Different job: AI call again
 *
 * Run with: npm run test:ai:cache
 */

import 'dotenv/config';
import { aiService } from './services/ai.service.js';
import { aiCacheService } from './services/ai-cache.service.js';
import type { HazardIdentifierInput } from './lib/ai/agents/hazard-identifier.agent.js';

// =============================================================================
// Test Configuration
// =============================================================================

const TEST_COMPANY_ID = 1; // Mock company ID for testing

// =============================================================================
// Test Cases - Similar Jobs with Different Wording
// =============================================================================

const CLEANER_JOB_VARIATIONS: HazardIdentifierInput[] = [
  // Original job
  {
    positionName: 'Чистач пијаце',
    jobDescription: 'Чисти пијачне површине метлом и лопатом, односи смеће',
    equipment: ['Метла', 'Лопата', 'Корпе за отпад'],
    workspace: 'Отворен пијачни простор',
    workHours: { daily: 8, shifts: false },
  },

  // Same job, different wording (should get cache hit with ~90% similarity)
  {
    positionName: 'Манипулатор отпадака метлом у пијачном простору',
    jobDescription: 'Одржава чистоћу на пијаци користећи метлу, сакупља и односи отпатке',
    equipment: ['Метла за чишћење', 'Лопата', 'Канте за смеће'],
    workspace: 'Пијачни плато на отвореном',
    workHours: { daily: 8, shifts: false },
  },

  // Another variation (should also get cache hit)
  {
    positionName: 'Чистач пијачног платоа',
    jobDescription: 'Одржава хигијену пијачних површина, чисти метлом, одлаже смеће',
    equipment: ['Метла', 'Лопата за смеће'],
    workspace: 'Отворена пијаца',
    workHours: { daily: 8, shifts: false },
  },
];

const PROGRAMMER_JOB: HazardIdentifierInput = {
  positionName: 'Програмер',
  jobDescription: 'Пише код за веб апликације, учествује у team meeting-има',
  equipment: ['Компјутер', '2 монитора'],
  workspace: 'Канцеларија',
  workHours: { daily: 8, overtime: true },
};

// =============================================================================
// Test Execution
// =============================================================================

async function runCacheTests() {
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│  🧠 BZR Portal - Semantic Caching Test                     │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  // Clear cache for clean test
  console.log('🗑️  Clearing cache for clean test...\n');
  await aiCacheService.clear(TEST_COMPANY_ID);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== TEST 1: Initial call (cache miss) =====
  console.log('📋 TEST 1: Чистач пијаце (PRVI PUT - AI poziv)');
  console.log('─'.repeat(60));

  const start1 = Date.now();
  const result1 = await aiService.suggestHazards(CLEANER_JOB_VARIATIONS[0], TEST_COMPANY_ID);
  const duration1 = Date.now() - start1;

  if (result1.success) {
    console.log(`✅ Izvor: ${result1.source} | Vreme: ${duration1}ms`);
    console.log(`   Predloženo opasnosti: ${result1.suggestions.length}`);
    result1.suggestions.forEach((s, i) => {
      console.log(`   ${i + 1}. Šifra ${s.hazardCode} (${(s.confidence * 100).toFixed(0)}%)`);
    });
  } else {
    console.log(`❌ Greška: ${result1.error}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== TEST 2: Same job (exact cache hit) =====
  console.log('📋 TEST 2: Čistač pijace (ISTI POSAO - očekujem cache hit)');
  console.log('─'.repeat(60));

  const start2 = Date.now();
  const result2 = await aiService.suggestHazards(CLEANER_JOB_VARIATIONS[0], TEST_COMPANY_ID);
  const duration2 = Date.now() - start2;

  if (result2.success) {
    console.log(`✅ Izvor: ${result2.source} | Vreme: ${duration2}ms`);
    if (result2.source === 'CACHE') {
      console.log(`   🎯 Sličnost: ${((result2.similarity || 0) * 100).toFixed(1)}%`);
      console.log(`   ⚡ Ubrzanje: ${(duration1 / duration2).toFixed(1)}x brže!`);
      console.log(`   💰 Ušteda: $${((duration1 / 1000) * 0.003).toFixed(4)}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== TEST 3: Similar job, different wording (semantic cache hit) =====
  console.log('📋 TEST 3: Manipulator otpadaka (SLIČNI POSAO - semantic match)');
  console.log('─'.repeat(60));
  console.log('Opis: "Održava čistoću na pijaci..." (drugačije reči, isti posao)');

  const start3 = Date.now();
  const result3 = await aiService.suggestHazards(CLEANER_JOB_VARIATIONS[1], TEST_COMPANY_ID);
  const duration3 = Date.now() - start3;

  if (result3.success) {
    console.log(`✅ Izvor: ${result3.source} | Vreme: ${duration3}ms`);
    if (result3.source === 'CACHE') {
      console.log(`   🎯 Sličnost: ${((result3.similarity || 0) * 100).toFixed(1)}%`);
      console.log(`   🧠 Sistem prepoznao slične poslove!`);
      console.log(`   ⚡ Ubrzanje: ${(duration1 / duration3).toFixed(1)}x brže!`);
    } else if (result3.source === 'AI') {
      console.log(`   ⚠️  Cache miss - sličnost ispod praga (threshold: 85%)`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== TEST 4: Another variation =====
  console.log('📋 TEST 4: Čistač pijačnog platoa (TREĆA VARIJACIJA)');
  console.log('─'.repeat(60));

  const start4 = Date.now();
  const result4 = await aiService.suggestHazards(CLEANER_JOB_VARIATIONS[2], TEST_COMPANY_ID);
  const duration4 = Date.now() - start4;

  if (result4.success) {
    console.log(`✅ Izvor: ${result4.source} | Vreme: ${duration4}ms`);
    if (result4.source === 'CACHE') {
      console.log(`   🎯 Sličnost: ${((result4.similarity || 0) * 100).toFixed(1)}%`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== TEST 5: Different job (cache miss) =====
  console.log('📋 TEST 5: Programer (POTPUNO DRUGAČIJI POSAO - AI poziv)');
  console.log('─'.repeat(60));

  const start5 = Date.now();
  const result5 = await aiService.suggestHazards(PROGRAMMER_JOB, TEST_COMPANY_ID);
  const duration5 = Date.now() - start5;

  if (result5.success) {
    console.log(`✅ Izvor: ${result5.source} | Vreme: ${duration5}ms`);
    console.log(`   Predloženo opasnosti: ${result5.suggestions.length}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== Cache Statistics =====
  console.log('📊 CACHE STATISTIKA');
  console.log('─'.repeat(60));

  const stats = await aiCacheService.getStats(TEST_COMPANY_ID);
  console.log(`Ukupno u cache-u: ${stats.totalEntries} poslova`);
  console.log(`Ukupno reuse-ovanja: ${stats.totalReuses}`);
  console.log(`Prosečna pouzdanost: ${(stats.avgConfidence * 100).toFixed(1)}%`);

  if (stats.topPositions.length > 0) {
    console.log('\nNajčešće korišćeni poslovi:');
    stats.topPositions.forEach((pos, i) => {
      console.log(`  ${i + 1}. ${pos.position} (${pos.usageCount}x)`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ===== Summary =====
  console.log('📈 REZIME');
  console.log('─'.repeat(60));

  const totalCalls = 5;
  const aiCalls = [result1, result3, result5].filter((r) => r.success && r.source === 'AI').length;
  const cacheCalls = [result2, result4].filter((r) => r.success && r.source === 'CACHE').length;
  const cacheHitRate = (cacheCalls / totalCalls) * 100;

  console.log(`Ukupno poziva: ${totalCalls}`);
  console.log(`AI pozivi: ${aiCalls} (~$${(aiCalls * 0.003).toFixed(3)})`);
  console.log(`Cache hits: ${cacheCalls} ($0)`);
  console.log(`Cache hit rate: ${cacheHitRate.toFixed(0)}%`);

  const avgAiTime = [duration1, duration5].reduce((a, b) => a + b, 0) / 2;
  const avgCacheTime = duration2; // Example
  console.log(`\nProsečno vreme (AI): ${avgAiTime.toFixed(0)}ms`);
  console.log(`Prosečno vreme (Cache): ${avgCacheTime.toFixed(0)}ms`);
  console.log(`Ubrzanje: ${(avgAiTime / avgCacheTime).toFixed(1)}x\n`);

  console.log('✅ Svi testovi završeni!\n');
}

// =============================================================================
// Run
// =============================================================================

runCacheTests().catch((error) => {
  console.error('\n❌ KRITIČNA GREŠKA:', error);
  process.exit(1);
});
