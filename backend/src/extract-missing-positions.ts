/**
 * Extract missing positions from the document
 * Missing ranges: 1-17, 26-45, 79-93, 117-137
 */

import { readFileSync, writeFileSync } from 'fs';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface Position {
  positionNumber: string;
  title: string;
  description: string;
  responsibilities: string[];
  hazards: string[];
  reportingTo: string;
  sector: string;
}

// Read the source document
const fullText = readFileSync(
  'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\opis posla 137 radnih mesta.md.txt',
  'utf-8'
);

const EXTRACTION_PROMPT = `Екстрахуј САМО радне позиције у наведеном опсегу из овог документа.

За СВАКУ позицију екстрахуј:
1. positionNumber - број позиције (нпр. "1", "2", "3")
2. title - назив радног места (на ћирилици)
3. description - комплетан опис послова
4. responsibilities - array одговорности
5. hazards - array опасности (возила, машине, висине, хемикалије, електрика, буку, вибрације, прах, алергени, стрес, временски услови, итд.)
6. reportingTo - коме је одговоран
7. sector - сектор/РЈ

Врати САМО валидан JSON array без додатног текста:
[
  {
    "positionNumber": "X",
    "title": "...",
    "description": "...",
    "responsibilities": [...],
    "hazards": [...],
    "reportingTo": "...",
    "sector": "..."
  }
]`;

async function extractRange(startPos: number, endPos: number): Promise<Position[]> {
  console.log(`\n🔄 Екстраховање позиција ${startPos}-${endPos}...`);

  // Find start and end positions in text
  const startPattern = new RegExp(`^${startPos}\\.\\s+[А-ЯЁЊЉЏЂЖЧШЋа-яёњљџђжчшћ\\s]+$`, 'm');
  const endPattern = new RegExp(`^${endPos + 1}\\.\\s+[А-ЯЁЊЉЏЂЖЧШЋа-яёњљџђжчшћ\\s]+$`, 'm');

  const startMatch = fullText.match(startPattern);
  if (!startMatch || startMatch.index === undefined) {
    console.error(`❌ Није пронађена позиција ${startPos}`);
    return [];
  }

  const startIndex = startMatch.index;
  const endMatch = fullText.substring(startIndex + 1).match(endPattern);

  let chunk: string;
  if (endMatch && endMatch.index !== undefined) {
    chunk = fullText.substring(startIndex, startIndex + 1 + endMatch.index);
  } else {
    // If no next position found, take until end of document
    chunk = fullText.substring(startIndex);
  }

  console.log(`   Chunk величина: ${chunk.length} карактера`);

  const prompt = `${EXTRACTION_PROMPT}\n\nЕКСТРАХУЈ САМО ПОЗИЦИЈЕ ${startPos}-${endPos}:\n\n${chunk}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const text = content.text.trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    if (text.startsWith('```')) {
      const match = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const positions = JSON.parse(jsonText) as Position[];
    console.log(`   ✅ Екстраховано ${positions.length} позиција`);

    return positions;
  } catch (error) {
    console.error(`   ❌ Грешка:`, error);
    return [];
  }
}

async function main() {
  console.log('🚀 ЕКСТРАКЦИЈА НЕДОСТАЈУЋИХ ПОЗИЦИЈА\n');
  console.log('════════════════════════════════════════\n');

  const ranges = [
    { start: 1, end: 17 },
    { start: 26, end: 45 },
    { start: 79, end: 93 },
    { start: 117, end: 137 },
  ];

  const allPositions: Position[] = [];

  for (const range of ranges) {
    const positions = await extractRange(range.start, range.end);
    allPositions.push(...positions);

    // Save partial results
    writeFileSync(
      `claude-positions-${range.start}-${range.end}.json`,
      JSON.stringify(positions, null, 2),
      'utf-8'
    );

    // Wait a bit to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ УКУПНО ЕКСТРАХОВАНО: ${allPositions.length} позиција\n`);

  // Save all extracted positions
  writeFileSync(
    'claude-missing-positions-all.json',
    JSON.stringify(allPositions, null, 2),
    'utf-8'
  );

  console.log('💾 Сачувано у: claude-missing-positions-all.json\n');
}

main().catch(console.error);
