/**
 * Parallel Chunked Processing - Obrada u paraleli sa DeepSeek-om
 * Obrada 5 chunk-ova istovremeno za maksimalnu brzinu
 */

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import OpenAI from 'openai';

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

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

function splitIntoChunks(text: string, maxTokens: number = 7500): string[] {
  const chunks: string[] = [];
  const lines = text.split('\n');

  let currentChunk = '';
  let currentTokens = 0;
  let positionBuffer = '';
  let positionTokens = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTokens = estimateTokens(line);

    const isNewPosition = /^\d+\.\s+[А-ЯЁЊЉЏЂЖЧШЋа-яёњљџђжчшћ\s]+$/u.test(line.trim()) ||
      /^[А-ЯЁЊЉЏЂЖЧШЋ\s]{20,}$/u.test(line.trim());

    if (isNewPosition) {
      if (positionBuffer) {
        if (currentTokens + positionTokens > maxTokens && currentChunk) {
          chunks.push(currentChunk);
          currentChunk = positionBuffer;
          currentTokens = positionTokens;
        } else {
          currentChunk += (currentChunk ? '\n' : '') + positionBuffer;
          currentTokens += positionTokens;
        }
      }

      positionBuffer = line;
      positionTokens = lineTokens;
    } else {
      positionBuffer += (positionBuffer ? '\n' : '') + line;
      positionTokens += lineTokens;
    }
  }

  if (positionBuffer) {
    if (currentTokens + positionTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = positionBuffer;
      currentTokens = positionTokens;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + positionBuffer;
      currentTokens += positionTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function processChunkWithDeepSeek(
  chunk: string,
  chunkIndex: number,
  totalChunks: number
): Promise<Position[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY nije postavljen');
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  const EXTRACTION_PROMPT = `Анализирај следећи део документа систематизације и екстрахуј СВЕ радне позиције из овог дела.

ДОКУМЕНТ (део ${chunkIndex + 1}/${totalChunks}):
${chunk}

За сваку радну позицију екстрахуј:
1. Број позиције (нпр. "1", "2", "3")
2. Назив радног места
3. Детаљан опис послова
4. Одговорности (ако су наведене)
5. Евентуалне опасности/ризике
6. Коме је одговоран
7. Сектор/одељење

Врати JSON у следећем формату (САМО array позиција):

[
  {
    "positionNumber": "1",
    "title": "НАЗИВ РАДНОГ МЕСТА",
    "description": "Детаљан опис...",
    "responsibilities": ["Одговорност 1"],
    "hazards": ["Опасност 1", "Опасност 2"],
    "reportingTo": "директору",
    "sector": "РЈ/Сектор"
  }
]

ВАЖНО:
- Екстрахуј СВЕ позиције из овог дела
- Идентификуј опасности (возила, машине, висине, хемикалије, електрика, буку, вибрације, прах, алергени, стрес)
- Сачувај ћирилицу
- Врати САМО валидан JSON array
- Ако нема позиција, врати []`;

  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Ти си експерт за обраду организационих докумената. Одговараш искључиво валидним JSON-ом.',
        },
        {
          role: 'user',
          content: EXTRACTION_PROMPT,
        },
      ],
      temperature: 0.1,
      max_tokens: 8000,
    });

    const duration = Date.now() - startTime;

    const content = response.choices[0]?.message?.content || '';

    let jsonText = content.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const positions = JSON.parse(jsonText);

    console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks}: ${positions.length} pozicija (${(duration / 1000).toFixed(1)}s)`);

    return positions;

  } catch (error: any) {
    console.error(`❌ Chunk ${chunkIndex + 1}: ${error.message}`);
    writeFileSync(`chunk-error-${chunkIndex + 1}.txt`, chunk, 'utf-8');
    return [];
  }
}

async function processFullDocument(textPath: string) {
  console.log('⚡ PARALLEL Processing - Sistematizacija poslova\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const fullText = readFileSync(textPath, 'utf-8');
  console.log(`📄 Tekst: ${fullText.length} karaktera, ~${estimateTokens(fullText)} tokena\n`);

  const chunks = splitIntoChunks(fullText, 7500);
  console.log(`📦 Podeljeno na ${chunks.length} chunk-ova\n`);

  chunks.forEach((chunk, i) => {
    console.log(`   Chunk ${i + 1}: ~${estimateTokens(chunk)} tokena`);
  });

  const knowledgeBase: KnowledgeBase = {
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

  console.log('\n⚡ PARALELNA OBRADA - 5 chunk-ova istovremeno!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const BATCH_SIZE = 5; // Broj chunk-ova koji se obrađuju istovremeno
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIdx = batchIndex * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, chunks.length);
    const batch = chunks.slice(startIdx, endIdx);

    console.log(`🔄 Batch ${batchIndex + 1}/${totalBatches}: Obrada chunk-ova ${startIdx + 1}-${endIdx}...\n`);

    const batchStartTime = Date.now();

    // PARALELNO obrada svih chunk-ova u batchu
    const batchResults = await Promise.all(
      batch.map((chunk, idx) =>
        processChunkWithDeepSeek(chunk, startIdx + idx, chunks.length)
      )
    );

    const batchDuration = Date.now() - batchStartTime;

    // Dodaj sve rezultate
    batchResults.forEach(positions => {
      knowledgeBase.positions.push(...positions);
    });

    knowledgeBase.totalProcessed = endIdx;

    // Sačuvaj progress
    writeFileSync(
      'sistematizacija-knowledge-base.json',
      JSON.stringify(knowledgeBase, null, 2),
      'utf-8'
    );

    console.log(`\n✅ Batch ${batchIndex + 1} završen za ${(batchDuration / 1000).toFixed(1)}s`);
    console.log(`📊 Ukupno pozicija: ${knowledgeBase.positions.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  knowledgeBase.processingComplete = true;
  writeFileSync(
    'sistematizacija-knowledge-base-final.json',
    JSON.stringify(knowledgeBase, null, 2),
    'utf-8'
  );

  console.log('\n✅ OBRADA ZAVRŠENA!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 Ukupno pozicija: ${knowledgeBase.positions.length}`);

  const bySector: Record<string, number> = {};
  knowledgeBase.positions.forEach((pos) => {
    const sector = pos.sector || 'Ostalo';
    bySector[sector] = (bySector[sector] || 0) + 1;
  });

  console.log(`\n📋 PO SEKTORIMA:\n`);
  Object.keys(bySector)
    .sort((a, b) => bySector[b] - bySector[a])
    .forEach((sector) => {
      console.log(`   ${sector}: ${bySector[sector]} pozicija`);
    });

  const positionsWithHazards = knowledgeBase.positions.filter(
    (p) => p.hazards && p.hazards.length > 0
  );
  console.log(`\n⚠️  Pozicija sa opasnostima: ${positionsWithHazards.length}`);

  const totalHazards = knowledgeBase.positions.reduce((sum, p) => {
    return sum + (p.hazards?.length || 0);
  }, 0);
  console.log(`   Ukupno opasnosti: ${totalHazards}\n`);

  console.log('💾 Baza znanja: sistematizacija-knowledge-base-final.json\n');
}

const textPath = process.argv[2];

if (!textPath) {
  console.error('❌ Molimo navedite putanju do tekstualnog fajla');
  console.log('\nKorišćenje:');
  console.log('  npx tsx src/process-text-parallel.ts <putanja-do-txt>');
  process.exit(1);
}

processFullDocument(textPath).catch((error) => {
  console.error('\n❌ GREŠKA:\n');
  console.error(error.message || error);
  process.exit(1);
});
