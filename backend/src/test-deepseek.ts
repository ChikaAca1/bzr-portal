/**
 * Test DeepSeek API za ekstrakciju dokumenata
 * DeepSeek je kompatibilan sa OpenAI API-jem
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import OpenAI from 'openai';

async function testDeepSeek() {
  console.log('🔍 Testiranje DeepSeek API...\n');

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY nije postavljen u .env fajlu\n');
    process.exit(1);
  }

  console.log(`📋 API Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 6)}\n`);

  // DeepSeek koristi OpenAI SDK sa custom base URL-om
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  console.log('💡 Test Scenario: Ekstrakcija podataka iz srpskog teksta');
  console.log('   (bez PDF-a - samo tekstualna analiza)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Test konekcije sa DeepSeek API...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const startTime = Date.now();

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Ti si AI asistent za ekstrakciju strukturiranih podataka iz srpskih dokumenata. Odgovaraš isključivo na srpskom jeziku u JSON formatu.',
        },
        {
          role: 'user',
          content: `Test poruka: Анализирај следећи текст и екстрахуј структуриране податке.

Пример:
Назив предузећа: ЈКП ЗЕЛЕНИЛО ПАНЧЕВО
ПИБ: 101047068
Адреса: Панчево, Војводе Радомира Путника 12

Радно место: Рачуновођа
Број запослених: 2

Екстрахуј податке у JSON формату.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Odgovor primljen za ${duration}ms (${(duration / 1000).toFixed(1)}s)\n`);

    console.log('📊 Response metadata:');
    console.log(`   Model: ${response.model}`);
    console.log(`   Finish Reason: ${response.choices[0]?.finish_reason}`);
    console.log(`   Prompt Tokens: ${response.usage?.prompt_tokens || 0}`);
    console.log(`   Completion Tokens: ${response.usage?.completion_tokens || 0}`);
    console.log(`   Total Tokens: ${response.usage?.total_tokens || 0}\n`);

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ Nema odgovora od DeepSeek-a\n');
      process.exit(1);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 DEEPSEEK ODGOVOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(content);
    console.log('\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST USPEŠAN - DEEPSEEK RADI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💰 Trošak ovog API poziva:');
    const inputCost = (response.usage?.prompt_tokens || 0) * 0.00055 / 1000;
    const outputCost = (response.usage?.completion_tokens || 0) * 0.00219 / 1000;
    console.log(`   Input tokens: ${response.usage?.prompt_tokens || 0} × $0.55/1M = $${inputCost.toFixed(6)}`);
    console.log(`   Output tokens: ${response.usage?.completion_tokens || 0} × $2.19/1M = $${outputCost.toFixed(6)}`);
    console.log(`   Ukupno: ~$${(inputCost + outputCost).toFixed(6)}\n`);

    console.log('💡 NAPOMENA:');
    console.log('   DeepSeek NE može da čita PDF/slike direktno');
    console.log('   Potreban je Azure OCR da izvuče tekst prvo');
    console.log('   Onda DeepSeek može da analizira taj tekst\n');

    console.log('🔄 WORKFLOW SA DEEPSEEK-om:');
    console.log('   1. Azure OCR → Ekstrakcija teksta iz PDF-a');
    console.log('   2. DeepSeek → Strukturna analiza teksta');
    console.log('   3. Data Mapping → Skladištenje u bazu\n');

    console.log('⚠️  Problem: Azure OCR kredencijali ne rade');
    console.log('   Rešenje: Ispravite Azure kredencijale kako bi kompletan');
    console.log('            OCR + DeepSeek pipeline radio\n');

  } catch (error: any) {
    console.error('\n❌ GREŠKA PRI POZIVU DEEPSEEK API:\n');

    if (error.status === 401) {
      console.error('🔑 401 Unauthorized - API ključ nije validan\n');
      console.log('Proverite DEEPSEEK_API_KEY u .env fajlu\n');
    } else if (error.status === 400) {
      console.error('❌ 400 Bad Request\n');
      console.error('Detalji:', error.message);
      console.log('\n');
    } else if (error.status === 429) {
      console.error('⏱️  429 Rate Limit - Previše zahteva\n');
    } else if (error.status === 402) {
      console.error('💳 402 Payment Required - Kredit je potrošen\n');
      console.log('Idite na: https://platform.deepseek.com/billing');
      console.log('Da dodate kredit na nalog\n');
    } else {
      console.error(`⚠️  ${error.status || 'Unknown'} - ${error.message}\n`);
      if (error.response?.data) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error);
      }
    }
    process.exit(1);
  }
}

testDeepSeek().catch(console.error);
