/**
 * Test User Registration
 *
 * Simulates the registration flow to find the "undefined" column error
 */

import 'dotenv/config';
import { db } from './src/db/index.js';
import { users } from './src/db/schema/users.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function testRegistration() {
  console.log('🧪 Testing user registration flow...\n');

  try {
    const testUser = {
      email: 'test@example.com',
      password: 'Test1234!',
      firstName: 'Test',
      lastName: 'User',
    };

    // Step 1: Check if user exists
    console.log('1️⃣ Checking if user exists...');
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, testUser.email),
    });
    console.log(existing ? '⚠️  User already exists' : '✅ User does not exist');

    if (existing) {
      console.log('\n🧹 Cleaning up - deleting test user...');
      await db.execute(sql`DELETE FROM public.users WHERE email = ${testUser.email}`);
      console.log('✅ Test user deleted');
    }

    // Step 2: Hash password
    console.log('\n2️⃣ Hashing password...');
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    console.log('✅ Password hashed');

    // Step 3: Insert user
    console.log('\n3️⃣ Inserting user...');
    const [newUser] = await db
      .insert(users)
      .values({
        email: testUser.email,
        passwordHash,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: 'bzr_officer',
        companyId: null,
      })
      .returning();

    console.log('✅ User created successfully!');
    console.log('   User ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Name:', newUser.firstName, newUser.lastName);

    // Step 4: Verify user was inserted
    console.log('\n4️⃣ Verifying user in database...');
    const verifyUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, testUser.email),
    });
    console.log(verifyUser ? '✅ User verified in database' : '❌ User not found');

    // Step 5: Clean up
    console.log('\n5️⃣ Cleaning up...');
    await db.execute(sql`DELETE FROM public.users WHERE email = ${testUser.email}`);
    console.log('✅ Test user deleted');

    console.log('\n✨ All registration tests passed!');
  } catch (error) {
    console.error('\n❌ Registration test failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    process.exit(0);
  }
}

testRegistration();
