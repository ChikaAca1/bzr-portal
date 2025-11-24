/**
 * Merge all position data into complete knowledge base
 * Sources:
 * - sistematizacija-knowledge-base.json (64 positions: 18-25, 46-78, 94-116)
 * - claude-positions-1-17.json (17 positions)
 * - claude-positions-26-45.json (20 positions)
 * - claude-positions-79-93.json (15 positions)
 * - claude-positions-117-137.json (20 positions)
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

console.log('🔄 СПАЈАЊЕ СВИХ ПОЗИЦИЈА У ЈЕДИНСТВЕНУ БАЗУ\n');
console.log('═══════════════════════════════════════════════════════\n');

// Load existing positions (18-116)
const existingData: KnowledgeBase = JSON.parse(
  readFileSync('sistematizacija-knowledge-base.json', 'utf-8')
);

console.log(`✅ Учитано ${existingData.positions.length} позиција из постојеће базе`);

// Load Claude extracted positions
const claude1_17: Position[] = JSON.parse(
  readFileSync('claude-positions-1-17.json', 'utf-8')
);
console.log(`✅ Учитано ${claude1_17.length} позиција (1-17)`);

const claude26_45: Position[] = JSON.parse(
  readFileSync('claude-positions-26-45.json', 'utf-8')
);
console.log(`✅ Учитано ${claude26_45.length} позиција (26-45)`);

const claude79_93: Position[] = JSON.parse(
  readFileSync('claude-positions-79-93.json', 'utf-8')
);
console.log(`✅ Учитано ${claude79_93.length} позиција (79-93)`);

const claude117_137: Position[] = JSON.parse(
  readFileSync('claude-positions-117-137.json', 'utf-8')
);
console.log(`✅ Учитано ${claude117_137.length} позиција (117-136)\n`);

// Combine all positions
const allPositions: Position[] = [
  ...existingData.positions,
  ...claude1_17,
  ...claude26_45,
  ...claude79_93,
  ...claude117_137,
];

console.log(`📊 Укупно позиција пре дедупликације: ${allPositions.length}\n`);

// Sort by position number
allPositions.sort((a, b) => {
  const numA = parseInt(a.positionNumber, 10);
  const numB = parseInt(b.positionNumber, 10);
  return numA - numB;
});

// Remove duplicates (keep first occurrence)
const uniquePositions = new Map<string, Position>();
const duplicates: string[] = [];

allPositions.forEach(pos => {
  if (uniquePositions.has(pos.positionNumber)) {
    duplicates.push(pos.positionNumber);
  } else {
    uniquePositions.set(pos.positionNumber, pos);
  }
});

if (duplicates.length > 0) {
  console.log(`⚠️  Пронађени дупликати (уклоњени): ${duplicates.join(', ')}\n`);
}

// Create final knowledge base
const finalKnowledgeBase: KnowledgeBase = {
  companyInfo: {
    name: 'ЈКП ЗЕЛЕНИЛО ПАНЧЕВО',
    documentType: 'ОПИС ПОСЛОВА',
    documentNumber: '92-308',
    date: '06.03.2025',
  },
  positions: Array.from(uniquePositions.values()),
  totalProcessed: uniquePositions.size,
  processingComplete: true,
};

// Save final knowledge base
writeFileSync(
  'sistematizacija-knowledge-base-COMPLETE.json',
  JSON.stringify(finalKnowledgeBase, null, 2),
  'utf-8'
);

console.log('✅ СПАЈАЊЕ ЗАВРШЕНО!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Укупно позиција: ${finalKnowledgeBase.positions.length}`);
console.log(`💾 Фајл: sistematizacija-knowledge-base-COMPLETE.json\n`);

// Generate statistics
const bySector: Record<string, number> = {};
finalKnowledgeBase.positions.forEach(pos => {
  const sector = pos.sector || 'Остало';
  bySector[sector] = (bySector[sector] || 0) + 1;
});

console.log('📋 ПО СЕКТОРИМА:\n');
Object.keys(bySector)
  .sort((a, b) => bySector[b] - bySector[a])
  .forEach(sector => {
    console.log(`   ${sector}: ${bySector[sector]} позиција`);
  });

const withHazards = finalKnowledgeBase.positions.filter(
  p => p.hazards && p.hazards.length > 0
);
console.log(`\n⚠️  Позиција са опасностима: ${withHazards.length}`);

const totalHazards = finalKnowledgeBase.positions.reduce((sum, p) => {
  return sum + (p.hazards?.length || 0);
}, 0);
console.log(`   Укупно опасности: ${totalHazards}\n`);

// Check for gaps
const positionNumbers = finalKnowledgeBase.positions.map(p => parseInt(p.positionNumber));
const gaps: string[] = [];
for (let i = 1; i <= 136; i++) {
  if (!positionNumbers.includes(i)) {
    gaps.push(i.toString());
  }
}

if (gaps.length > 0) {
  console.log(`❌ НЕДОСТАЈУЋЕ ПОЗИЦИЈЕ: ${gaps.join(', ')}\n`);
} else {
  console.log(`✅ СВЕ ПОЗИЦИЈЕ 1-136 СУ ПРИСУТНЕ!\n`);
}

console.log('✨ База знања спремна за коришћење!\n');
