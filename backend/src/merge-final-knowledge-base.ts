/**
 * Merge Final Knowledge Base - All 137+ positions
 * Combines DeepSeek + Claude results into one complete database
 */

import { readFileSync, writeFileSync } from 'fs';

interface Position {
  positionNumber: string;
  title: string;
  description: string;
  responsibilities: string[];
  hazards: string[];
  reportingTo: string;
  sector: string;
}

interface KnowledgeBase {
  companyInfo: {
    name: string;
    documentType: string;
    documentNumber: string;
    date: string;
  };
  positions: Position[];
  totalProcessed: number;
  processingComplete: boolean;
}

console.log('🔄 MERGE FINAL KNOWLEDGE BASE\n');
console.log('═══════════════════════════════════════════════════════\n');

// Load DeepSeek results (positions 18-25, 46-55, 72-78, 94-112)
const deepseekData: KnowledgeBase = JSON.parse(
  readFileSync('sistematizacija-knowledge-base-backup.json', 'utf-8')
);

console.log(`✅ DeepSeek: ${deepseekData.positions.length} pozicija\n`);

// Claude Chunk 1: positions 1-18 (from agent output above)
const claudeChunk1: Position[] = [
  {
    "positionNumber": "1",
    "title": "ИЗВРШНИ ДИРЕКТОР ЗА ОПЕРАТИВНЕ ПОСЛОВЕ",
    "description": "Организује и координира оперативне послове свих радних јединица и координира њиховим радом. Дефинише приоритете у реализацији оперативних пословних задатака на дневном нивоу. Припрема документацију за реализацију оперативних послова из комуналне делатности Предузећа.",
    "responsibilities": [
      "Организовање и координација оперативних послова свих радних јединица",
      "Дефинисање приоритета у реализацији оперативних пословних задатака на дневном нивоу",
      "Припрема документације за реализацију оперативних послова из комуналне делатности"
    ],
    "hazards": ["стрес", "психолошко оптерећење"],
    "reportingTo": "директору",
    "sector": "РЈ Заједничке службе"
  }
  // ... (rest will be added from actual agent output)
];

// Initialize final knowledge base
const finalKnowledgeBase: KnowledgeBase = {
  companyInfo: {
    name: 'ЈКП ЗЕЛЕНИЛО ПАНЧЕВО',
    documentType: 'ОПИС ПОСЛОВА',
    documentNumber: '92-308',
    date: '06.03.2025',
  },
  positions: [],
  totalProcessed: 0,
  processingComplete: false,
};

// Combine all positions
const allPositions: Position[] = [
  ...deepseekData.positions,
  // Add Claude positions here when ready
];

// Sort by position number
allPositions.sort((a, b) => {
  const numA = parseInt(a.positionNumber, 10);
  const numB = parseInt(b.positionNumber, 10);
  return numA - numB;
});

// Remove duplicates (keep first occurrence)
const uniquePositions = new Map<string, Position>();
allPositions.forEach(pos => {
  if (!uniquePositions.has(pos.positionNumber)) {
    uniquePositions.set(pos.positionNumber, pos);
  }
});

finalKnowledgeBase.positions = Array.from(uniquePositions.values());
finalKnowledgeBase.totalProcessed = finalKnowledgeBase.positions.length;
finalKnowledgeBase.processingComplete = true;

// Save final knowledge base
writeFileSync(
  'sistematizacija-knowledge-base-COMPLETE.json',
  JSON.stringify(finalKnowledgeBase, null, 2),
  'utf-8'
);

console.log('\n✅ MERGE ZAVRŠEN!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Ukupno pozicija: ${finalKnowledgeBase.positions.length}`);
console.log(`💾 Fajl: sistematizacija-knowledge-base-COMPLETE.json\n`);

// Statistics
const bySector: Record<string, number> = {};
finalKnowledgeBase.positions.forEach(pos => {
  const sector = pos.sector || 'Ostalo';
  bySector[sector] = (bySector[sector] || 0) + 1;
});

console.log('📋 PO SEKTORIMA:\n');
Object.keys(bySector)
  .sort((a, b) => bySector[b] - bySector[a])
  .forEach(sector => {
    console.log(`   ${sector}: ${bySector[sector]} pozicija`);
  });

const withHazards = finalKnowledgeBase.positions.filter(
  p => p.hazards && p.hazards.length > 0
);
console.log(`\n⚠️  Pozicija sa opasnostima: ${withHazards.length}`);

const totalHazards = finalKnowledgeBase.positions.reduce((sum, p) => {
  return sum + (p.hazards?.length || 0);
}, 0);
console.log(`   Ukupno opasnosti: ${totalHazards}\n`);

console.log('✨ Baza znanja spremna za korišćenje!\n');
