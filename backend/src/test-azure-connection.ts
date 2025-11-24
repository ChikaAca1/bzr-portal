/**
 * Test Azure Form Recognizer Connection
 *
 * Proverava da li su Azure kredencijali validni
 */

import 'dotenv/config';
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';

async function testAzureConnection() {
  console.log('🔍 Testiranje Azure Form Recognizer konekcije...\n');

  // Check environment variables
  const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
  const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

  console.log('📋 Konfiguracija:');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET'}`);
  console.log(`   Key Length: ${apiKey?.length || 0} characters\n`);

  if (!endpoint || !apiKey) {
    console.error('❌ Azure kredencijali nisu postavljeni u .env fajlu\n');
    console.log('Potrebne environment varijable:');
    console.log('  AZURE_FORM_RECOGNIZER_ENDPOINT=https://...');
    console.log('  AZURE_FORM_RECOGNIZER_KEY=<your-key>');
    process.exit(1);
  }

  // Create client
  console.log('🔌 Kreiranje Azure klijenta...');
  const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

  // Create a minimal test document (1x1 pixel transparent PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');

  console.log('📄 Slanje test dokumenta (1x1 PNG)...\n');

  try {
    const poller = await client.beginAnalyzeDocument('prebuilt-read', testImageBuffer);
    console.log('✅ Konekcija uspešna! Čekanje na rezultat...\n');

    const result = await poller.pollUntilDone();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ AZURE FORM RECOGNIZER RADI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Rezultat:');
    console.log(`   Model ID: ${result.modelId}`);
    console.log(`   API Version: ${result.apiVersion}`);
    console.log(`   Broj stranica: ${result.pages?.length || 0}`);
    console.log(`   Sadržaj: "${result.content || 'prazan'}"\n`);

    console.log('🎉 Možete nastaviti sa testiranjem stvarnih dokumenata!\n');
    console.log('Komanda:');
    console.log('  npm run test:ocr "putanja/do/dokumenta.pdf"');

  } catch (error: any) {
    console.error('\n❌ GREŠKA PRI TESTIRANJU:\n');

    if (error.statusCode === 401) {
      console.error('🔑 401 Unauthorized - Nevalidni kredencijali\n');
      console.log('Mogući uzroci:');
      console.log('  1. API ključ je pogrešan');
      console.log('  2. API ključ je istekao');
      console.log('  3. Endpoint URL nije dobar za ovaj ključ\n');
      console.log('Kako proveriti:');
      console.log('  1. Idite na https://portal.azure.com');
      console.log('  2. Pronađite "Cognitive Services" resurs');
      console.log('  3. Kliknite na "Keys and Endpoint"');
      console.log('  4. Kopirajte KEY 1 ili KEY 2');
      console.log('  5. Kopirajte ENDPOINT URL');
      console.log('  6. Ažurirajte .env fajl\n');

    } else if (error.statusCode === 403) {
      console.error('🚫 403 Forbidden - Pristup nije dozvoljen\n');
      console.log('Mogući uzroci:');
      console.log('  1. Subscription nije aktivan');
      console.log('  2. Kvota je prekoračena');
      console.log('  3. Region nije podržan\n');

    } else if (error.statusCode === 404) {
      console.error('🔍 404 Not Found - Endpoint ne postoji\n');
      console.log('Proverite AZURE_FORM_RECOGNIZER_ENDPOINT u .env fajlu');
      console.log('Format: https://<resource-name>.cognitiveservices.azure.com/\n');

    } else {
      console.error(`⚠️  ${error.statusCode || 'Unknown'} - ${error.message}\n`);
    }

    console.error('Detalji greške:');
    console.error(error);
    process.exit(1);
  }
}

testAzureConnection().catch(console.error);
