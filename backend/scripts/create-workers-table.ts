/**
 * Script to create workers table
 *
 * Run: npx tsx scripts/create-workers-table.ts
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env file (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function createWorkersTable() {
  try {
    console.log('📦 Creating workers table...');

    await sql`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        position_id INTEGER REFERENCES work_positions(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        jmbg VARCHAR(13),
        gender VARCHAR(1) NOT NULL,
        date_of_birth DATE,
        education VARCHAR(255),
        coefficient VARCHAR(50),
        years_of_experience VARCHAR(50),
        notes TEXT,
        is_deleted BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
    `;

    console.log('✅ Workers table created successfully');

    // Close connection
    await sql.end();
  } catch (error) {
    console.error('❌ Failed to create workers table:', error);
    await sql.end();
    process.exit(1);
  }
}

createWorkersTable();
