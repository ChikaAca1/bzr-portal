/**
 * Manuelni test ekstrakcije - kopirajte tekst iz PDF-a i testirajte DeepSeek
 */

import 'dotenv/config';
import OpenAI from 'openai';

const SAMPLE_TEXT = `
СИСТЕМАТИЗАЦИЈА РАДНИХ МЕСТА
ЈКП "ЗЕЛЕНИЛО" ПАНЧЕВО

1. ДИРЕКТОР
   - Руководи радом предузећа
   - Заступа и представља предузеће
   - Број извршилаца: 1

2. ШЕФ РАЧУНОВОДСТВА
   - Организује и координира рад рачуноводства
   - Припрема финансијске извештаје
   - Број извршилаца: 1

3. РАЧУНОВОЂА
   - Обавља послове књиговодства
   - Евиденција пословних промена
   - Број извршилаца: 2

4. БЛАГАЈНИК
   - Обавља послове благајне
   - Наплата и исплата новца
   - Број извршилаца: 1

5. ВОЗАЧ
   - Управља теретним возилом
   - Одржава возило
   - Број извршилаца: 3

6. РАДНИК НА ОДРЖАВАЊУ ЗЕЛЕНИЛА
   - Одржавање паркова и зелених површина
   - Кошење траве, орезивање
   - Број извршилаца: 15

Подаци о предузећу:
Назив: ЈКП "ЗЕЛЕНИЛО" ПАНЧЕВО
ПИБ: 101047068
Адреса: Панчево, Војводе Радомира Путника 12
Матични број: 08023654
`;

async function testManualExtraction() {
  console.log('🔍 Test DeepSeek Ekstrakcije - Ručno Uneti Tekst\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY nije postavljen\n');
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  console.log('📄 Analiziram tekst sa sistematizacijom...\n');

  const EXTRACTION_PROMPT = `Анализирај следећи српски документ и екстрахуј податке у JSON формату.

ДОКУМЕНТ:
${SAMPLE_TEXT}

ЗАДАТАК:
Екстрахуј све податке и врати их у следећем JSON формату:

{
  "companyInfo": {
    "name": "назив предузећа",
    "pib": "ПИБ број",
    "address": "адреса",
    "maticniBroj": "матични број"
  },
  "positions": [
    {
      "title": "назив радног места",
      "description": "опис послова",
      "employeeCount": број_запослених
    }
  ]
}

ВАЖНО:
- Екстрахуј СВА радна места из документа
- За сваку позицију наведи тачан број извршилаца
- Користи српска слова (ћирилицу) у одговору
- Врати САМО JSON, без додатних објашњења`;

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
          content: 'Ти си експерт за екстракцију структурираних података из српских докумената. Одговараш искључиво валидним JSON-ом.',
        },
        {
          role: 'user',
          content: EXTRACTION_PROMPT,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
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
      console.log(`   ПИБ: ${parsed.companyInfo.pib}`);
      console.log(`   Адреса: ${parsed.companyInfo.address}`);
      if (parsed.companyInfo.maticniBroj) {
        console.log(`   Матични број: ${parsed.companyInfo.maticniBroj}`);
      }
      console.log();
    }

    // Positions
    if (parsed.positions && parsed.positions.length > 0) {
      console.log(`👷 РАДНА МЕСТА (${parsed.positions.length}):\n`);

      let totalEmployees = 0;
      parsed.positions.forEach((pos: any, i: number) => {
        console.log(`   ${i + 1}. ${pos.title}`);
        if (pos.description) {
          console.log(`      📝 ${pos.description}`);
        }
        if (pos.employeeCount) {
          console.log(`      👥 Број извршилаца: ${pos.employeeCount}`);
          totalEmployees += pos.employeeCount;
        }
        console.log();
      });

      console.log(`   📊 УКУПНО ЗАПОСЛЕНИХ: ${totalEmployees}\n`);
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

    console.log('📋 JSON za bazu podataka:');
    console.log('─────────────────────────────────────────');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('─────────────────────────────────────────\n');

    console.log('💡 SLEDEĆI KORAK:');
    console.log('   Ovaj JSON može odmah da se prosledi u Data Mapping servis');
    console.log('   koji će automatski kreirati zapise u bazi!\n');

  } catch (error: any) {
    console.error('\n❌ GREŠKA:\n');
    console.error(error.message || error);

    if (error.response?.data) {
      console.error('\nDetalji:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testManualExtraction().catch(console.error);
