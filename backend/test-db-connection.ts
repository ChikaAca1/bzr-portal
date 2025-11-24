/**
 * Test Database Connection and Schema
 *
 * Tests Supabase connection and verifies users table structure
 */

import 'dotenv/config';
import { db } from './src/db/index.js';
import * as schema from './src/db/schema/index.js';
import { users } from './src/db/schema/users.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ Connection successful!');
    console.log('   Current time:', result[0]);

    // Test 2: Check which schemas have users table
    console.log('\n2️⃣ Checking users tables in all schemas...');
    const schemaCheck = await db.execute(sql`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'users'
      ORDER BY table_schema
    `);
    console.log('✅ Users tables found:');
    (schemaCheck as any[]).forEach((tbl: any) => {
      console.log(`   - ${tbl.table_schema}.${tbl.table_name}`);
    });

    // Test 2b: Check public.users table structure
    console.log('\n2️⃣b Checking public.users table structure...');
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    console.log('✅ Users table columns:');
    (tableInfo as any[]).forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Test 3: Count users
    console.log('\n3️⃣ Counting users...');
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    console.log('✅ Total users:', countResult[0]);

    // Test 4: Try different query methods
    console.log('\n4️⃣ Testing different query methods...');
    const testEmail = 'test@example.com';

    // Method 1: Raw SQL
    console.log('   Method 1: Raw SQL...');
    const rawResult = await db.execute(sql`
      SELECT * FROM public.users WHERE email = ${testEmail} LIMIT 1
    `);
    console.log('   ✅ Raw SQL works:', rawResult.length > 0 ? 'User exists' : 'No user');

    // Method 2: Drizzle query builder
    console.log('   Method 2: Drizzle query...');
    try {
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, testEmail),
      });
      console.log('   ✅ Drizzle query works:', existingUser ? 'User exists' : 'No user');
    } catch (error) {
      console.log('   ❌ Drizzle query failed:', (error as Error).message);

      // Try to see what SQL Drizzle generates
      console.log('\n   Debugging Drizzle schema mapping...');
      console.log('   - Schema keys:', Object.keys(schema));
      console.log('   - Users columns:', Object.keys(users));
    }

    console.log('\n✨ All tests passed! Database is ready.');
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    process.exit(0);
  }
}

testConnection();
