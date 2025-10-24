/**
 * Blob Storage Utility (T059)
 *
 * Handles document uploads to Vercel Blob Storage.
 * Provides signed URLs for secure, time-limited downloads.
 *
 * Features:
 * - Upload DOCX documents to Vercel Blob
 * - Generate signed URLs with 24-hour expiration
 * - Public access for trial users (no authentication required for download)
 * - Automatic content-type detection for DOCX files
 * - Error handling with Serbian error messages
 *
 * Environment Variables Required:
 * - BLOB_READ_WRITE_TOKEN: Vercel Blob Storage token (from Vercel dashboard)
 */

import { put } from '@vercel/blob';
import { logInfo, logError } from './logger';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Blob storage configuration
 */
const BLOB_CONFIG = {
  /**
   * Read/write token from environment
   * Get from: Vercel Dashboard → Storage → Create Blob Store → Copy token
   */
  token: process.env.BLOB_READ_WRITE_TOKEN,

  /**
   * Access level: 'public' allows downloads without authentication
   * Trial users need public access to download documents
   */
  access: 'public' as const,

  /**
   * Content type for DOCX files
   */
  contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  /**
   * Cache control header (24 hours)
   */
  cacheControl: 'public, max-age=86400',
};

// =============================================================================
// Blob Storage Service
// =============================================================================

export class BlobStorage {
  /**
   * Upload document to Vercel Blob Storage
   *
   * Process:
   * 1. Validate environment token
   * 2. Upload buffer to Blob Storage with metadata
   * 3. Return signed URL with 24-hour expiration
   * 4. Log upload event
   *
   * URL Format: https://[store-id].public.blob.vercel-storage.com/[filename]-[hash].docx
   *
   * @param buffer - Document buffer (DOCX file)
   * @param filename - Target filename (e.g., "akt-123-456-1234567890.docx")
   * @returns Signed URL for document download
   * @throws Error if token missing or upload fails
   *
   * @example
   * const buffer = await DocumentGenerator.generate({ company, position, risks });
   * const url = await BlobStorage.uploadDocument(buffer, "akt-1-5-1698765432.docx");
   * // Returns: "https://abc123.public.blob.vercel-storage.com/akt-1-5-1698765432-xyz789.docx"
   */
  static async uploadDocument(buffer: Buffer, filename: string): Promise<string> {
    logInfo('Starting document upload to Blob Storage', {
      filename,
      size: buffer.length,
    });

    // 1. Validate environment token
    if (!BLOB_CONFIG.token) {
      logError('Blob Storage token missing', {
        filename,
        env: 'BLOB_READ_WRITE_TOKEN',
      });
      throw new Error(
        'Blob Storage токен није конфигурисан. Молимо контактирајте администратора.'
      );
    }

    try {
      // 2. Upload to Blob Storage
      const blob = await put(filename, buffer, {
        access: BLOB_CONFIG.access,
        token: BLOB_CONFIG.token,
        contentType: BLOB_CONFIG.contentType,
        cacheControlMaxAge: 86400, // 24 hours in seconds
      });

      logInfo('Document uploaded successfully to Blob Storage', {
        filename,
        url: blob.url,
        size: blob.size,
        contentType: blob.contentType,
      });

      // 3. Return signed URL
      return blob.url;
    } catch (error) {
      logError('Document upload to Blob Storage failed', {
        error: error instanceof Error ? error.message : String(error),
        filename,
        bufferSize: buffer.length,
      });

      throw new Error(
        `Грешка при отпремању документа: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate filename for document
   *
   * Format: akt-{companyId}-{positionId}-{timestamp}.docx
   *
   * Example: "akt-1-5-1698765432.docx"
   *
   * @param companyId - Company ID
   * @param positionId - Position ID
   * @returns Generated filename
   *
   * @example
   * const filename = BlobStorage.generateFilename(1, 5);
   * // Returns: "akt-1-5-1698765432.docx"
   */
  static generateFilename(companyId: number, positionId: number): string {
    const timestamp = Date.now();
    return `akt-${companyId}-${positionId}-${timestamp}.docx`;
  }

  /**
   * Check if Blob Storage is configured
   *
   * @returns true if BLOB_READ_WRITE_TOKEN is set
   */
  static isConfigured(): boolean {
    return !!BLOB_CONFIG.token;
  }

  /**
   * Get Blob Storage configuration status (for debugging)
   *
   * @returns Configuration status object
   */
  static getConfigStatus(): {
    configured: boolean;
    access: string;
    contentType: string;
  } {
    return {
      configured: this.isConfigured(),
      access: BLOB_CONFIG.access,
      contentType: BLOB_CONFIG.contentType,
    };
  }
}

// =============================================================================
// Usage Example
// =============================================================================

/*
Example usage in documents.generate tRPC procedure:

```typescript
import { DocumentGenerator } from '../services/DocumentGenerator';
import { BlobStorage } from '../lib/blob-storage';

// 1. Generate DOCX
const buffer = await DocumentGenerator.generate({
  company,
  position,
  risks,
});

// 2. Upload to Blob Storage
const filename = BlobStorage.generateFilename(company.id, position.id);
const url = await BlobStorage.uploadDocument(buffer, filename);

// 3. Return URL to client
return {
  url,           // "https://[...].blob.vercel-storage.com/akt-1-5-[...].docx"
  filename,      // "akt-1-5-1698765432.docx"
  size: buffer.length,
  expiresIn: '24 hours'
};
```

Frontend usage:

```typescript
// Call tRPC procedure
const { mutate } = trpc.documents.generate.useMutation();
mutate({ positionId: 5 }, {
  onSuccess: (data) => {
    // Direct download link (no authentication required)
    window.open(data.url, '_blank');

    // Or display in modal
    setDownloadUrl(data.url);
    setShowModal(true);
  }
});
```
*/
