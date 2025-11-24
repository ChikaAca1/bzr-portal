import { config } from 'dotenv';
config();

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function addForeignKey() {
  try {
    console.log('🔗 Adding foreign key constraint...\n');

    // Add foreign key
    await sql`
      ALTER TABLE email_verification_tokens
      ADD CONSTRAINT fk_email_verification_tokens_user_id
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
    `;

    console.log('✅ Foreign key constraint added successfully!');

    await sql.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === '42710') {
      console.log('✅ Foreign key constraint already exists!');
      await sql.end();
      process.exit(0);
    } else {
      console.error('❌ Error:', error);
      await sql.end();
      process.exit(1);
    }
  }
}

addForeignKey();
