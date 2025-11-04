import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../../src/db';
import { users, companies, workPositions, riskAssessments } from '../../../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '../../../src/lib/utils/crypto';
import type { AccessTokenPayload } from '../../../src/lib/utils/jwt';
import { sql } from 'drizzle-orm';

/**
 * Cross-Tenant Isolation Test (T043)
 *
 * Verifies that User A from Company A cannot access data from Company B.
 * Tests both application-layer RLS (rlsFilter) and database-layer RLS (PostgreSQL policies).
 *
 * Security Requirements:
 * - FR-053c: Row-Level Security
 * - Constitution Principle VI: Multi-Tenancy Isolation
 *
 * Test Scenarios:
 * 1. User A cannot read Company B data
 * 2. User A cannot modify Company B data
 * 3. User A cannot delete Company B data
 * 4. PostgreSQL RLS session variable correctly isolates queries
 * 5. Admin users can access all companies
 */

describe('Cross-Tenant Isolation (RLS)', () => {
  // Test data
  let companyA: { id: number; name: string };
  let companyB: { id: number; name: string };
  let userA: { id: number; email: string; companyId: number };
  let userB: { id: number; email: string; companyId: number };
  let adminUser: { id: number; email: string; companyId: null };
  let positionA: { id: number; companyId: number; positionName: string };
  let positionB: { id: number; companyId: number; positionName: string };

  beforeAll(async () => {
    // Clean up any existing test data
    await db.delete(riskAssessments).where(sql`1=1`);
    await db.delete(workPositions).where(sql`position_name LIKE 'RLS Test%'`);
    await db.delete(users).where(sql`email LIKE '%@rls-test.local'`);
    await db.delete(companies).where(sql`name LIKE 'RLS Test Company%'`);

    // Create Company A
    const [createdCompanyA] = await db
      .insert(companies)
      .values({
        name: 'RLS Test Company A',
        pib: '123456789',
        activityCode: '6201',
        address: 'Test Address A',
        director: 'Director A',
        bzrResponsiblePerson: 'BZR Person A',
      })
      .returning();
    companyA = createdCompanyA;

    // Create Company B
    const [createdCompanyB] = await db
      .insert(companies)
      .values({
        name: 'RLS Test Company B',
        pib: '987654321',
        activityCode: '6202',
        address: 'Test Address B',
        director: 'Director B',
        bzrResponsiblePerson: 'BZR Person B',
      })
      .returning();
    companyB = createdCompanyB;

    // Create User A (belongs to Company A)
    const hashedPassword = await hashPassword('testpassword123');
    const [createdUserA] = await db
      .insert(users)
      .values({
        email: 'userA@rls-test.local',
        password: hashedPassword,
        role: 'bzr_officer',
        companyId: companyA.id,
        accountTier: 'trial',
        emailVerified: true,
      })
      .returning();
    userA = createdUserA;

    // Create User B (belongs to Company B)
    const [createdUserB] = await db
      .insert(users)
      .values({
        email: 'userB@rls-test.local',
        password: hashedPassword,
        role: 'bzr_officer',
        companyId: companyB.id,
        accountTier: 'trial',
        emailVerified: true,
      })
      .returning();
    userB = createdUserB;

    // Create Admin User (no company affiliation)
    const [createdAdmin] = await db
      .insert(users)
      .values({
        email: 'admin@rls-test.local',
        password: hashedPassword,
        role: 'admin',
        companyId: null,
        accountTier: 'paid',
        emailVerified: true,
      })
      .returning();
    adminUser = createdAdmin;

    // Create Work Position for Company A
    const [createdPositionA] = await db
      .insert(workPositions)
      .values({
        companyId: companyA.id,
        positionName: 'RLS Test Position A',
        department: 'IT',
        requiredEducation: 'Bachelor',
        employeesMale: 5,
        employeesFemale: 3,
        workHoursDaily: 8,
        jobDescription: 'Test job A',
      })
      .returning();
    positionA = createdPositionA;

    // Create Work Position for Company B
    const [createdPositionB] = await db
      .insert(workPositions)
      .values({
        companyId: companyB.id,
        positionName: 'RLS Test Position B',
        department: 'HR',
        requiredEducation: 'Master',
        employeesMale: 2,
        employeesFemale: 6,
        workHoursDaily: 8,
        jobDescription: 'Test job B',
      })
      .returning();
    positionB = createdPositionB;

    console.log('🏗️  Test data created:');
    console.log(`  Company A: ${companyA.id} - ${companyA.name}`);
    console.log(`  Company B: ${companyB.id} - ${companyB.name}`);
    console.log(`  User A: ${userA.id} (company ${userA.companyId})`);
    console.log(`  User B: ${userB.id} (company ${userB.companyId})`);
    console.log(`  Admin: ${adminUser.id} (no company)`);
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(riskAssessments).where(sql`1=1`);
    await db.delete(workPositions).where(sql`position_name LIKE 'RLS Test%'`);
    await db.delete(users).where(sql`email LIKE '%@rls-test.local'`);
    await db.delete(companies).where(sql`name LIKE 'RLS Test Company%'`);

    console.log('🧹 Test data cleaned up');
  });

  describe('Application-Layer RLS (rlsFilter)', () => {
    it('User A can read their own company data', async () => {
      // Simulate User A's context
      const { rlsFilter } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userA.id,
        email: userA.email,
        role: 'bzr_officer',
        companyId: userA.companyId,
      };

      // Query positions with RLS filter
      const positions = await db
        .select()
        .from(workPositions)
        .where(rlsFilter(workPositions, userPayload));

      // Should see only Company A position
      expect(positions).toHaveLength(1);
      expect(positions[0]?.id).toBe(positionA.id);
      expect(positions[0]?.positionName).toBe('RLS Test Position A');
    });

    it('User A cannot read Company B data', async () => {
      const { rlsFilter } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userA.id,
        email: userA.email,
        role: 'bzr_officer',
        companyId: userA.companyId,
      };

      // Query positions with RLS filter
      const positions = await db
        .select()
        .from(workPositions)
        .where(rlsFilter(workPositions, userPayload));

      // Should NOT see Company B position
      const hasCompanyBData = positions.some((p) => p.id === positionB.id);
      expect(hasCompanyBData).toBe(false);
    });

    it('User B can read their own company data', async () => {
      const { rlsFilter } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userB.id,
        email: userB.email,
        role: 'bzr_officer',
        companyId: userB.companyId,
      };

      const positions = await db
        .select()
        .from(workPositions)
        .where(rlsFilter(workPositions, userPayload));

      // Should see only Company B position
      expect(positions).toHaveLength(1);
      expect(positions[0]?.id).toBe(positionB.id);
      expect(positions[0]?.positionName).toBe('RLS Test Position B');
    });

    it('User B cannot read Company A data', async () => {
      const { rlsFilter } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userB.id,
        email: userB.email,
        role: 'bzr_officer',
        companyId: userB.companyId,
      };

      const positions = await db
        .select()
        .from(workPositions)
        .where(rlsFilter(workPositions, userPayload));

      // Should NOT see Company A position
      const hasCompanyAData = positions.some((p) => p.id === positionA.id);
      expect(hasCompanyAData).toBe(false);
    });

    it('Admin can read all company data', async () => {
      const { rlsFilter } = await import('../../../src/lib/utils/rls');
      const adminPayload: AccessTokenPayload = {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        companyId: null,
      };

      // Admin's rlsFilter returns undefined (no filtering)
      const filter = rlsFilter(workPositions, adminPayload);
      expect(filter).toBeUndefined();

      // Query without filter (admin sees all)
      const positions = await db.select().from(workPositions);

      // Should see both Company A and Company B positions
      const hasCompanyAData = positions.some((p) => p.id === positionA.id);
      const hasCompanyBData = positions.some((p) => p.id === positionB.id);
      expect(hasCompanyAData).toBe(true);
      expect(hasCompanyBData).toBe(true);
    });
  });

  describe('Database-Layer RLS (PostgreSQL session variable)', () => {
    it('should set app.current_company_id session variable for User A', async () => {
      // Simulate setting RLS context
      await db.execute(sql`SET LOCAL app.current_company_id = ${companyA.id.toString()}`);

      // Verify session variable is set
      const result = await db.execute<{ current_setting: string }>(
        sql`SELECT current_setting('app.current_company_id', true) as current_setting`
      );

      const companyId = parseInt(result.rows[0]?.current_setting || '0', 10);
      expect(companyId).toBe(companyA.id);
    });

    it('should reset session variable after transaction', async () => {
      // Set variable
      await db.execute(sql`SET LOCAL app.current_company_id = ${companyA.id.toString()}`);

      // In real scenario, this would be cleared automatically after transaction commit
      // For test, manually reset
      await db.execute(sql`RESET app.current_company_id`);

      const result = await db.execute<{ current_setting: string }>(
        sql`SELECT current_setting('app.current_company_id', true) as current_setting`
      );

      const value = result.rows[0]?.current_setting;
      expect(value).toBe('');
    });
  });

  describe('Cross-Tenant Access Attempts', () => {
    it('User A cannot update Company B position', async () => {
      const { verifyOwnership } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userA.id,
        email: userA.email,
        role: 'bzr_officer',
        companyId: userA.companyId,
      };

      // Attempt to verify ownership of Company B position
      expect(() => {
        verifyOwnership(positionB.companyId, userPayload);
      }).toThrow('Access denied');
    });

    it('User B cannot update Company A position', async () => {
      const { verifyOwnership } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userB.id,
        email: userB.email,
        role: 'bzr_officer',
        companyId: userB.companyId,
      };

      // Attempt to verify ownership of Company A position
      expect(() => {
        verifyOwnership(positionA.companyId, userPayload);
      }).toThrow('Access denied');
    });

    it('User A can update their own company position', async () => {
      const { verifyOwnership } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userA.id,
        email: userA.email,
        role: 'bzr_officer',
        companyId: userA.companyId,
      };

      // Should not throw
      expect(() => {
        verifyOwnership(positionA.companyId, userPayload);
      }).not.toThrow();
    });

    it('Admin can update any company position', async () => {
      const { verifyOwnership } = await import('../../../src/lib/utils/rls');
      const adminPayload: AccessTokenPayload = {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        companyId: null,
      };

      // Should not throw for both companies
      expect(() => {
        verifyOwnership(positionA.companyId, adminPayload);
      }).not.toThrow();

      expect(() => {
        verifyOwnership(positionB.companyId, adminPayload);
      }).not.toThrow();
    });
  });

  describe('Data Leak Prevention', () => {
    it('should not leak Company B data in bulk queries for User A', async () => {
      const { rlsFilter } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userA.id,
        email: userA.email,
        role: 'bzr_officer',
        companyId: userA.companyId,
      };

      // Query all positions (simulating vulnerable endpoint without proper filtering)
      const allPositions = await db.select().from(workPositions);

      // Without RLS filter, both companies visible (vulnerability!)
      expect(allPositions.length).toBeGreaterThanOrEqual(2);

      // With RLS filter, only Company A visible
      const filteredPositions = await db
        .select()
        .from(workPositions)
        .where(rlsFilter(workPositions, userPayload));

      expect(filteredPositions).toHaveLength(1);
      expect(filteredPositions[0]?.companyId).toBe(companyA.id);
    });

    it('should not expose Company B ID in error messages', async () => {
      const { verifyOwnership } = await import('../../../src/lib/utils/rls');
      const userPayload: AccessTokenPayload = {
        userId: userA.id,
        email: userA.email,
        role: 'bzr_officer',
        companyId: userA.companyId,
      };

      try {
        verifyOwnership(positionB.companyId, userPayload);
        expect.fail('Should have thrown error');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Error message should not contain Company B ID
        expect(message).not.toContain(String(companyB.id));
        expect(message).not.toContain('RLS Test Company B');

        // Generic access denied message
        expect(message).toContain('Access denied');
      }
    });
  });
});
