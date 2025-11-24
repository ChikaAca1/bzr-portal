/**
 * Test Claude Vision API for PDF extraction
 *
 * This test bypasses Azure OCR and uses Claude's native PDF reading capability
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { documentExtractionService } from './services/document-extraction.service.js';
import { logger } from './utils/logger.js';

async function testClaudeVision() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Молимо наведите путању до документа');
    console.log('\nКоришћење:');
    console.log('  npx tsx src/test-claude-vision.ts <путања-до-документа>');
    process.exit(1);
  }

  try {
    console.log('🔍 Тестирање Claude Vision API екстракције...\n');
    console.log(`📄 Фајл: ${filePath}\n`);

    // Read file
    const fileBuffer = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    const filename = filePath.split(/[\\/]/).pop() || 'unknown.pdf';

    console.log(`📊 Величина: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📋 MIME тип: ${mimeType}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 Claude Vision API Екстракција');
    console.log('   (без Azure OCR-а - директно читање PDF-а)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startTime = Date.now();

    // Extract using Claude Vision (useOcr = false means it will use Vision API for PDF)
    const extractedData = await documentExtractionService.extractDataFromDocument(
      fileBuffer,
      mimeType,
      filename,
      false // Don't use OCR, use Claude Vision directly
    );

    const extractionTime = Date.now() - startTime;

    console.log(`✅ Екстракција завршена за ${extractionTime}ms\n`);

    // Display results
    console.log('📊 РЕЗУЛТАТИ ЕКСТРАКЦИЈЕ:');
    console.log('═══════════════════════════════════════════\n');

    // Company info
    if (extractedData.companyInfo) {
      console.log('🏢 ПОДАЦИ О ПРЕДУЗЕЋУ:');
      console.log(`   • Назив: ${extractedData.companyInfo.name || 'N/A'}`);
      console.log(`   • ПИБ: ${extractedData.companyInfo.pib || 'N/A'}`);
      console.log(`   • Адреса: ${extractedData.companyInfo.address || 'N/A'}\n`);
    } else {
      console.log('🏢 ПОДАЦИ О ПРЕДУЗЕЋУ: Нису пронађени\n');
    }

    // Positions
    if (extractedData.positions && extractedData.positions.length > 0) {
      console.log(`👷 РАДНА МЕСТА (${extractedData.positions.length}):`);
      extractedData.positions.forEach((position, i) => {
        console.log(`\n   ${i + 1}. ${position.title}`);
        if (position.description) {
          console.log(`      Опис: ${position.description.substring(0, 100)}${position.description.length > 100 ? '...' : ''}`);
        }
        if (position.hazards && position.hazards.length > 0) {
          console.log(`      Опасности: ${position.hazards.length}`);
          position.hazards.slice(0, 3).forEach(h => console.log(`        • ${h}`));
          if (position.hazards.length > 3) {
            console.log(`        ... и још ${position.hazards.length - 3}`);
          }
        }
        if (position.employeeCount) {
          console.log(`      Број запослених: ${position.employeeCount}`);
        }
      });
      console.log();
    } else {
      console.log('👷 РАДНА МЕСТА: Нису пронађена\n');
    }

    // Employees
    if (extractedData.employees && extractedData.employees.length > 0) {
      console.log(`👥 ЗАПОСЛЕНИ (${extractedData.employees.length}):`);
      extractedData.employees.slice(0, 10).forEach((employee, i) => {
        console.log(`   ${i + 1}. ${employee.name}`);
        if (employee.position) console.log(`      Позиција: ${employee.position}`);
        if (employee.jmbg) console.log(`      ЈМБГ: ${employee.jmbg}`);
      });
      if (extractedData.employees.length > 10) {
        console.log(`   ... и још ${extractedData.employees.length - 10} запослених`);
      }
      console.log();
    } else {
      console.log('👥 ЗАПОСЛЕНИ: Нису пронађени\n');
    }

    // Hazards
    if (extractedData.hazards && extractedData.hazards.length > 0) {
      console.log(`⚠️  ОПАСНОСТИ И ШТЕТНОСТИ (${extractedData.hazards.length}):`);
      extractedData.hazards.slice(0, 10).forEach((hazard, i) => {
        console.log(`   ${i + 1}. ${hazard.description}`);
        if (hazard.category) console.log(`      Категорија: ${hazard.category}`);
        if (hazard.severity) console.log(`      Озбиљност: ${hazard.severity}/5`);
      });
      if (extractedData.hazards.length > 10) {
        console.log(`   ... и још ${extractedData.hazards.length - 10} опасности`);
      }
      console.log();
    } else {
      console.log('⚠️  ОПАСНОСТИ: Нису пронађене\n');
    }

    // Protective measures
    if (extractedData.protectiveMeasures && extractedData.protectiveMeasures.length > 0) {
      console.log(`🛡️  МЕРЕ ЗАШТИТЕ (${extractedData.protectiveMeasures.length}):`);
      extractedData.protectiveMeasures.slice(0, 5).forEach((measure, i) => {
        console.log(`   ${i + 1}. ${measure}`);
      });
      if (extractedData.protectiveMeasures.length > 5) {
        console.log(`   ... и још ${extractedData.protectiveMeasures.length - 5} мера`);
      }
      console.log();
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 СУМАРНИ ИЗВЕШТАЈ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏱️  Укупно време: ${extractionTime}ms (${(extractionTime / 1000).toFixed(1)}s)`);
    console.log(`🏢 Предузећа: ${extractedData.companyInfo ? 1 : 0}`);
    console.log(`👷 Радна места: ${extractedData.positions?.length || 0}`);
    console.log(`👥 Запослени: ${extractedData.employees?.length || 0}`);
    console.log(`⚠️  Опасности: ${extractedData.hazards?.length || 0}`);
    console.log(`🛡️  Мере заштите: ${extractedData.protectiveMeasures?.length || 0}\n`);

    if (extractedData.rawText) {
      console.log('📄 Екстрахован текст (први део):');
      console.log('─────────────────────────────────────────');
      console.log(extractedData.rawText.substring(0, 500));
      console.log('─────────────────────────────────────────\n');
    }

    console.log('✅ Тест успешно завршен!');
    console.log('\n💡 Напомена: Ово је резултат Claude Vision API-ја.');
    console.log('   За скениране документе, Azure OCR би дао боље резултате.');

  } catch (error) {
    console.error('\n❌ ГРЕШКА:', error);
    logger.error({ msg: 'Claude Vision test failed', error });
    process.exit(1);
  }
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    default:
      return 'application/octet-stream';
  }
}

testClaudeVision().catch(console.error);
