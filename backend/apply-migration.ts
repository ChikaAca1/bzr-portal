import 'dotenv/config';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function applyMigration() {
  try {
    console.log('📄 Reading migration file...');
    const migrationSQL = readFileSync(
      join(__dirname, 'drizzle', '0005_wet_hardball.sql'),
      'utf-8'
    );

    console.log('🚀 Applying migration...');

    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('⚡ Executing:', statement.substring(0, 80) + '...');
      try {
        await sql.unsafe(statement);
        console.log('✅ Success');
      } catch (err: any) {
        // Ignore "already exists" errors
        if (err.message?.includes('already exists')) {
          console.log('⚠️  Already exists, skipping');
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyMigration();
