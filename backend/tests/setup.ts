/**
 * Vitest Setup File
 *
 * This file runs before all tests and sets up the test environment.
 * Environment variables set here will be available to all test files.
 */

// Set required environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only-do-not-use-in-production';
process.env.JWT_EXPIRY = '7d';
process.env.NODE_ENV = 'test';

// Optional: Set other environment variables if needed
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/bzr_portal_test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_KEY = 'test-key';
process.env.WASABI_ACCESS_KEY_ID = 'test-access-key';
process.env.WASABI_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.WASABI_BUCKET_NAME = 'test-bucket';
process.env.WASABI_REGION = 'eu-central-1';
process.env.WASABI_ENDPOINT = 'https://s3.eu-central-1.wasabisys.com';
process.env.RESEND_API_KEY = 'test-resend-key';
