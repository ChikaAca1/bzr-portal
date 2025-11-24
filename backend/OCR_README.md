# OCR i AI Ekstrakcija Dokumenata - Dokumentacija

## Pregled

Sistem za automatsku ekstrakciju podataka iz uploadovanih dokumenata koristi dvostepeni proces:

1. **Azure Form Recognizer OCR** - Ekstrakcija teksta iz skeniranih dokumenata (podrška za srpsku ćirilicu)
2. **Claude AI Ekstrakcija** - Strukturna analiza i ekstrakcija poslovnih podataka
3. **Automatsko Mapiranje** - Skladištenje ekstrahovanih podataka u bazu

## Arhitektura

```
┌─────────────────────┐
│  Upload Dokumenta   │
│   (PDF/IMG/DOCX)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Azure Form        │
│   Recognizer OCR    │ ◄── Podrška za srpsku ćirilicu
│   (Faza 1)          │
└──────────┬──────────┘
           │
           ▼
    ┌──────────┐
    │   Tekst  │
    └──────────┘
           │
           ▼
┌─────────────────────┐
│   Claude AI         │
│   Ekstrakcija       │ ◄── Strukturna analiza
│   (Faza 2)          │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Strukturirani│
    │    Podaci    │
    └──────────────┘
           │
           ▼
┌─────────────────────┐
│   Data Mapping      │
│   Service           │ ◄── Automatsko skladištenje
│   (Faza 3)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   PostgreSQL        │
│   Baza Podataka     │
└─────────────────────┘
```

## Korišćenje

### 1. API Endpoint - Upload Dokumenta

**POST** `/api/documents/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <file-binary>
useOcr: true|false (optional, default: auto-detect)
```

**Response:**
```json
{
  "success": true,
  "fileId": 123,
  "filename": "akt-procena-rizika.pdf",
  "fileSize": 1024000,
  "message": "Фајл је отпремљен. OCR и AI обрада је у току..."
}
```

### 2. Provera Statusa Procesiranja

**GET** `/api/documents/:documentId/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "processedAt": "2025-01-18T12:30:00Z",
  "extractedData": {
    "companyInfo": {
      "name": "ЈКП ЗЕЛЕНИЛО ПАНЧЕВО",
      "pib": "101047068",
      "address": "Панчево, Војводе Радомира Путника 12"
    },
    "positions": [
      {
        "title": "Рачуновођа",
        "description": "Обавља послове књиговодства",
        "hazards": ["Рад на рачунару", "Дуготрајно седење"],
        "employeeCount": 2
      }
    ],
    "employees": [
      {
        "name": "Петар Петровић",
        "position": "Директор",
        "jmbg": "1234567890123"
      }
    ],
    "hazards": [
      {
        "description": "Рад на рачунару",
        "category": "физичке",
        "severity": 2
      }
    ],
    "protectiveMeasures": [
      "Редовне паузе при раду на рачунару",
      "Ергономски намештај"
    ]
  }
}
```

### 3. Test Skripta

Za testiranje OCR funkcionalnosti bez upload-a kroz API:

```bash
# Korišćenje
npm run test:ocr <путања-до-документа>

# Primer
npm run test:ocr "./test-documents/akt-procena-rizika-2015.pdf"
```

Test skripta će:
- Izvršiti OCR ekstrakciju
- Prikazati pouzdanost OCR-a i broj stranica
- Izvršiti AI ekstrakciju strukturiranih podataka
- Prikazati sve ekstraktovane podatke (preduzeća, radna mesta, zaposlene, opasnosti)
- Prikazati performanse (vreme procesiranja)

## Servisi

### 1. OCR Service (`ocr.service.ts`)

Servis za OCR ekstrakciju sa Azure Form Recognizer-om.

**Funkcije:**
- `extractTextWithOcr()` - Osnovna OCR ekstrakcija
- `extractAndFormatForAi()` - OCR + formatiranje za AI analizu

**Podržani formati:**
- PDF dokumenti
- PNG slike
- JPEG/JPG slike
- DOCX (planiran)

**Karakteristike:**
- Podrška za srpsku ćirilicu (`sr-Cyrl-RS`)
- Ekstrakcija tabela
- Ekstrakcija ključ-vrednost parova (forme)
- Layout analiza
- Multi-page obrada

### 2. Document Extraction Service (`document-extraction.service.ts`)

Dvostepena ekstrakcija:
1. OCR (za skenirane dokumente)
2. Claude AI strukturna analiza

**Funkcije:**
- `extractDataFromDocument()` - Glavna funkcija za ekstrakciju
- Auto-detekcija da li je dokument skeniran
- Podrška za native digitalne PDF-ove (koristi Claude Vision direktno)

**Ekstraktovani podaci:**
- Podaci o preduzećima (naziv, PIB, adresa)
- Radna mesta (naziv, opis, opasnosti, broj zaposlenih)
- Zaposleni (ime, pozicija, JMBG)
- Opasnosti i štětnosti (opis, kategorija, ozbiljnost)
- Mere zaštite

### 3. Data Mapping Service (`data-mapping.service.ts`)

Automatsko mapiranje ekstrahovanih podataka u bazu.

**Funkcije:**
- `mapExtractedDataToDatabase()` - Mapira sve podatke

**Karakteristike:**
- Inteligentna deduplicacija (ne kreira duplikate)
- Mapiranje po PIB-u i nazivu preduzeća
- Mapiranje po JMBG-u i imenu zaposlenih
- Automatsko spajanje sa postojećim radnim mestima
- Validacija i upozorenja za nevalidne podatke

**Rezultat:**
```typescript
{
  companyId: number,
  companyCreated: boolean,
  positionIds: number[],
  positionsCreated: number,
  workersCreated: number,
  hazardsIdentified: number,
  warnings: string[],
  errors: string[]
}
```

## Konfiguracija

### Environment Variables

```bash
# Azure Form Recognizer (OCR)
AZURE_FORM_RECOGNIZER_ENDPOINT=https://ocr-vision-serbia.cognitiveservices.azure.com/
AZURE_FORM_RECOGNIZER_KEY=<your-key>
LOCATION=westeurope

# Claude AI (Strukturna ekstrakcija)
ANTHROPIC_API_KEY=<your-key>

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Storage (Wasabi S3)
STORAGE_TYPE=s3
WASABI_ACCESS_KEY_ID=<your-key>
WASABI_SECRET_ACCESS_KEY=<your-key>
WASABI_BUCKET=bzr-ai-storage
WASABI_REGION=eu-central-2
WASABI_ENDPOINT=https://s3.eu-central-2.wasabisys.com
```

## Performanse

### Tipično vreme procesiranja:

- **OCR (Azure)**: 2-5 sekundi po strani
- **AI Ekstrakcija (Claude)**: 5-10 sekundi
- **Data Mapping**: < 1 sekunda

**Primer** (dokument sa 10 strana):
- OCR: ~25 sekundi
- AI: ~8 sekundi
- Mapping: 0.5 sekundi
- **Ukupno**: ~33 sekundi

### Optimizacija:

- Background processing (korisnik ne čeka)
- Keširane tabele (hazard types, itd.)
- Batch operacije za veći broj zaposlenih

## Ograničenja

### Azure Form Recognizer:
- Maksimalna veličina fajla: 500 MB
- Maksimalan broj stranica: 2000
- Podržani jezici: 100+ (uključujući srpski)

### Claude AI:
- Maksimalna veličina dokumenta: 10 MB
- PDF stranice: 100 (Vision API)
- Rate limiting: zavisi od plan-a

### Sistem:
- Maksimalna veličina upload-a: 10 MB (konfigurisano u API-ju)
- Concurrent procesiranje: 5 dokumenata (može se podesiti)

## Greške i Dijagnostika

### Česte greške:

1. **"Azure Form Recognizer client not initialized"**
   - Proverite da su postavljene env varijable:
     - `AZURE_FORM_RECOGNIZER_ENDPOINT`
     - `AZURE_FORM_RECOGNIZER_KEY`

2. **"No text response from Claude API"**
   - Proverite `ANTHROPIC_API_KEY`
   - Proverite da li dokument ima validan sadržaj

3. **"Company name is required"**
   - Dokument ne sadrži podatke o preduzećiu
   - Može se proslediti `companyId` parametar

### Logovi:

Svi logovi se pišu kroz Pino logger:

```bash
# Prati logove u development modu
npm run dev

# Filtriranje OCR logova
npm run dev | grep "OCR"

# Filtriranje AI ekstrakcije
npm run dev | grep "AI extraction"
```

## Primeri Korišćenja

### Primer 1: Upload i procesiranje skeniranog dokumenta

```typescript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('useOcr', 'true'); // Force OCR

const response = await fetch('http://localhost:3000/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Document ID:', result.fileId);

// Provera statusa
const statusResponse = await fetch(
  `http://localhost:3000/api/documents/${result.fileId}/status`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const status = await statusResponse.json();
console.log('Status:', status.status);
console.log('Extracted data:', status.extractedData);
```

### Primer 2: Direktna upotreba servisa (backend)

```typescript
import { documentExtractionService } from './services/document-extraction.service';
import { dataMappingService } from './services/data-mapping.service';

// Ekstrakcija
const extractedData = await documentExtractionService.extractDataFromDocument(
  fileBuffer,
  'application/pdf',
  'akt.pdf',
  true // useOcr
);

// Mapiranje
const result = await dataMappingService.mapExtractedDataToDatabase(
  extractedData,
  userId,
  documentId,
  companyId
);

console.log(`Created ${result.positionsCreated} positions`);
console.log(`Created ${result.workersCreated} workers`);
```

## Buduća Unapređenja

- [ ] DOCX ekstrakcija (trenutno samo PDF i slike)
- [ ] Batch upload (više dokumenata odjednom)
- [ ] Napredna deduplicacija (fuzzy matching)
- [ ] AI asistent za popunjavanje nedostajućih podataka
- [ ] Automatska kategorizacija dokumenata
- [ ] Export ekstrahovanih podataka u Excel/CSV
- [ ] OCR confidence threshold (preskakanje loše skeniranih dokumenata)
- [ ] Multi-language support (engleski, nemački)

## Podrška

Za dodatne informacije ili probleme:
- Email: office@bzr-portal.com
- Dokumentacija: https://bzr-portal.com/docs
