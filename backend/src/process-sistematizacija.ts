/**
 * Obrada Sistematizacije poslova - Ekstrakcija radnih mesta
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import OpenAI from 'openai';

async function processSistematizacija() {
  const tekstPath = process.argv[2];

  if (!tekstPath) {
    console.error('❌ Unesite putanju do tekst fajla');
    process.exit(1);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY nije postavljen\n');
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  // Read text file
  const tekstSistematizacije = readFileSync(tekstPath, 'utf-8');

  console.log('🔍 Obrada Sistematizacije poslova JKP "ZELENIL O" PANČEVO\n');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`📄 Veličina teksta: ${(tekstSistematizacije.length / 1024).toFixed(2)} KB\n`);

  const EXTRACTION_PROMPT = `Анализирај документ "ОПИС ПОСЛОВА" ЈКП "ЗЕЛЕНИЛО" ПАНЧЕВО и екстрахуј све радне позиције.

ЗАДАТАК:
За сваку радну позицију екстрахуј:
1. Број позиције (нпр. "1", "2", "3")
2. Назив радног места
3. Детаљан опис послова
4. Одговорности
5. Евентуалне опасности/ризике који се помињу у опису

Врати JSON у следећем формату:

{
  "companyInfo": {
    "name": "ЈКП ЗЕЛЕНИЛО ПАНЧЕВО",
    "documentType": "ОПИС ПОСЛОВА",
    "documentNumber": "92-308",
    "date": "06.03.2025"
  },
  "positions": [
    {
      "positionNumber": "1",
      "title": "Назив радног места",
      "description": "Детаљан опис послова (све наведене обавезе)",
      "responsibilities": ["Одговорност 1", "Одговорност 2"],
      "hazards": ["Опасност 1", "Опасност 2"],
      "reportingTo": "Коме је одговоран",
      "sector": "РЈ/Сектор коме припада"
    }
  ]
}

ВАЖНО:
- Екстрахуј СВЕ радне позиције из документа (око 135 позиција)
- За сваку позицију детаљно наведи опис послова
- Идентификуј потенцијалне опасности из описа (рад са возилима, машинама, висине, хемикалије, итд)
- Сачувај оригиналну ћирилицу
- Врати САМО JSON без додатних објашњења

ДОКУМЕНТ:
${tekstSistematizacije}`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Слање ка DeepSeek API...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Ти си експерт за обраду организационих докумената и екстракцију структурираних података из српских докумената. Одговараш искључиво валидним JSON-ом.',
        },
        {
          role: 'user',
          content: EXTRACTION_PROMPT,
        },
      ],
      temperature: 0.1,
      max_tokens: 8000, // DeepSeek limit je 8192
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Одговор примљен за ${duration}ms (${(duration / 1000).toFixed(1)}s)\n`);

    const content = response.choices[0]?.message?.content || '';

    // Parse JSON
    let jsonText = content.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ЕКСТРАХОВАНИ ПОДАЦИ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Company info
    if (parsed.companyInfo) {
      console.log('🏢 ПРЕДУЗЕЋЕ:');
      console.log(`   Назив: ${parsed.companyInfo.name}`);
      console.log(`   Тип документа: ${parsed.companyInfo.documentType}`);
      console.log(`   Број: ${parsed.companyInfo.documentNumber}`);
      console.log(`   Датум: ${parsed.companyInfo.date}\n`);
    }

    // Positions summary
    if (parsed.positions && parsed.positions.length > 0) {
      console.log(`👷 РАДНА МЕСТА: ${parsed.positions.length}\n`);

      // Group by sector
      const bySector: Record<string, any[]> = {};
      parsed.positions.forEach((pos: any) => {
        const sector = pos.sector || 'Остало';
        if (!bySector[sector]) {
          bySector[sector] = [];
        }
        bySector[sector].push(pos);
      });

      console.log('📋 ПО СЕКТОРИМА:\n');
      Object.keys(bySector).forEach(sector => {
        console.log(`   ${sector}: ${bySector[sector].length} позиција`);
      });
      console.log();

      // Show first 10 positions as sample
      console.log('📝 ПРИМЕРИ ПОЗИЦИЈА (првих 10):\n');
      parsed.positions.slice(0, 10).forEach((pos: any, i: number) => {
        console.log(`   ${pos.positionNumber}. ${pos.title}`);
        console.log(`      Сектор: ${pos.sector || 'N/A'}`);
        if (pos.hazards && pos.hazards.length > 0) {
          console.log(`      ⚠️  Опасности: ${pos.hazards.length}`);
          pos.hazards.slice(0, 2).forEach((h: string) => console.log(`         • ${h}`));
        }
        console.log();
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DEEPSEEK EKSTRAKCIJA USPEŠNA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💰 Trošak:');
    const inputCost = (response.usage?.prompt_tokens || 0) * 0.00055 / 1000;
    const outputCost = (response.usage?.completion_tokens || 0) * 0.00219 / 1000;
    console.log(`   Input: ${response.usage?.prompt_tokens || 0} tokens → $${inputCost.toFixed(6)}`);
    console.log(`   Output: ${response.usage?.completion_tokens || 0} tokens → $${outputCost.toFixed(6)}`);
    console.log(`   Ukupno: $${(inputCost + outputCost).toFixed(6)}\n`);

    // Save to file
    const outputFile = 'sistematizacija-extracted.json';
    const fs = await import('fs');
    fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2), 'utf-8');

    console.log(`💾 JSON сачуван у: ${outputFile}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 СТАТИСТИКА');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Count positions with hazards
    const positionsWithHazards = parsed.positions.filter((p: any) => p.hazards && p.hazards.length > 0);
    console.log(`   Укупно позиција: ${parsed.positions.length}`);
    console.log(`   Позиција са опасностима: ${positionsWithHazards.length}`);
    console.log(`   Позиција без опасности: ${parsed.positions.length - positionsWithHazards.length}\n`);

    // Count total hazards
    const totalHazards = parsed.positions.reduce((sum: number, p: any) => {
      return sum + (p.hazards?.length || 0);
    }, 0);
    console.log(`   Укупно идентификованих опасности: ${totalHazards}\n`);

    console.log('💡 СЛЕДЕЋИ КОРАК:');
    console.log('   Овај JSON представља базу знања о радним местима');
    console.log('   Може се користити за:');
    console.log('   - Аутоматско попуњавање Акта о процени ризика');
    console.log('   - Идентификацију опасности по радном месту');
    console.log('   - Генерисање табела систематизације');
    console.log('   - Мапирање запослених на радна места\n');

  } catch (error: any) {
    console.error('\n❌ GREŠKA:\n');
    console.error(error.message || error);

    if (error.response?.data) {
      console.error('\nDetalji:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

processSistematizacija().catch(console.error);
