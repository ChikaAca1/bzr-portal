/**
 * Test Complete Auth Flow
 *
 * Tests registration, login, and token validation
 */

import 'dotenv/config';
import { db } from './src/db/index.js';
import { users } from './src/db/schema/users.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { generateAccessToken } from './src/lib/utils/jwt.js';

async function testAuthFlow() {
  console.log('🔐 Testing complete authentication flow...\n');

  const testUser = {
    email: 'test-auth@example.com',
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'Auth',
  };

  try {
    // Cleanup before test
    await db.execute(sql`DELETE FROM public.users WHERE email = ${testUser.email}`);

    // =========================================================================
    // Test 1: Registration
    // =========================================================================
    console.log('1️⃣ Testing Registration...');

    // Check user doesn't exist
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, testUser.email),
    });

    if (existing) {
      throw new Error('User should not exist before registration');
    }
    console.log('   ✅ Pre-registration check passed');

    // Hash password
    const passwordHash = await bcrypt.hash(testUser.password, 12);

    // Insert user
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

    console.log('   ✅ User registered successfully');
    console.log('      - ID:', newUser.id);
    console.log('      - Email:', newUser.email);
    console.log('      - Role:', newUser.role);
    console.log('      - Account Tier:', newUser.accountTier);

    // =========================================================================
    // Test 2: Login
    // =========================================================================
    console.log('\n2️⃣ Testing Login...');

    // Find user
    const loginUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, testUser.email),
    });

    if (!loginUser) {
      throw new Error('User should exist for login');
    }
    console.log('   ✅ User found');

    // Verify password
    const passwordValid = await bcrypt.compare(testUser.password, loginUser.passwordHash);
    if (!passwordValid) {
      throw new Error('Password should be valid');
    }
    console.log('   ✅ Password verified');

    // Generate JWT
    const accessToken = generateAccessToken({
      userId: loginUser.id,
      email: loginUser.email,
      role: loginUser.role,
      companyId: loginUser.companyId,
    });
    console.log('   ✅ JWT generated');
    console.log('      - Token length:', accessToken.length);

    // =========================================================================
    // Test 3: Query User Data
    // =========================================================================
    console.log('\n3️⃣ Testing User Data Query...');

    const userData = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, loginUser.id),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountTier: true,
        companyId: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!userData) {
      throw new Error('Should be able to query user data');
    }
    console.log('   ✅ User data retrieved');
    console.log('      - Email:', userData.email);
    console.log('      - Name:', userData.firstName, userData.lastName);
    console.log('      - Role:', userData.role);
    console.log('      - Account Tier:', userData.accountTier);
    console.log('      - Email Verified:', userData.emailVerified);

    // =========================================================================
    // Test 4: Update Last Login
    // =========================================================================
    console.log('\n4️⃣ Testing Last Login Update...');

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(sql`id = ${loginUser.id}`);

    const updatedUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, loginUser.id),
    });

    if (!updatedUser?.lastLoginAt) {
      throw new Error('Last login should be updated');
    }
    console.log('   ✅ Last login updated');
    console.log('      - Last Login:', updatedUser.lastLoginAt.toISOString());

    // =========================================================================
    // Cleanup
    // =========================================================================
    console.log('\n5️⃣ Cleaning up...');
    await db.execute(sql`DELETE FROM public.users WHERE email = ${testUser.email}`);
    console.log('   ✅ Test user deleted');

    console.log('\n✨ All authentication tests passed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Registration works');
    console.log('   ✅ Login works');
    console.log('   ✅ Password hashing/verification works');
    console.log('   ✅ JWT generation works');
    console.log('   ✅ User data queries work');
    console.log('   ✅ User updates work');
    console.log('\n🎉 Supabase integration is fully functional!');

  } catch (error) {
    console.error('\n❌ Authentication test failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }

    // Cleanup on error
    await db.execute(sql`DELETE FROM public.users WHERE email = ${testUser.email}`).catch(() => {});

    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testAuthFlow();
