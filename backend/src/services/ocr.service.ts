/**
 * Azure Form Recognizer OCR Service
 *
 * Specialized service for extracting text from scanned Serbian Cyrillic documents.
 * Uses Azure AI Document Intelligence (formerly Form Recognizer) with Serbian language support.
 *
 * Features:
 * - Serbian Cyrillic and Latin script recognition
 * - Layout analysis (tables, forms, structured data)
 * - Handwriting recognition
 * - Multi-page document processing
 */

import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';
import { logger } from '../utils/logger.js';

// Initialize Azure Form Recognizer client
const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

if (!endpoint || !apiKey) {
  logger.warn({
    msg: 'Azure Form Recognizer credentials not configured',
    hasEndpoint: !!endpoint,
    hasKey: !!apiKey,
  });
}

const client = endpoint && apiKey
  ? new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey))
  : null;

/**
 * OCR Result Structure
 */
export interface OcrResult {
  /** Full extracted text content */
  fullText: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** Number of pages processed */
  pageCount: number;

  /** Page-by-page results */
  pages: OcrPage[];

  /** Extracted tables (if any) */
  tables?: OcrTable[];

  /** Key-value pairs detected (for forms) */
  keyValuePairs?: Array<{ key: string; value: string; confidence: number }>;

  /** Processing metadata */
  metadata: {
    modelId: string;
    processingTimeMs: number;
    language: string;
  };
}

export interface OcrPage {
  pageNumber: number;
  text: string;
  confidence: number;
  width: number;
  height: number;
  angle: number;
  lines: OcrLine[];
}

export interface OcrLine {
  text: string;
  confidence: number;
  boundingBox: number[];
}

export interface OcrTable {
  pageNumber: number;
  rowCount: number;
  columnCount: number;
  cells: OcrTableCell[];
}

export interface OcrTableCell {
  rowIndex: number;
  columnIndex: number;
  text: string;
  confidence: number;
  isHeader: boolean;
}

/**
 * Extract text from document using Azure Form Recognizer
 *
 * @param fileBuffer - Document file buffer (PDF, PNG, JPEG, etc.)
 * @param mimeType - MIME type of the document
 * @param originalFilename - Original filename for logging
 * @returns OCR result with extracted text and metadata
 */
export async function extractTextWithOcr(
  fileBuffer: Buffer,
  mimeType: string,
  originalFilename: string
): Promise<OcrResult> {
  const startTime = Date.now();

  try {
    logger.info({
      msg: 'Starting Azure OCR extraction',
      filename: originalFilename,
      mimeType,
      fileSize: fileBuffer.length,
    });

    if (!client) {
      throw new Error('Azure Form Recognizer client not initialized. Check environment variables.');
    }

    // Start document analysis with Serbian language support
    // Using "prebuilt-read" model for general text extraction
    const poller = await client.beginAnalyzeDocument(
      'prebuilt-read', // Best model for general text extraction
      fileBuffer,
      {
        locale: 'sr-Cyrl-RS', // Serbian Cyrillic
      }
    );

    // Wait for completion
    const result = await poller.pollUntilDone();

    if (!result) {
      throw new Error('No result returned from Azure Form Recognizer');
    }

    const processingTimeMs = Date.now() - startTime;

    // Extract all text content
    const fullText = result.content || '';

    // Process pages
    const pages: OcrPage[] = (result.pages || []).map((page) => {
      const lines: OcrLine[] = (page.lines || []).map((line) => ({
        text: line.content || '',
        confidence: line.confidence || 0,
        boundingBox: line.polygon || [],
      }));

      return {
        pageNumber: page.pageNumber || 0,
        text: lines.map(l => l.text).join('\n'),
        confidence: lines.reduce((sum, l) => sum + l.confidence, 0) / (lines.length || 1),
        width: page.width || 0,
        height: page.height || 0,
        angle: page.angle || 0,
        lines,
      };
    });

    // Extract tables
    const tables: OcrTable[] = (result.tables || []).map((table) => {
      const cells: OcrTableCell[] = (table.cells || []).map((cell) => ({
        rowIndex: cell.rowIndex || 0,
        columnIndex: cell.columnIndex || 0,
        text: cell.content || '',
        confidence: cell.confidence || 0,
        isHeader: cell.kind === 'columnHeader' || cell.kind === 'rowHeader',
      }));

      return {
        pageNumber: table.boundingRegions?.[0]?.pageNumber || 1,
        rowCount: table.rowCount || 0,
        columnCount: table.columnCount || 0,
        cells,
      };
    });

    // Extract key-value pairs (for forms)
    const keyValuePairs = (result.keyValuePairs || [])
      .filter(pair => pair.key && pair.value)
      .map(pair => ({
        key: pair.key?.content || '',
        value: pair.value?.content || '',
        confidence: Math.min(pair.key?.confidence || 0, pair.value?.confidence || 0),
      }));

    // Calculate overall confidence
    const overallConfidence = pages.length > 0
      ? pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length
      : 0;

    const ocrResult: OcrResult = {
      fullText,
      confidence: overallConfidence,
      pageCount: pages.length,
      pages,
      tables: tables.length > 0 ? tables : undefined,
      keyValuePairs: keyValuePairs.length > 0 ? keyValuePairs : undefined,
      metadata: {
        modelId: 'prebuilt-read',
        processingTimeMs,
        language: 'sr-Cyrl-RS',
      },
    };

    logger.info({
      msg: 'Azure OCR extraction completed',
      filename: originalFilename,
      pageCount: pages.length,
      textLength: fullText.length,
      confidence: overallConfidence,
      processingTimeMs,
      tablesFound: tables.length,
      keyValuePairsFound: keyValuePairs.length,
    });

    return ocrResult;
  } catch (error) {
    logger.error({
      msg: 'Azure OCR extraction failed',
      error,
      filename: originalFilename,
      processingTimeMs: Date.now() - startTime,
    });
    throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from document and format for AI processing
 *
 * Combines OCR with intelligent formatting for better AI extraction results.
 */
export async function extractAndFormatForAi(
  fileBuffer: Buffer,
  mimeType: string,
  originalFilename: string
): Promise<string> {
  const ocrResult = await extractTextWithOcr(fileBuffer, mimeType, originalFilename);

  // Format text with page markers and table structure preserved
  let formattedText = '';

  // Add page-by-page text
  for (const page of ocrResult.pages) {
    formattedText += `\n===== СТРАНА ${page.pageNumber} =====\n\n`;
    formattedText += page.text;
    formattedText += '\n';
  }

  // Add tables in structured format
  if (ocrResult.tables && ocrResult.tables.length > 0) {
    formattedText += '\n\n===== ТАБЕЛЕ =====\n\n';

    for (const table of ocrResult.tables) {
      formattedText += `\nТабела на страни ${table.pageNumber} (${table.rowCount}x${table.columnCount}):\n`;

      // Group cells by row
      const rows: OcrTableCell[][] = [];
      for (let i = 0; i < table.rowCount; i++) {
        rows[i] = table.cells.filter(cell => cell.rowIndex === i);
      }

      // Format as markdown table
      for (const row of rows) {
        const rowText = row
          .sort((a, b) => a.columnIndex - b.columnIndex)
          .map(cell => cell.text)
          .join(' | ');
        formattedText += `| ${rowText} |\n`;
      }

      formattedText += '\n';
    }
  }

  // Add key-value pairs
  if (ocrResult.keyValuePairs && ocrResult.keyValuePairs.length > 0) {
    formattedText += '\n\n===== ПРЕПОЗНАТИ ПОДАЦИ =====\n\n';

    for (const pair of ocrResult.keyValuePairs) {
      formattedText += `${pair.key}: ${pair.value}\n`;
    }
  }

  return formattedText;
}

export const ocrService = {
  extractTextWithOcr,
  extractAndFormatForAi,
};
