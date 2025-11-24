import { config } from 'dotenv';
config();

import postgres from 'postgres';
import fs from 'fs';

const sql = postgres(process.env.DATABASE_URL!);

async function createTable() {
  try {
    console.log('📋 Creating email_verification_tokens table...\n');

    // Read SQL file
    const sqlContent = fs.readFileSync('./create-email-verification-table.sql', 'utf-8');

    // Execute SQL
    await sql.unsafe(sqlContent);

    console.log('✅ Table created successfully!');

    // Verify table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'email_verification_tokens'
      )
    `;

    console.log('✅ Table exists:', result[0].exists);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

createTable();
