/**
 * Wasabi S3 Storage Configuration
 *
 * Wasabi provides S3-compatible object storage at $6.99/TB/month
 * with ZERO egress/bandwidth fees - critical for budget constraint.
 *
 * Budget Constraint: ~$7/month until 100 paying customers per constitution.md
 */

import { S3Client } from '@aws-sdk/client-s3';

// Wasabi endpoint for EU Central region (Frankfurt)
const WASABI_ENDPOINT = process.env.WASABI_ENDPOINT || 'https://s3.eu-central-1.wasabisys.com';
const WASABI_REGION = process.env.WASABI_REGION || 'eu-central-1';

if (!process.env.WASABI_ACCESS_KEY_ID) {
  throw new Error('WASABI_ACCESS_KEY_ID environment variable is required');
}

if (!process.env.WASABI_SECRET_ACCESS_KEY) {
  throw new Error('WASABI_SECRET_ACCESS_KEY environment variable is required');
}

/**
 * Wasabi S3 client configured with custom endpoint
 *
 * @example
 * ```ts
 * import { s3Client } from './lib/s3';
 * import { PutObjectCommand } from '@aws-sdk/client-s3';
 *
 * await s3Client.send(new PutObjectCommand({
 *   Bucket: 'bzr-portal-documents',
 *   Key: 'documents/company_123/doc_456.docx',
 *   Body: buffer,
 * }));
 * ```
 */
export const s3Client = new S3Client({
  endpoint: WASABI_ENDPOINT,
  region: WASABI_REGION,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  },
  // Force path-style URLs for Wasabi compatibility
  forcePathStyle: true,
});

/**
 * Wasabi bucket name for document storage
 * Folder structure: documents/{company_id}/{document_id}.docx
 */
export const WASABI_BUCKET_NAME = process.env.WASABI_BUCKET_NAME || 'bzr-portal-documents';

/**
 * Pre-signed URL expiration time (1 hour per spec.md FR-052e)
 */
export const PRESIGNED_URL_EXPIRY_SECONDS = 3600;
