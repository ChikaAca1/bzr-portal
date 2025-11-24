/**
 * Create chunk files for missing positions
 * Ranges: 1-17, 26-45, 79-93, 117-137
 */

import { readFileSync, writeFileSync } from 'fs';

const fullText = readFileSync(
  'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\opis posla 137 radnih mesta.md.txt',
  'utf-8'
);

function extractChunk(startPos: number, endPos: number): string {
  // Find start position
  const startPattern = new RegExp(`^${startPos}\\.\\s+[А-ЯЁЊЉЏЂЖЧШЋа-яёњљџђжчшћ\\s]+$`, 'm');
  const startMatch = fullText.match(startPattern);

  if (!startMatch || startMatch.index === undefined) {
    console.error(`❌ Није пронађена позиција ${startPos}`);
    return '';
  }

  const startIndex = startMatch.index;

  // Find end position (next position after endPos)
  const nextPosPattern = new RegExp(`^${endPos + 1}\\.\\s+[А-ЯЁЊЉЏЂЖЧШЋа-яёњљџђжчшћ\\s]+$`, 'm');
  const nextPosMatch = fullText.substring(startIndex + 1).match(nextPosPattern);

  let chunk: string;
  if (nextPosMatch && nextPosMatch.index !== undefined) {
    chunk = fullText.substring(startIndex, startIndex + 1 + nextPosMatch.index);
  } else {
    // Take until end
    chunk = fullText.substring(startIndex);
  }

  return chunk;
}

const ranges = [
  { start: 1, end: 17, name: 'chunk-missing-1-17' },
  { start: 26, end: 45, name: 'chunk-missing-26-45' },
  { start: 79, end: 93, name: 'chunk-missing-79-93' },
  { start: 117, end: 137, name: 'chunk-missing-117-137' },
];

console.log('🔄 Креирање chunk фајлова за екстракцију...\n');

for (const range of ranges) {
  const chunk = extractChunk(range.start, range.end);

  if (chunk) {
    writeFileSync(`${range.name}.txt`, chunk, 'utf-8');
    console.log(
      `✅ ${range.name}.txt (${chunk.length} карактера, ${range.end - range.start + 1} позиција)`
    );
  }
}

console.log('\n✅ Chunk фајлови креирани!');
