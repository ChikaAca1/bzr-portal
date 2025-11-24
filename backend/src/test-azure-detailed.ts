/**
 * Detaljna dijagnostika Azure Form Recognizer konekcije
 */

import 'dotenv/config';

async function testAzureDetailed() {
  console.log('🔍 DETALJNA DIJAGNOSTIKA AZURE FORM RECOGNIZER\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Provera environment varijabli
  console.log('📋 KORAK 1: Provera Environment Varijabli');
  console.log('─────────────────────────────────────────────────────\n');

  const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
  const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;
  const location = process.env.LOCATION;

  console.log(`AZURE_FORM_RECOGNIZER_ENDPOINT:`);
  console.log(`  Vrednost: ${endpoint || 'NOT SET'}`);
  console.log(`  Dužina: ${endpoint?.length || 0} karaktera\n`);

  console.log(`AZURE_FORM_RECOGNIZER_KEY:`);
  console.log(`  Vrednost: ${apiKey ? `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}` : 'NOT SET'}`);
  console.log(`  Dužina: ${apiKey?.length || 0} karaktera`);
  console.log(`  Format: ${apiKey?.length === 84 ? '✅ Izgleda validno (84 karaktera)' : '❌ Neočekivana dužina'}\n`);

  console.log(`LOCATION:`);
  console.log(`  Vrednost: ${location || 'NOT SET'}\n`);

  if (!endpoint || !apiKey) {
    console.error('❌ Nedostaju environment varijable!\n');
    process.exit(1);
  }

  // 2. Analiza endpoint URL-a
  console.log('🔗 KORAK 2: Analiza Endpoint URL-a');
  console.log('─────────────────────────────────────────────────────\n');

  try {
    const url = new URL(endpoint);
    console.log(`Protocol: ${url.protocol}`);
    console.log(`Hostname: ${url.hostname}`);
    console.log(`Pathname: ${url.pathname}`);

    // Check if hostname matches expected pattern
    const hostnamePattern = /^[\w-]+\.cognitiveservices\.azure\.com$/i;
    const isValidHostname = hostnamePattern.test(url.hostname);

    console.log(`\nFormat validacija: ${isValidHostname ? '✅' : '❌'}`);
    console.log(`Očekivani format: <resource-name>.cognitiveservices.azure.com`);
    console.log(`Vaš hostname: ${url.hostname}\n`);

    if (!isValidHostname) {
      console.warn('⚠️  WARNING: Hostname ne odgovara standardnom formatu!\n');
      console.log('Primer validnog endpoint-a:');
      console.log('  https://my-form-recognizer.cognitiveservices.azure.com/\n');
    }

  } catch (error) {
    console.error('❌ Endpoint URL nije validan!\n');
    console.error(`Greška: ${error instanceof Error ? error.message : error}\n`);
    process.exit(1);
  }

  // 3. Test API poziva sa detaljnim error handling-om
  console.log('🌐 KORAK 3: Test API Poziva');
  console.log('─────────────────────────────────────────────────────\n');

  const testUrl = `${endpoint.replace(/\/$/, '')}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`;

  console.log(`Request URL: ${testUrl}\n`);
  console.log('Šaljem HTTP POST zahtev...\n');

  // Simple test image (1x1 transparent PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');

  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: testImageBuffer,
    });

    console.log(`HTTP Status: ${response.status} ${response.statusText}\n`);

    if (response.status === 202) {
      console.log('✅ SUCCESS! Azure Form Recognizer je prihvatio zahtev!\n');
      console.log('Response Headers:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });

      const operationLocation = response.headers.get('operation-location');
      if (operationLocation) {
        console.log(`\n✅ Operacija započeta: ${operationLocation}\n`);
      }

      console.log('═══════════════════════════════════════════════════════');
      console.log('🎉 AZURE KREDENCIJALI SU VALIDNI!');
      console.log('═══════════════════════════════════════════════════════\n');

    } else if (response.status === 401) {
      console.log('❌ 401 UNAUTHORIZED\n');

      const errorBody = await response.text();
      console.log('Response Body:');
      console.log(errorBody);
      console.log('\n');

      console.log('🔍 MOGUĆI UZROCI:');
      console.log('──────────────────────────────────────────────────────\n');

      console.log('1. API KLJUČ JE NEISPRAVAN');
      console.log('   • Proverite da li ste kopirali kompletan ključ');
      console.log('   • Proverite da nema dodatnih razmaka na početku/kraju');
      console.log('   • Ključ treba da bude tačno 84 karaktera\n');

      console.log('2. ENDPOINT NE ODGOVARA RESURSU');
      console.log('   • Svaki Azure resurs ima svoj ENDPOINT');
      console.log('   • KEY i ENDPOINT moraju biti sa istog resursa');
      console.log('   • Proverite Azure Portal:\n');
      console.log('     a) Idite na https://portal.azure.com');
      console.log('     b) Pronađite "Cognitive Services" ili "AI Services"');
      console.log('     c) Kliknite na vaš Form Recognizer resurs');
      console.log('     d) Kliknite "Keys and Endpoint" u levom meniju');
      console.log('     e) Kopirajte KEY 1 (ili KEY 2)');
      console.log('     f) Kopirajte ENDPOINT (ceo URL)');
      console.log('     g) Oba moraju biti sa ISTOG resursa!\n');

      console.log('3. KLJUČ JE ISTEKAO ILI REGENERISAN');
      console.log('   • Regenerisani ključevi odmah invalidiraju stare\n');

      console.log('4. SUBSCRIPTION NIJE AKTIVAN');
      console.log('   • Proverite Azure subscription status');
      console.log('   • Možda je trial period istekao\n');

    } else if (response.status === 404) {
      console.log('❌ 404 NOT FOUND\n');
      console.log('ENDPOINT URL NE POSTOJI!\n');
      console.log('Vaš endpoint: ' + endpoint);
      console.log('\nProverite da li resource ime u endpoint-u postoji u Azure Portal-u\n');

    } else {
      console.log(`❌ NEOČEKIVAN STATUS: ${response.status}\n`);
      const errorBody = await response.text();
      console.log('Response Body:');
      console.log(errorBody);
      console.log('\n');
    }

  } catch (error) {
    console.error('❌ GREŠKA PRI SLANJU ZAHTEVA\n');
    console.error(error);
    console.log('\n');
  }

  // 4. Preporuke
  console.log('💡 PREPORUKE:');
  console.log('─────────────────────────────────────────────────────\n');
  console.log('1. Otvorite Azure Portal: https://portal.azure.com');
  console.log('2. U search bar-u ukucajte "Cognitive Services"');
  console.log('3. Pronađite vaš Form Recognizer / Document Intelligence resurs');
  console.log('4. Proverite naziv resursa u listi (npr. "my-ocr-service")');
  console.log('5. Kliknite na resurs → "Keys and Endpoint"');
  console.log('6. Uporedite:\n');
  console.log('   Azure Portal pokazuje:');
  console.log('   • KEY 1: xyz123...');
  console.log('   • ENDPOINT: https://naziv-resursa.cognitiveservices.azure.com/\n');
  console.log('   Vaš .env fajl sadrži:');
  console.log(`   • KEY: ${apiKey?.substring(0, 20)}...`);
  console.log(`   • ENDPOINT: ${endpoint}\n`);
  console.log('7. Ako se ne poklapaju - kopirajte ponovo!\n');
}

testAzureDetailed().catch(console.error);
