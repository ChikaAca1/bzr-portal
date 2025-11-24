/**
 * Test Anthropic Claude API direktno (bez OCR-a)
 * Proverava kredit i testira PDF ekstrakciju
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';

async function testAnthropicDirect() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Молимо наведите путању до документа');
    console.log('\nКоришћење:');
    console.log('  npx tsx src/test-anthropic-direct.ts <путања-до-документа>');
    process.exit(1);
  }

  console.log('🔍 Testiranje Anthropic Claude API...\n');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY nije postavljen u .env fajlu\n');
    process.exit(1);
  }

  console.log(`📋 API Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}\n`);

  const anthropic = new Anthropic({ apiKey });

  // Read file
  console.log(`📄 Učitavanje fajla: ${filePath}\n`);
  const fileBuffer = readFileSync(filePath);
  const filename = filePath.split(/[\\/]/).pop() || 'unknown.pdf';

  console.log(`📊 Veličina: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`📁 Naziv: ${filename}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Slanje zahteva ka Claude API...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const base64Data = fileBuffer.toString('base64');
  const startTime = Date.now();

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Анализирај овај српски документ и екстрахуј следеће информације у JSON формату:

1. **Подаци о предузећу** (companyInfo):
   - name: Назив предузећа
   - pib: ПИБ број
   - address: Адреса

2. **Радна места** (positions): Листа радних места са:
   - title: Назив радног места
   - description: Опис послова
   - employeeCount: Број запослених (ако је наведено)

3. **Запослени** (employees): Листа запослених са:
   - name: Име и презиме
   - position: Радно место

Врати САМО валидан JSON без додатних коментара.`,
            },
          ],
        },
      ],
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Odgovor primljen za ${duration}ms (${(duration / 1000).toFixed(1)}s)\n`);

    console.log('📊 Response metadata:');
    console.log(`   Model: ${response.model}`);
    console.log(`   Stop Reason: ${response.stop_reason}`);
    console.log(`   Input Tokens: ${response.usage.input_tokens}`);
    console.log(`   Output Tokens: ${response.usage.output_tokens}\n`);

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      console.error('❌ Nema tekstualnog odgovora od Claude-a\n');
      process.exit(1);
    }

    let jsonText = textContent.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 EKSTRAKTOVANI PODACI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const parsed = JSON.parse(jsonText);

      // Company info
      if (parsed.companyInfo) {
        console.log('🏢 PREDUZEĆE:');
        console.log(`   Naziv: ${parsed.companyInfo.name || 'N/A'}`);
        console.log(`   PIB: ${parsed.companyInfo.pib || 'N/A'}`);
        console.log(`   Adresa: ${parsed.companyInfo.address || 'N/A'}\n`);
      }

      // Positions
      if (parsed.positions && parsed.positions.length > 0) {
        console.log(`👷 RADNA MESTA (${parsed.positions.length}):`);
        parsed.positions.forEach((pos: any, i: number) => {
          console.log(`\n   ${i + 1}. ${pos.title}`);
          if (pos.description) {
            const desc = pos.description.substring(0, 100);
            console.log(`      ${desc}${pos.description.length > 100 ? '...' : ''}`);
          }
          if (pos.employeeCount) {
            console.log(`      Zaposlenih: ${pos.employeeCount}`);
          }
        });
        console.log();
      }

      // Employees
      if (parsed.employees && parsed.employees.length > 0) {
        console.log(`👥 ZAPOSLENI (${parsed.employees.length}):`);
        parsed.employees.slice(0, 15).forEach((emp: any, i: number) => {
          console.log(`   ${i + 1}. ${emp.name}${emp.position ? ` - ${emp.position}` : ''}`);
        });
        if (parsed.employees.length > 15) {
          console.log(`   ... i još ${parsed.employees.length - 15} zaposlenih`);
        }
        console.log();
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ TEST USPEŠAN - ANTHROPIC KREDIT RADI!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('💰 Trošak ovog API poziva:');
      console.log(`   Input tokens: ${response.usage.input_tokens} × $0.003 = $${(response.usage.input_tokens * 0.003 / 1000000).toFixed(6)}`);
      console.log(`   Output tokens: ${response.usage.output_tokens} × $0.015 = $${(response.usage.output_tokens * 0.015 / 1000000).toFixed(6)}`);
      console.log(`   Ukupno: ~$${((response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000000).toFixed(6)}\n`);

    } catch (parseError) {
      console.log('⚠️  JSON parsing greška, prikazujem sirovi odgovor:\n');
      console.log(jsonText);
      console.log('\n');
    }

  } catch (error: any) {
    console.error('\n❌ GREŠKA PRI POZIVU ANTHROPIC API:\n');

    if (error.status === 401) {
      console.error('🔑 401 Unauthorized - API ključ nije validan\n');
    } else if (error.status === 400) {
      console.error('❌ 400 Bad Request\n');
      console.error('Detalji:', error.error || error.message);
      console.log('\n');

      if (error.error?.error?.message?.includes('credit balance')) {
        console.error('💳 KREDIT JE POTROŠEN!\n');
        console.log('Idite na: https://console.anthropic.com/settings/billing');
        console.log('Da dodate kredit na nalog\n');
      }
    } else if (error.status === 429) {
      console.error('⏱️  429 Rate Limit - Previše zahteva\n');
    } else {
      console.error(`⚠️  ${error.status || 'Unknown'} - ${error.message}\n`);
      console.error(error);
    }
    process.exit(1);
  }
}

testAnthropicDirect().catch(console.error);
