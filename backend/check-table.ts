import { config } from 'dotenv';
config();

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function checkTable() {
  try {
    console.log('📋 Checking email_verification_tokens structure...\n');

    // Check columns
    const columns = await sql`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'email_verification_tokens'
      ORDER BY ordinal_position
    `;

    console.log('Current columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check foreign keys
    const fks = await sql`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'email_verification_tokens'
        AND tc.constraint_type = 'FOREIGN KEY'
    `;

    console.log('\nForeign keys:');
    fks.forEach(fk => {
      console.log(`  - ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
    });

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

checkTable();
