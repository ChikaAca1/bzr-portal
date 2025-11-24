/**
 * Benchmark различитих формата докумената
 * Тестира PDF vs TXT vs DOCX за BZR систем
 */

import { DocumentProcessor } from './services/document-processor';
import { readFileSync, existsSync } from 'fs';

interface BenchmarkResult {
  format: string;
  fileSize: number;
  extractionTime: number;
  textLength: number;
  charactersPerMs: number;
  rating: string;
}

async function benchmarkFormats() {
  console.log('🏁 BENCHMARK ФОРМАТА ДОКУМЕНАТА ЗА BZR СИСТЕМ\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const results: BenchmarkResult[] = [];

  // Test files (претпостављамо да их имаш)
  const testFiles = [
    {
      path: 'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\opis posla 137 radnih mesta.md.txt',
      format: 'TXT',
    },
    {
      path: 'D:\\Users\\User\\Dropbox\\POSO\\Sluzba bezbednosti 2012\\2018\\Sistematizacija\\sistematizacija mart 2025\\ОПИС ПОСЛОВА  2025..pdf',
      format: 'PDF',
    },
    // Додај DOCX ако имаш
  ];

  for (const testFile of testFiles) {
    if (!existsSync(testFile.path)) {
      console.log(`⚠️  Фајл не постоји: ${testFile.format}\n`);
      continue;
    }

    console.log(`\n📊 Тестирање: ${testFile.format}`);
    console.log('─'.repeat(50));

    const fileSize = readFileSync(testFile.path).length;
    console.log(`   Величина фајла: ${(fileSize / 1024).toFixed(2)} KB`);

    try {
      const startTime = Date.now();
      const result = await DocumentProcessor.processDocument(testFile.path);
      const extractionTime = Date.now() - startTime;

      if (!result.success) {
        console.log(`   ❌ Неуспешна обрада: ${result.error}\n`);
        continue;
      }

      const charactersPerMs = result.textContent.length / extractionTime;

      // Рејтинг на основу брзине
      let rating: string;
      if (extractionTime < 100) rating = '⚡ Одлично';
      else if (extractionTime < 500) rating = '✅ Добро';
      else if (extractionTime < 2000) rating = '⚠️  Прихватљиво';
      else rating = '❌ Споро';

      console.log(`   Време екстракције: ${extractionTime}ms`);
      console.log(`   Дужина текста: ${result.textContent.length} карактера`);
      console.log(`   Брзина: ${charactersPerMs.toFixed(2)} chars/ms`);
      console.log(`   Рејтинг: ${rating}\n`);

      results.push({
        format: testFile.format,
        fileSize,
        extractionTime,
        textLength: result.textContent.length,
        charactersPerMs,
        rating,
      });
    } catch (error: any) {
      console.log(`   ❌ Грешка: ${error.message}\n`);
    }
  }

  // Упоредни резултати
  if (results.length > 1) {
    console.log('\n📈 УПОРЕДНИ РЕЗУЛТАТИ\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Сортирај по брзини
    results.sort((a, b) => a.extractionTime - b.extractionTime);

    console.log('| Формат | Величина | Екстракција | Брзина | Рејтинг |');
    console.log('|--------|----------|-------------|--------|---------|');

    results.forEach(r => {
      const sizeKB = (r.fileSize / 1024).toFixed(2);
      const speed = r.charactersPerMs.toFixed(2);
      console.log(
        `| ${r.format.padEnd(6)} | ${sizeKB.padEnd(8)} KB | ${r.extractionTime.toString().padEnd(11)} ms | ${speed.padEnd(6)} c/ms | ${r.rating} |`
      );
    });

    // Победник
    const winner = results[0];
    console.log(`\n🏆 ПОБЕДНИК: ${winner.format}`);
    console.log(`   Најбржи за ${winner.extractionTime}ms\n`);

    // Процена за AI обраду
    console.log('💡 ПРОЦЕНА ЗА AI ОБРАДУ:\n');

    results.forEach(r => {
      // AI обрада обично траје 2-5 секунди по chunk-у
      // Претпоставимо ~10,000 карактера по chunk-у
      const chunks = Math.ceil(r.textLength / 10000);
      const estimatedAITime = chunks * 3000; // 3 секунде по chunk-у
      const totalTime = r.extractionTime + estimatedAITime;

      console.log(`   ${r.format}:`);
      console.log(`     Екстракција: ${r.extractionTime}ms`);
      console.log(`     AI обрада: ~${(estimatedAITime / 1000).toFixed(1)}s (${chunks} chunks)`);
      console.log(
        `     УКУПНО: ~${(totalTime / 1000).toFixed(1)}s (${((r.extractionTime / totalTime) * 100).toFixed(1)}% екстракција)\n`
      );
    });

    // Препорука
    console.log('📋 ПРЕПОРУКА:\n');

    if (winner.extractionTime < 200 && winner.format === 'TXT') {
      console.log(
        '   ✅ TXT формат је НАЈЕФИКАСНИЈИ за AI обраду у овом систему.'
      );
      console.log(
        '   💡 Препорука: Конвертуј PDF → TXT на серверу, затим AI обрада.\n'
      );
      console.log('   Разлог: Екстракција је занемарљива (~1% укупног времена),');
      console.log('           док AI обрада доминира (99% времена).\n');
    } else if (winner.format === 'PDF') {
      console.log(
        '   ⚠️  PDF екстракција је брза, али може бити непоуздана за табеле.'
      );
      console.log(
        '   💡 Препорука: Користи PDF директно, али валидирај резултате.\n'
      );
    }
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

// Покрени benchmark
benchmarkFormats().catch(console.error);
