/**
 * Test OCR and Document Extraction Pipeline
 *
 * Tests the complete flow:
 * 1. Azure Form Recognizer OCR
 * 2. Claude AI extraction
 * 3. Data mapping to database
 *
 * Usage:
 *   npm run test:ocr <path-to-document>
 *
 * Or with TypeScript:
 *   tsx src/test-ocr.ts <path-to-document>
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { ocrService } from './services/ocr.service.js';
import { documentExtractionService } from './services/document-extraction.service.js';
import { logger } from './utils/logger.js';

async function testOcrPipeline() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Молимо наведите путању до документа');
    console.log('\nКоришћење:');
    console.log('  npm run test:ocr <путања-до-документа>');
    console.log('  tsx src/test-ocr.ts <путања-до-документа>');
    console.log('\nПример:');
    console.log('  tsx src/test-ocr.ts "./test-documents/akt-procena-rizika-2015.pdf"');
    process.exit(1);
  }

  try {
    console.log('🔍 Тестирање OCR и AI екстракције...\n');
    console.log(`📄 Фајл: ${filePath}\n`);

    // Read file
    const fileBuffer = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    const filename = filePath.split(/[\\/]/).pop() || 'unknown.pdf';

    console.log(`📊 Величина: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📋 MIME тип: ${mimeType}\n`);

    // Test 1: OCR only
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📷 ТЕСТ 1: Azure Form Recognizer OCR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startOcr = Date.now();
    const ocrResult = await ocrService.extractTextWithOcr(fileBuffer, mimeType, filename);
    const ocrTime = Date.now() - startOcr;

    console.log(`✅ OCR завршен за ${ocrTime}ms\n`);
    console.log(`📄 Број страна: ${ocrResult.pageCount}`);
    console.log(`📝 Укупно карактера: ${ocrResult.fullText.length}`);
    console.log(`🎯 Поузданост: ${(ocrResult.confidence * 100).toFixed(1)}%`);
    console.log(`📊 Табела пронађено: ${ocrResult.tables?.length || 0}`);
    console.log(`🔑 Кључ-вредност парова: ${ocrResult.keyValuePairs?.length || 0}\n`);

    // Show first 500 characters of extracted text
    console.log('📄 Почетак екстрахованог текста:');
    console.log('─────────────────────────────────────────');
    console.log(ocrResult.fullText.substring(0, 500));
    console.log('─────────────────────────────────────────\n');

    // Test 2: Full extraction pipeline (OCR + AI)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 ТЕСТ 2: Комплетна екстракција (OCR + AI)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startExtraction = Date.now();
    const extractedData = await documentExtractionService.extractDataFromDocument(
      fileBuffer,
      mimeType,
      filename,
      true // Force OCR
    );
    const extractionTime = Date.now() - startExtraction;

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
    }

    // Positions
    if (extractedData.positions && extractedData.positions.length > 0) {
      console.log(`👷 РАДНА МЕСТА (${extractedData.positions.length}):`);
      extractedData.positions.forEach((position, i) => {
        console.log(`\n   ${i + 1}. ${position.title}`);
        if (position.description) {
          console.log(`      Опис: ${position.description.substring(0, 100)}...`);
        }
        if (position.hazards && position.hazards.length > 0) {
          console.log(`      Опасности: ${position.hazards.length}`);
          position.hazards.slice(0, 3).forEach(h => console.log(`        • ${h}`));
        }
        if (position.employeeCount) {
          console.log(`      Број запослених: ${position.employeeCount}`);
        }
      });
      console.log();
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
    }

    // Protective measures
    if (extractedData.protectiveMeasures && extractedData.protectiveMeasures.length > 0) {
      console.log(`🛡️  МЕРЕ ЗАШТИТЕ (${extractedData.protectiveMeasures.length}):`);
      extractedData.protectiveMeasures.slice(0, 5).forEach((measure, i) => {
        console.log(`   ${i + 1}. ${measure}`);
      });
      if (extractedData.protectiveMeasures.length > 5) {
        console.log(`   ... и още ${extractedData.protectiveMeasures.length - 5} мера`);
      }
      console.log();
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 СУМАРНИ ИЗВЕШТАЈ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏱️  OCR време: ${ocrTime}ms`);
    console.log(`⏱️  AI екстракција време: ${extractionTime - ocrTime}ms`);
    console.log(`⏱️  Укупно време: ${extractionTime}ms\n`);
    console.log(`📄 Поузданост OCR: ${(ocrResult.confidence * 100).toFixed(1)}%`);
    console.log(`📊 Број страна: ${ocrResult.pageCount}`);
    console.log(`📝 Карактера: ${ocrResult.fullText.length}\n`);
    console.log(`🏢 Предузећа: ${extractedData.companyInfo ? 1 : 0}`);
    console.log(`👷 Радна места: ${extractedData.positions?.length || 0}`);
    console.log(`👥 Запослени: ${extractedData.employees?.length || 0}`);
    console.log(`⚠️  Опасности: ${extractedData.hazards?.length || 0}`);
    console.log(`🛡️  Мере заштите: ${extractedData.protectiveMeasures?.length || 0}\n`);

    console.log('✅ Тест успешно завршен!');
  } catch (error) {
    console.error('\n❌ ГРЕШКА:', error);
    logger.error({ msg: 'OCR test failed', error });
    process.exit(1);
  }
}

/**
 * Determine MIME type from file extension
 */
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

// Run test
testOcrPipeline().catch(console.error);
