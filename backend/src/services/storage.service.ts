/**
 * Storage Service - Wasabi S3 Integration
 *
 * Handles document upload, download, and deletion with multi-tenant isolation.
 *
 * Folder Structure: documents/{company_id}/{document_id}.{ext}
 *
 * Per spec.md:
 * - FR-052e: Pre-signed URLs with 1-hour expiration
 * - Budget constraint: Wasabi chosen for $6.99/TB flat rate, zero egress fees
 */

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, WASABI_BUCKET_NAME, PRESIGNED_URL_EXPIRY_SECONDS } from '../lib/s3';

export interface UploadOptions {
  companyId: number;
  documentId: string;
  fileBuffer: Buffer;
  fileName: string;
  contentType?: string;
}

export interface DownloadOptions {
  companyId: number;
  documentId: string;
  fileName: string;
}

/**
 * Upload document to Wasabi S3 with company_id isolation
 *
 * @param options Upload configuration
 * @returns S3 object key (path)
 *
 * @example
 * ```ts
 * const key = await storageService.uploadDocument({
 *   companyId: 123,
 *   documentId: 'doc_456',
 *   fileBuffer: docxBuffer,
 *   fileName: 'Akt_Procena_Rizika_Računovođa.docx',
 *   contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 * });
 * ```
 */
export async function uploadDocument(options: UploadOptions): Promise<string> {
  const { companyId, documentId, fileBuffer, fileName, contentType } = options;

  // Multi-tenant folder structure: documents/{company_id}/{document_id}_{filename}
  const key = `documents/${companyId}/${documentId}_${fileName}`;

  const command = new PutObjectCommand({
    Bucket: WASABI_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType || 'application/octet-stream',
    // Metadata for audit trail
    Metadata: {
      company_id: companyId.toString(),
      document_id: documentId,
      upload_timestamp: new Date().toISOString(),
    },
  });

  try {
    await s3Client.send(command);
    console.log(`✅ Uploaded document to Wasabi: ${key}`);
    return key;
  } catch (error) {
    console.error(`❌ Failed to upload document to Wasabi: ${key}`, error);
    throw new Error(`Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate pre-signed download URL (1-hour expiration per spec.md FR-052e)
 *
 * @param options Download configuration
 * @returns Pre-signed URL valid for 1 hour
 *
 * @example
 * ```ts
 * const downloadUrl = await storageService.getDownloadUrl({
 *   companyId: 123,
 *   documentId: 'doc_456',
 *   fileName: 'Akt_Procena_Rizika_Računovođa.docx',
 * });
 * // User can download from this URL for 1 hour
 * ```
 */
export async function getDownloadUrl(options: DownloadOptions): Promise<string> {
  const { companyId, documentId, fileName } = options;

  const key = `documents/${companyId}/${documentId}_${fileName}`;

  const command = new GetObjectCommand({
    Bucket: WASABI_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    console.log(`✅ Generated pre-signed URL for: ${key} (expires in ${PRESIGNED_URL_EXPIRY_SECONDS}s)`);
    return url;
  } catch (error) {
    console.error(`❌ Failed to generate pre-signed URL for: ${key}`, error);
    throw new Error(`Pre-signed URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete document from Wasabi S3
 *
 * @param options Download configuration (reused for deletion)
 * @returns true if deleted successfully
 */
export async function deleteDocument(options: DownloadOptions): Promise<boolean> {
  const { companyId, documentId, fileName } = options;

  const key = `documents/${companyId}/${documentId}_${fileName}`;

  const command = new DeleteObjectCommand({
    Bucket: WASABI_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log(`✅ Deleted document from Wasabi: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete document from Wasabi: ${key}`, error);
    throw new Error(`Document deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if document exists in Wasabi S3
 *
 * @param options Download configuration
 * @returns Document metadata if exists, null otherwise
 */
export async function documentExists(options: DownloadOptions): Promise<{ size: number; lastModified: Date } | null> {
  const { companyId, documentId, fileName } = options;

  const key = `documents/${companyId}/${documentId}_${fileName}`;

  const command = new HeadObjectCommand({
    Bucket: WASABI_BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    return {
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
    };
  } catch (error) {
    // Document does not exist (404 error)
    return null;
  }
}

/**
 * Calculate total storage used by a company (in bytes)
 *
 * Note: For Phase 6 (User Story 6 - referral system) this will be extended
 * to track per-user storage quotas.
 *
 * @param companyId Company ID
 * @returns Total storage used in bytes
 */
export async function getCompanyStorageUsage(companyId: number): Promise<number> {
  // TODO: Implement when S3 ListObjectsV2 is needed for quota tracking
  // For MVP, we'll track file sizes in the database (documents table)
  throw new Error('getCompanyStorageUsage not yet implemented - track file_size_bytes in database');
}

export const storageService = {
  uploadDocument,
  getDownloadUrl,
  deleteDocument,
  documentExists,
  getCompanyStorageUsage,
};
