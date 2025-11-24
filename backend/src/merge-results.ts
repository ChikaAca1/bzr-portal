/**
 * Merge all extracted positions from DeepSeek and Claude results
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

interface CompanyInfo {
  name: string;
  documentType: string;
  documentNumber: string;
  date: string;
}

interface KnowledgeBase {
  companyInfo: CompanyInfo;
  positions: Position[];
  totalProcessed: number;
  processingComplete: boolean;
}

// DeepSeek results - chunk 2, 4, 5 (33 positions)
const deepseekFile = 'sistematizacija-knowledge-base-backup.json';

// Claude results from parallel agents
const claudeChunk1 = `[
  {
    "positionNumber": "1",
    "title": "ИЗВРШНИ ДИРЕКТОР ЗА ОПЕРАТИВНЕ ПОСЛОВЕ",
    "description": "Организује и координира оперативне послове свих радних јединица и координира њиховим радом. Дефинише приоритете у реализацији оперативних пословних задатака на дневном нивоу. Припрема документацију за реализацију оперативних послова из комуналне делатности Предузећа.",
    "responsibilities": [
      "Организовање и координација оперативних послова свих радних јединица",
      "Дефинисање приоритета у реализацији оперативних пословних задатака на дневном нивоу",
      "Припрема документације за реализацију оперативних послова из комуналне делатности",
      "Пружање објашњења и стручне помоћи у обављању послова из свог делокруга"
    ],
    "hazards": [
      "стрес",
      "психолошко оптерећење"
    ],
    "reportingTo": "директору",
    "sector": "РЈ Заједничке службе"
  }
]`;

const claudeChunk3 = `[{"positionNumber":"26","title":"КООРДИНАТОР ЗА НАПЛАТУ ПОТРАЖИВАЊА И ФУК"}]`;
const claudeChunk6 = `[{"positionNumber":"61","title":"ВОЗАЧ-РУКОВАЛАЦ"}]`;
const claudeChunk7 = `[{"positionNumber":"79","title":"ПОМОЋНИ РАДНИК"}]`;
const claudeChunk8 = `[{"positionNumber":"116","title":"ШЕФ ПРОДАЈЕ И НАБАВКЕ"}]`;

console.log('🔄 MERGE RESULTS - Kombinovanje svih ekstrahovanih pozicija\n');
console.log('═══════════════════════════════════════════════════════\n');

try {
  // Load DeepSeek results (33 positions from chunks 2, 4, 5)
  const deepseekData: KnowledgeBase = JSON.parse(readFileSync(deepseekFile, 'utf-8'));
  console.log(`✅ DeepSeek rezultati: ${deepseekData.positions.length} pozicija (chunk 2, 4, 5)\n`);

  // Positions from Claude agents will be provided as output
  console.log('📊 Čekam Claude rezultate iz agent output-a...\n');
  console.log('💡 Molim da kopirate JSON output iz svakog agenta i pokrenete merge!\n');

} catch (error: any) {
  console.error('❌ Greška:', error.message);
}
