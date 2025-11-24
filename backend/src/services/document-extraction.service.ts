/**
 * Document Extraction Service - AI-Powered Data Extraction
 *
 * Two-stage extraction pipeline:
 * 1. Azure Form Recognizer: OCR for scanned Serbian Cyrillic documents
 * 2. Claude AI: Structured data extraction from text
 *
 * Extracts:
 * - Work positions (titles, descriptions, hazards)
 * - Employees (names, positions, JMBG)
 * - Hazards (descriptions, categories, severity)
 * - Company info (name, PIB, address)
 *
 * Supports PDF, DOCX, and scanned images.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { ocrService } from './ocr.service.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ExtractedPosition {
  title: string;
  description?: string;
  hazards?: string[];
  employeeCount?: number;
}

export interface ExtractedEmployee {
  name: string;
  position?: string;
  jmbg?: string;
}

export interface ExtractedHazard {
  description: string;
  category?: string;
  severity?: number;
}

export interface ExtractedCompanyInfo {
  name?: string;
  pib?: string;
  address?: string;
}

export interface ExtractedData {
  positions?: ExtractedPosition[];
  employees?: ExtractedEmployee[];
  hazards?: ExtractedHazard[];
  protectiveMeasures?: string[];
  companyInfo?: ExtractedCompanyInfo;
  rawText?: string;
}

const EXTRACTION_PROMPT = `Анализирај овај документ и екстрахуј следеће информације у JSON формату:

НАПОМЕНА: Документ је на српском језику (ћирилица или латиница). Приликом екстракције користи српску терминологију.

Екстрахуј:

1. **Радна места** (positions): Листа радних места са:
   - title: Назив радног места (нпр. "Рачуновођа", "Директор", "Радник на одржавању")
   - description: Опис послова (ако постоји)
   - hazards: Листа опасности/штетности за то радно место
   - employeeCount: Број запослених на том радном месту (ако је наведено)

2. **Запослени** (employees): Листа запослених са:
   - name: Име и презиме
   - position: Радно место (ако је наведено)
   - jmbg: ЈМБГ (ако је наведен)

3. **Опасности и штетности** (hazards): Листа идентификованих опасности са:
   - description: Опис опасности
   - category: Категорија (физичке, хемијске, биолошке, ергономске, психосоцијалне)
   - severity: Процењена озбиљност 1-5 (ако је наведена)

4. **Мере заштите** (protectiveMeasures): Листа постојећих мера заштите (string[])

5. **Подаци о предузећу** (companyInfo):
   - name: Назив предузећа
   - pib: ПИБ број
   - address: Адреса

Врати САМО валидан JSON без додатних коментара.

Пример формата:
{
  "positions": [
    {
      "title": "Рачуновођа",
      "description": "Обавља послове књиговодства",
      "hazards": ["Рад на рачунару - излагање електромагнетном зрачењу", "Дуготрајно седење"],
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
  ],
  "companyInfo": {
    "name": "ЈКП ЗЕЛЕНИЛО ПАНЧЕВО",
    "pib": "101047068",
    "address": "Панчево, Војводе Радомира Путника 12"
  }
}`;

/**
 * Extract structured data from document using two-stage pipeline
 *
 * Stage 1: OCR (for scanned documents)
 * Stage 2: AI extraction (Claude)
 */
export async function extractDataFromDocument(
  fileBuffer: Buffer,
  mimeType: string,
  originalFilename: string,
  useOcr: boolean = false
): Promise<ExtractedData> {
  try {
    logger.info({
      msg: 'Starting document extraction',
      filename: originalFilename,
      mimeType,
      fileSize: fileBuffer.length,
      useOcr,
    });

    let extractedData: ExtractedData;

    // Determine if document needs OCR
    const needsOcr = useOcr || isScannedDocument(mimeType, originalFilename);

    if (needsOcr) {
      // Two-stage extraction: OCR + AI
      logger.info({
        msg: 'Document appears to be scanned, using OCR + AI pipeline',
        filename: originalFilename,
      });

      extractedData = await extractWithOcrAndAi(fileBuffer, mimeType, originalFilename);
    } else if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      // Use Claude Vision API directly for native digital documents
      extractedData = await extractWithVision(fileBuffer, mimeType);
    } else {
      // For DOCX, we'd need to extract text first (future enhancement)
      logger.warn({
        msg: 'DOCX extraction not yet implemented, returning empty extraction',
        filename: originalFilename,
      });
      extractedData = {
        rawText: 'DOCX text extraction not yet implemented',
      };
    }

    logger.info({
      msg: 'Document extraction completed',
      filename: originalFilename,
      positionsFound: extractedData.positions?.length || 0,
      employeesFound: extractedData.employees?.length || 0,
      hazardsFound: extractedData.hazards?.length || 0,
    });

    return extractedData;
  } catch (error) {
    logger.error({
      msg: 'Document extraction failed',
      error,
      filename: originalFilename,
    });
    throw new Error(`Document extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if document is likely scanned (needs OCR)
 */
function isScannedDocument(mimeType: string, filename: string): boolean {
  // Check if filename suggests scanned document
  const scannedKeywords = ['scan', 'sken', 'copy', 'kopija', 'fotografija', 'slika'];
  const lowerFilename = filename.toLowerCase();

  if (scannedKeywords.some(keyword => lowerFilename.includes(keyword))) {
    return true;
  }

  // For now, assume images might be scanned
  // PDFs could be native or scanned - we'll try OCR if Claude fails
  return mimeType.startsWith('image/');
}

/**
 * Extract using OCR + AI pipeline (for scanned documents)
 */
async function extractWithOcrAndAi(
  fileBuffer: Buffer,
  mimeType: string,
  originalFilename: string
): Promise<ExtractedData> {
  // Stage 1: OCR extraction
  const ocrText = await ocrService.extractAndFormatForAi(fileBuffer, mimeType, originalFilename);

  logger.info({
    msg: 'OCR extraction completed, proceeding to AI analysis',
    filename: originalFilename,
    textLength: ocrText.length,
  });

  // Stage 2: AI extraction from OCR text
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Ево текста екстрахованог из скенираног документа помоћу OCR-а:\n\n${ocrText}\n\n${EXTRACTION_PROMPT}`,
          },
        ],
      },
    ],
  });

  // Extract JSON from response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude API');
  }

  return parseClaudeResponse(textContent.text, ocrText);
}

/**
 * Extract using Claude Vision API (for images and PDFs)
 */
async function extractWithVision(fileBuffer: Buffer, mimeType: string): Promise<ExtractedData> {
  // Convert mimeType to Claude's expected format
  let claudeMimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf';

  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    claudeMimeType = 'image/jpeg';
  } else if (mimeType === 'image/png') {
    claudeMimeType = 'image/png';
  } else if (mimeType === 'image/gif') {
    claudeMimeType = 'image/gif';
  } else if (mimeType === 'image/webp') {
    claudeMimeType = 'image/webp';
  } else if (mimeType === 'application/pdf') {
    claudeMimeType = 'application/pdf';
  } else {
    throw new Error(`Unsupported mime type for Claude Vision: ${mimeType}`);
  }

  const base64Data = fileBuffer.toString('base64');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image' as const,
            source: {
              type: 'base64',
              media_type: claudeMimeType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  // Extract JSON from response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude API');
  }

  return parseClaudeResponse(textContent.text);
}

/**
 * Parse Claude API response and extract structured data
 */
function parseClaudeResponse(responseText: string, rawText?: string): ExtractedData {
  let jsonText = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(jsonText);
    return {
      positions: parsed.positions || [],
      employees: parsed.employees || [],
      hazards: parsed.hazards || [],
      protectiveMeasures: parsed.protectiveMeasures || [],
      companyInfo: parsed.companyInfo || {},
      rawText: rawText || responseText,
    };
  } catch (error) {
    logger.error({
      msg: 'Failed to parse Claude response as JSON',
      error,
      responseText: jsonText.substring(0, 500),
    });
    return {
      rawText: rawText || jsonText,
    };
  }
}

export const documentExtractionService = {
  extractDataFromDocument,
};
