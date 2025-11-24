/**
 * Document Upload Routes - Hono HTTP Endpoints
 *
 * Handles multipart/form-data file uploads (tRPC doesn't support this natively).
 * Uploads to Wasabi S3, processes with Claude AI, and saves to database.
 *
 * Route: POST /api/documents/upload
 */

import { Hono } from 'hono';
import { db } from '../db';
import { companies, uploadedDocuments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { storageService } from '../services/storage.service';
import { documentExtractionService } from '../services/document-extraction.service';
import { dataMappingService } from '../services/data-mapping.service';
import { verifyAccessToken } from '../lib/utils/jwt';
import { logger } from '../utils/logger';

const app = new Hono();

// File upload endpoint with authentication
app.post('/upload', async (c) => {
  try {
    // 1. Verify authentication
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
    } catch (error) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    // 2. Get user's company
    const userCompanies = await db.select().from(companies).where(eq(companies.userId, userId));

    if (userCompanies.length === 0) {
      return c.json(
        { success: false, error: 'Морате прво креирати предузеће' },
        400
      );
    }

    const companyId = userCompanies[0]!.id;

    // 3. Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ success: false, error: 'Фајл није пронађен' }, 400);
    }

    // 4. Validate file
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
    ];

    if (!allowedTypes.includes(file.type)) {
      return c.json(
        {
          success: false,
          error: 'Неподржан формат. Дозвољени: PDF, DOCX, PNG, JPG',
        },
        400
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json(
        { success: false, error: 'Фајл је превелик (максимум 10MB)' },
        400
      );
    }

    // 5. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 6. Determine file type
    let fileType: string;
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      fileType = 'docx';
    } else if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else {
      fileType = 'other';
    }

    logger.info({
      msg: 'Processing document upload',
      userId,
      companyId,
      filename: file.name,
      fileType,
      fileSize: file.size,
    });

    // 7. Upload to Wasabi S3
    const { storageKey, storageUrl } = await storageService.uploadUserDocument({
      companyId,
      userId,
      fileBuffer,
      originalFilename: file.name,
      contentType: file.type,
    });

    // 8. Create database record with 'pending' status
    const [uploadedDoc] = await db
      .insert(uploadedDocuments)
      .values({
        userId,
        companyId,
        filename: storageKey.split('/').pop() || file.name,
        originalFilename: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        storageUrl,
        storageKey,
        processingStatus: 'processing',
        uploadedAt: new Date(),
      })
      .returning();

    // 9. Get optional useOcr flag from form data
    const useOcrParam = formData.get('useOcr');
    const useOcr = useOcrParam === 'true' || useOcrParam === '1';

    // 10. Start AI extraction in background (non-blocking)
    // We immediately return success to the user, then process async
    processDocumentExtraction(
      uploadedDoc.id,
      fileBuffer,
      file.type,
      file.name,
      userId,
      companyId,
      useOcr
    ).catch((error) => {
      logger.error({
        msg: 'Background AI extraction failed',
        error,
        documentId: uploadedDoc.id,
      });
    });

    return c.json({
      success: true,
      fileId: uploadedDoc.id,
      filename: file.name,
      fileSize: file.size,
      message: 'Фајл је отпремљен. OCR и AI обрада је у току...',
    });
  } catch (error) {
    logger.error({
      msg: 'Document upload failed',
      error,
    });
    return c.json(
      {
        success: false,
        error: 'Грешка при отпремању фајла',
      },
      500
    );
  }
});

// Get document processing status
app.get('/:documentId/status', async (c) => {
  try {
    // Verify authentication
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
    } catch (error) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    const documentId = parseInt(c.req.param('documentId'));

    if (isNaN(documentId)) {
      return c.json({ success: false, error: 'Invalid document ID' }, 400);
    }

    // Get document record
    const document = await db.query.uploadedDocuments.findFirst({
      where: eq(uploadedDocuments.id, documentId),
    });

    if (!document) {
      return c.json({ success: false, error: 'Документ није пронађен' }, 404);
    }

    // Check ownership
    if (document.userId !== userId) {
      return c.json({ success: false, error: 'Немате приступ овом документу' }, 403);
    }

    return c.json({
      success: true,
      status: document.processingStatus,
      processedAt: document.processedAt,
      extractedData: document.extractedData,
      error: document.processingError,
    });
  } catch (error) {
    logger.error({
      msg: 'Failed to get document status',
      error,
    });
    return c.json({ success: false, error: 'Грешка при провери статуса' }, 500);
  }
});

/**
 * Process document extraction in background with OCR support
 *
 * Two-stage pipeline:
 * 1. OCR extraction (if needed for scanned documents)
 * 2. AI extraction (Claude)
 * 3. Automatic data mapping to database
 */
async function processDocumentExtraction(
  documentId: number,
  fileBuffer: Buffer,
  mimeType: string,
  originalFilename: string,
  userId: number,
  companyId: number,
  useOcr: boolean = false
): Promise<void> {
  try {
    logger.info({
      msg: 'Starting background document processing',
      documentId,
      filename: originalFilename,
      useOcr,
    });

    // Stage 1 & 2: OCR + AI extraction
    const extractedData = await documentExtractionService.extractDataFromDocument(
      fileBuffer,
      mimeType,
      originalFilename,
      useOcr
    );

    // Update document with extracted data
    await db
      .update(uploadedDocuments)
      .set({
        extractedData: extractedData as any,
      })
      .where(eq(uploadedDocuments.id, documentId));

    logger.info({
      msg: 'Extraction completed, starting data mapping',
      documentId,
      positionsExtracted: extractedData.positions?.length || 0,
      employeesExtracted: extractedData.employees?.length || 0,
      hazardsExtracted: extractedData.hazards?.length || 0,
    });

    // Stage 3: Automatic data mapping to database
    const mappingResult = await dataMappingService.mapExtractedDataToDatabase(
      extractedData,
      userId,
      documentId,
      companyId
    );

    logger.info({
      msg: 'Document processing completed successfully',
      documentId,
      mappingResult: {
        companyId: mappingResult.companyId,
        companyCreated: mappingResult.companyCreated,
        positionsCreated: mappingResult.positionsCreated,
        workersCreated: mappingResult.workersCreated,
        hazardsIdentified: mappingResult.hazardsIdentified,
        warnings: mappingResult.warnings.length,
        errors: mappingResult.errors.length,
      },
    });

    // Log any warnings or errors (but don't fail the process)
    if (mappingResult.warnings.length > 0) {
      logger.warn({
        msg: 'Data mapping completed with warnings',
        documentId,
        warnings: mappingResult.warnings,
      });
    }

    if (mappingResult.errors.length > 0) {
      logger.error({
        msg: 'Data mapping completed with errors',
        documentId,
        errors: mappingResult.errors,
      });
    }
  } catch (error) {
    logger.error({
      msg: 'Document processing failed',
      error,
      documentId,
    });

    // Update database with error status
    await db
      .update(uploadedDocuments)
      .set({
        processingStatus: 'failed',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(uploadedDocuments.id, documentId));
  }
}

export default app;
