/**
 * Анализира DOCX темплејт за Акт о процени ризика
 * Екстрахује структуру и идентификује поља за Mustache плејсхолдере
 */

import * as mammoth from 'mammoth';
import { readFileSync, writeFileSync } from 'fs';

async function analyzeTemplate() {
  console.log('📄 АНАЛИЗА ТЕМПЛЕЈТА - АКТ О ПРОЦЕНИ РИЗИКА\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const templatePath =
    'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\Aкт - 2025 (1)docx.docx';

  try {
    // Екстрахуј raw текст
    console.log('🔍 Екстраховање текста из DOCX...\n');
    const buffer = readFileSync(templatePath);
    const result = await mammoth.extractRawText({ buffer });

    console.log(`✅ Екстраховано ${result.text.length} карактера\n`);

    // Сачувај текст за анализу
    writeFileSync(
      'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\bzr-portal\\backend\\template-text.txt',
      result.text,
      'utf-8'
    );

    console.log('💾 Текст сачуван у: template-text.txt\n');

    // Анализирај структуру
    console.log('📊 СТРУКТУРА ДОКУМЕНТА:\n');
    console.log('─'.repeat(50));

    const lines = result.text.split('\n').filter(line => line.trim());

    // Пронађи заглавље
    console.log('\n📌 ЗАГЛАВЉЕ:');
    lines.slice(0, 10).forEach((line, i) => {
      console.log(`   ${i + 1}. ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
    });

    // Пронађи табеле (обично имају много бројева или |)
    console.log('\n📊 ПОТЕНЦИЈАЛНЕ ТАБЕЛЕ:');
    const tableLines = lines.filter(
      line => line.includes('|') || /\d+\.\d+/.test(line) || line.split('\t').length > 3
    );
    tableLines.slice(0, 5).forEach((line, i) => {
      console.log(`   ${i + 1}. ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
    });

    // Идентификуј поља која треба заменити
    console.log('\n🔑 ПОТЕНЦИЈАЛНА ПОЉА ЗА ЗАМЕНУ:\n');

    const patterns = {
      companyName: /ЈКП\s+["„]?[А-ЯЁЊЉЏЂЖЧШЋ\s]+[""]?/g,
      employeeName: /[А-ЯЁЊЉЏЂЖЧШЋ][а-яёњљџђжчшћ]+\s+[А-ЯЁЊЉЏЂЖЧШЋ][а-яёњљџђжчшћ]+/g,
      date: /\d{2}\.\d{2}\.\d{4}\.?/g,
      coefficient: /\d+[.,]\d{2}/g,
      jmbg: /\d{13}/g,
    };

    for (const [field, pattern] of Object.entries(patterns)) {
      const matches = result.text.match(pattern);
      if (matches) {
        const unique = [...new Set(matches)].slice(0, 5);
        console.log(`   ${field}:`);
        unique.forEach(m => console.log(`      → "${m}"`));
        console.log();
      }
    }

    // Пронађи секције
    console.log('📑 СЕКЦИЈЕ ДОКУМЕНТА:\n');
    const sections = lines.filter(
      line =>
        line.length < 100 &&
        (line.includes(':') ||
          line.match(/^[IVX]+\./) ||
          line.match(/^\d+\./) ||
          line.toUpperCase() === line)
    );
    sections.slice(0, 15).forEach((line, i) => {
      console.log(`   ${i + 1}. ${line}`);
    });

    // Статистика
    console.log('\n\n📈 СТАТИСТИКА:\n');
    console.log(`   Укупно линија: ${lines.length}`);
    console.log(`   Укупно карактера: ${result.text.length}`);
    console.log(`   Просечна дужина линије: ${(result.text.length / lines.length).toFixed(0)} chars`);

    // Препорука за плејсхолдере
    console.log('\n\n💡 ПРЕПОРУЧЕНИ MUSTACHE ПЛЕЈСХОЛДЕРИ:\n');
    console.log('   {{companyName}} - Назив предузећа');
    console.log('   {{companyAddress}} - Адреса');
    console.log('   {{employeeName}} - Име и презиме запосленог');
    console.log('   {{employeeJMBG}} - ЈМБГ');
    console.log('   {{positionTitle}} - Назив радног места');
    console.log('   {{positionNumber}} - Број позиције');
    console.log('   {{coefficient}} - Коефицијент');
    console.log('   {{assessmentDate}} - Датум процене');
    console.log('   {{assessorName}} - Име процењивача');
    console.log('   {{assessorLicense}} - Лиценца процењивача');
    console.log('   {{risks}} - Табела ризика (динамички низ)');
    console.log('   {{preventiveMeasures}} - Превентивне мере (динамички низ)');
    console.log('   {{ppe}} - ЛЗО - Лична заштитна опрема (динамички низ)\n');

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ Анализа завршена!\n');
    console.log('📁 Прегледај: template-text.txt за детаље\n');
  } catch (error: any) {
    console.error(`\n❌ Грешка: ${error.message}\n`);
  }
}

analyzeTemplate();
