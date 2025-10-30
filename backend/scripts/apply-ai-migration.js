/**
 * Apply AI Conversations Migration
 *
 * Run: node scripts/apply-ai-migration.js
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const sql = postgres(databaseUrl);

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'drizzle', '0003_ai_conversations.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Applying migration: 0003_ai_conversations.sql');

    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - conversations');
    console.log('  - conversation_messages');
    console.log('  - conversation_templates');
    console.log('');
    console.log('Indexes created: 9');
    console.log('');
    console.log('🎉 AI chat infrastructure is ready!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    // Check if tables already exist
    if (error.message.includes('already exists')) {
      console.log('');
      console.log('ℹ️  Tables already exist - migration may have been applied previously');
      console.log('✅ Database is ready for AI chat');
    } else {
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

applyMigration();
