/**
 * Apply Performance Indexes to Database (T054)
 *
 * Executes 0006_performance_indexes.sql migration
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyIndexes() {
  console.log('🔄 Applying performance indexes...\n');

  try {
    // Read SQL file
    const sqlPath = join(__dirname, '../drizzle/0006_performance_indexes.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Split by semicolons to get individual statements
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`Found ${statements.length} SQL statements\n`);

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      // Skip comments - they reference indexes that might not exist yet
      if (statement.startsWith('COMMENT')) {
        skipCount++;
        continue;
      }

      if (statement.startsWith('CREATE')) {
        try {
          await db.execute(sql.raw(statement + ';'));
          const indexName = statement.match(/idx_\w+/)?.[0] || 'unknown';
          console.log(`✅ Created index: ${indexName}`);
          successCount++;
        } catch (error: any) {
          // Index might already exist
          if (error.message?.includes('already exists')) {
            const indexName = statement.match(/idx_\w+/)?.[0] || 'unknown';
            console.log(`⏭️  Index already exists: ${indexName}`);
            skipCount++;
          } else {
            throw error;
          }
        }
      }
    }

    console.log(`\n✅ Index application complete!`);
    console.log(`   Created: ${successCount}`);
    console.log(`   Skipped: ${skipCount}`);
    console.log(`   Total: ${successCount + skipCount}`);

    // Analyze tables for query planner optimization
    console.log('\n🔄 Analyzing tables for query planner...\n');

    const tables = [
      'users',
      'sessions',
      'email_verification_tokens',
      'companies',
      'positions',
      'risk_assessments',
      'contact_form_submissions',
    ];

    for (const table of tables) {
      try {
        await db.execute(sql.raw(`ANALYZE ${table};`));
        console.log(`✅ Analyzed table: ${table}`);
      } catch (error) {
        console.log(`⏭️  Table not found: ${table} (might not exist yet)`);
      }
    }

    console.log('\n🎉 All done! Database is optimized for production.\n');
  } catch (error) {
    console.error('❌ Error applying indexes:', error);
    process.exit(1);
  }

  process.exit(0);
}

applyIndexes();
