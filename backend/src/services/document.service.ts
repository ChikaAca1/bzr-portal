/**
 * DocumentService - Complete document generation workflow
 *
 * Implements FR-034-FR-042 (8 mandatory sections), FR-052 (metadata tracking)
 * NFR-001 (<9s generation time requirement - Vercel 10s timeout with 1s buffer)
 *
 * Flow:
 * 1. Load template from file (cached)
 * 2. Fetch data via DocumentGeneratorService
 * 3. Generate DOCX with docx-templates
 * 4. Upload to Wasabi S3 (with retry)
 * 5. Save metadata to database
 * 6. Return download URL (1-hour pre-signed)
 */

import { eq, and, desc } from 'drizzle-orm';
import { db as defaultDb, documents } from '../db';
import type { DB } from '../db';
import { DocumentGeneratorService } from './document-generator.service';
import { StorageService } from './storage.service';
import fs from 'fs/promises';
import path from 'path';
import createReport from 'docx-templates';

type DocumentData = Awaited<ReturnType<DocumentGeneratorService['generateDocumentData']>>;

interface GeneratedDocument {
  id: number;
  filename: string;
  filePathS3: string;
  fileSizeBytes: number;
  downloadUrl: string;
  generationDurationMs: number;
  version: number;
}

export class DocumentService {
  private db: DB;
  private userId: string;
  private documentGenerator: DocumentGeneratorService;
  private storageService: StorageService;
  private static templateCache: Buffer | null = null;
  private static readonly TEMPLATE_PATH = path.join(
    process.cwd(),
    'templates',
    'akt-procena-rizika-template.docx'
  );

  constructor(db: DB = defaultDb, userId: string) {
    this.db = db;
    this.userId = userId;
    this.documentGenerator = new DocumentGeneratorService(db);
    this.storageService = new StorageService();
  }

  /**
   * Generate complete BZR Act document
   *
   * @param companyId - Company ID
   * @param positionId - Position ID (nullable for multi-position docs)
   * @returns Generated document with download URL
   */
  async generateDocument(
    companyId: number,
    positionId: number | null = null
  ): Promise<GeneratedDocument> {
    const startTime = Date.now();

    try {
      // Step 1: Load template (with caching)
      const templateBuffer = await this.loadTemplate();

      // Step 2: Fetch document data
      const documentData = await this.fetchDocumentData(companyId);

      // Step 3: Generate DOCX
      const docxBuffer = await this.generateDOCX(templateBuffer, documentData);

      // Step 4: Upload to S3 (with retry)
      const s3Result = await this.uploadToS3(docxBuffer, companyId, documentData);

      // Step 5: Check for existing version
      const version = await this.getNextVersion(companyId, positionId);

      // Step 6: Save metadata to database
      const generationDurationMs = Date.now() - startTime;
      const document = await this.saveDocumentMetadata({
        companyId,
        positionId,
        filename: s3Result.filename,
        filePathS3: s3Result.key,
        fileSizeBytes: s3Result.size,
        generationDurationMs,
        version,
      });

      // Step 7: Generate pre-signed download URL (1 hour expiration)
      const downloadUrl = await this.storageService.getPreSignedUrl(s3Result.key, 3600);

      return {
        id: document.id,
        filename: document.filename,
        filePathS3: document.filePathS3,
        fileSizeBytes: document.fileSizeBytes,
        downloadUrl,
        generationDurationMs,
        version: document.version,
      };
    } catch (error) {
      // Re-throw with Serbian error messages
      if (error instanceof Error) {
        if (error.message.includes('Предузеће')) throw error;
        if (error.message.includes('Forbidden')) throw error;
        if (error.message.includes('Предложак')) throw error;
        if (error.message.includes('Неуспешно отпремање')) throw error;

        if (error.message.includes('ENOENT')) {
          throw new Error('Предложак документа није пронађен.');
        }
        if (error.message.includes('Template rendering')) {
          throw new Error(`Грешка при генерисању документа: ${error.message}`);
        }
        if (error.message.includes('S3 upload')) {
          throw new Error('Неуспешно отпремање документа на сервер за складиштење.');
        }
      }
      throw error;
    }
  }

  /**
   * Load template from file system (with caching)
   */
  private async loadTemplate(): Promise<Buffer> {
    if (DocumentService.templateCache) {
      return DocumentService.templateCache;
    }

    try {
      // Check if file exists
      await fs.access(DocumentService.TEMPLATE_PATH);

      // Load template
      const buffer = await fs.readFile(DocumentService.TEMPLATE_PATH);

      // Cache for subsequent calls
      DocumentService.templateCache = buffer;

      return buffer;
    } catch (error) {
      throw new Error('Предложак документа није пронађен.');
    }
  }

  /**
   * Fetch document data from DocumentGeneratorService
   */
  private async fetchDocumentData(companyId: number): Promise<DocumentData> {
    return this.documentGenerator.generateDocumentData(companyId, this.userId);
  }

  /**
   * Generate DOCX using docx-templates
   */
  private async generateDOCX(templateBuffer: Buffer, documentData: DocumentData): Promise<Buffer> {
    try {
      const buffer = await createReport({
        template: templateBuffer,
        data: documentData,
        cmdDelimiter: ['{{', '}}'], // Mustache syntax
      });

      return buffer;
    } catch (error) {
      throw new Error(`Грешка при генерисању документа: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload to Wasabi S3 with retry logic (3 attempts)
   */
  private async uploadToS3(
    buffer: Buffer,
    companyId: number,
    documentData: DocumentData
  ): Promise<{ key: string; bucket: string; size: number; filename: string }> {
    const filename = `Akt_Procena_Rizika_${documentData.company.pib}.docx`;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.storageService.uploadDocument(buffer, {
          companyId,
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        return { ...result, filename };
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error('Неуспешно отпремање документа на сервер за складиштење.');
        }
        // Wait before retry (exponential backoff: 1s, 2s)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    // TypeScript exhaustiveness check
    throw new Error('Неуспешно отпремање документа на сервер за складиштење.');
  }

  /**
   * Get next version number for document
   */
  private async getNextVersion(companyId: number, positionId: number | null): Promise<number> {
    const existing = await this.db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.companyId, companyId),
          positionId !== null ? eq(documents.positionId, positionId) : eq(documents.positionId, positionId)
        )
      )
      .orderBy(desc(documents.version))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].version + 1;
    }

    return 1;
  }

  /**
   * Save document metadata to database
   */
  private async saveDocumentMetadata(data: {
    companyId: number;
    positionId: number | null;
    filename: string;
    filePathS3: string;
    fileSizeBytes: number;
    generationDurationMs: number;
    version: number;
  }) {
    const [document] = await this.db
      .insert(documents)
      .values({
        companyId: data.companyId,
        positionId: data.positionId,
        filename: data.filename,
        filePathS3: data.filePathS3,
        fileSizeBytes: data.fileSizeBytes,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        generationTimestamp: new Date(),
        generationDurationMs: data.generationDurationMs,
        version: data.version,
        documentType: 'akt_procena_rizika',
        isDeleted: false,
        deletedAt: null,
      })
      .returning();

    return document;
  }
}
