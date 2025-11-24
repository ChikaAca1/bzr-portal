/**
 * Script to create Wasabi S3 bucket for document storage
 *
 * Run: npx tsx scripts/create-s3-bucket.ts
 */

import { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env file (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const WASABI_ENDPOINT = process.env.WASABI_ENDPOINT || 'https://s3.eu-central-1.wasabisys.com';
const WASABI_REGION = process.env.WASABI_REGION || 'eu-central-1';
const WASABI_BUCKET = process.env.WASABI_BUCKET || 'bzr-ai-storage';

if (!process.env.WASABI_ACCESS_KEY_ID || !process.env.WASABI_SECRET_ACCESS_KEY) {
  console.error('❌ Missing Wasabi credentials in .env file');
  process.exit(1);
}

const s3Client = new S3Client({
  endpoint: WASABI_ENDPOINT,
  region: WASABI_REGION,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function createBucket() {
  try {
    // Check if bucket already exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: WASABI_BUCKET }));
      console.log(`✅ Bucket '${WASABI_BUCKET}' already exists`);
      return;
    } catch (error: any) {
      if (error.name !== 'NotFound') {
        throw error;
      }
      // Bucket doesn't exist, continue to create it
    }

    // Create bucket
    console.log(`📦 Creating bucket: ${WASABI_BUCKET}`);
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: WASABI_BUCKET,
      })
    );

    console.log(`✅ Bucket '${WASABI_BUCKET}' created successfully`);

    // Configure CORS for browser uploads
    console.log(`⚙️  Configuring CORS for bucket...`);
    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: WASABI_BUCKET,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['http://localhost:5173', 'http://localhost:5174', 'https://bzr-portal.com'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    );

    console.log(`✅ CORS configured successfully`);
    console.log('\n🎉 Wasabi S3 bucket setup complete!');
    console.log(`   Bucket: ${WASABI_BUCKET}`);
    console.log(`   Region: ${WASABI_REGION}`);
    console.log(`   Endpoint: ${WASABI_ENDPOINT}`);
  } catch (error) {
    console.error('❌ Failed to create bucket:', error);
    process.exit(1);
  }
}

createBucket();
