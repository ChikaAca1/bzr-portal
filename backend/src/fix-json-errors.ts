/**
 * Fix JSON parsing errors in Claude position files
 */

import { readFileSync, writeFileSync } from 'fs';

const files = [
  'claude-positions-1-17.json',
  'claude-positions-26-45.json',
  'claude-positions-79-93.json',
  'claude-positions-117-137.json',
];

for (const filename of files) {
  console.log(`\n🔍 Проверавам ${filename}...`);

  try {
    const content = readFileSync(filename, 'utf-8');
    const parsed = JSON.parse(content);
    console.log(`   ✅ JSON је валидан (${parsed.length} позиција)`);
  } catch (error: any) {
    console.log(`   ❌ JSON грешка: ${error.message}`);

    // Try to extract position information
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      const content = readFileSync(filename, 'utf-8');

      console.log(`   📍 Контекст око грешке (позиција ${pos}):`);
      console.log(`   "${content.substring(Math.max(0, pos - 50), pos + 50)}"`);

      // Try to find and fix common issues
      let fixed = content;

      // Fix unescaped quotes in Serbian text (common with „ and ")
      // This is a simple fix - may need manual adjustment
      console.log(`\n   🔧 Покушавам аутоматску поправку...`);

      // Parse line by line to find the issue
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        try {
          // Try to parse up to this line
          const partial = lines.slice(0, i + 1).join('\n');
          JSON.parse(partial + '\n]'); // Try to close the array
        } catch (e: any) {
          if (e.message.includes('Unexpected token')) {
            console.log(`   ⚠️  Проблем на линији ${i + 1}: ${lines[i].substring(0, 100)}...`);
          }
        }
      }
    }
  }
}
