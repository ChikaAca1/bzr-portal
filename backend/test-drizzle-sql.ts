/**
 * Test Drizzle SQL Generation
 *
 * Enables SQL logging to see exact queries Drizzle generates
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema/index.js';
import { users } from './src/db/schema/users.js';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;

// Create postgres client with logging
const client = postgres(connectionString, {
  debug: (connection, query, parameters) => {
    console.log('\n🔍 SQL Query:');
    console.log(query);
    console.log('📦 Parameters:', parameters);
  },
});

// Create drizzle instance with schema and logging
const db = drizzle(client, { schema, logger: true });

async function testSqlGeneration() {
  console.log('🧪 Testing Drizzle SQL generation...\n');

  try {
    console.log('='.repeat(80));
    console.log('Test 1: Simple findFirst query');
    console.log('='.repeat(80));

    const result = await db.query.users.findFirst({
      where: eq(users.email, 'test@example.com'),
    });

    console.log('\n✅ Query executed successfully');
    console.log('Result:', result);
  } catch (error) {
    console.error('\n❌ Query failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  } finally {
    await client.end();
    process.exit(0);
  }
}

testSqlGeneration();
