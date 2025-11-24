/**
 * Process only failed chunks from previous run
 * Chunk-ovi koji nisu uspeli: 1, 3, 6, 7, 8
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

    console.log(`✅ Chunk ${chunkIndex + 1}: ${positions.length} pozicija (${(duration / 1000).toFixed(1)}s)`);

    return positions;

  } catch (error: any) {
    console.error(`❌ Chunk ${chunkIndex + 1}: ${error.message}`);
    writeFileSync(`chunk-error-retry-${chunkIndex + 1}.txt`, chunk, 'utf-8');
    return [];
  }
}

async function processFailedChunks() {
  console.log('🔄 OBRADA NEUSPELIH CHUNK-OVA\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Učitaj postojeću bazu (33 pozicije)
  let knowledgeBase: KnowledgeBase;
  try {
    const existingData = readFileSync('sistematizacija-knowledge-base-final.json', 'utf-8');
    knowledgeBase = JSON.parse(existingData);
    console.log(`📊 Učitana postojeća baza: ${knowledgeBase.positions.length} pozicija\n`);
  } catch {
    // Ako nema, kreiraj novu
    knowledgeBase = {
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
  }

  // Neuspeli chunk-ovi: 1, 3, 6, 7, 8
  const failedChunkIndices = [1, 3, 6, 7, 8];
  console.log(`📦 Obradiću ${failedChunkIndices.length} neuspelih chunk-ova: ${failedChunkIndices.map(i => i).join(', ')}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const chunkIndex of failedChunkIndices) {
    const chunkPath = `chunk-error-${chunkIndex}.txt`;

    try {
      console.log(`\n🔄 Obrada chunk-a ${chunkIndex} iz ${chunkPath}...\n`);
      const chunk = readFileSync(chunkPath, 'utf-8');

      const positions = await processChunkWithDeepSeek(chunk, chunkIndex - 1, 8);

      if (positions.length > 0) {
        knowledgeBase.positions.push(...positions);
        console.log(`✅ Dodato ${positions.length} novih pozicija`);
        console.log(`📊 Ukupno u bazi: ${knowledgeBase.positions.length} pozicija\n`);

        // Sačuvaj progress
        writeFileSync(
          'sistematizacija-knowledge-base-final.json',
          JSON.stringify(knowledgeBase, null, 2),
          'utf-8'
        );
      }

      // Delay između zahteva
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`❌ Greška pri čitanju ${chunkPath}: ${error.message}\n`);
    }
  }

  knowledgeBase.processingComplete = true;
  knowledgeBase.totalProcessed = 8;

  writeFileSync(
    'sistematizacija-knowledge-base-final.json',
    JSON.stringify(knowledgeBase, null, 2),
    'utf-8'
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ OBRADA ZAVRŠENA!');
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

processFailedChunks().catch((error) => {
  console.error('\n❌ GREŠKA:\n');
  console.error(error.message || error);
  process.exit(1);
});
