/**
 * Unit Tests: RBAC Middleware (T020)
 *
 * Tests role-based access control middleware.
 * Security requirements: FR-029, FR-053b
 *
 * Test Coverage:
 * - requireRole() with single and multiple roles
 * - requireAdmin() shorthand
 * - requireBZROfficer() shorthand
 * - 403 Forbidden for insufficient permissions
 * - Admin role hierarchy (admin has all permissions)
 * - hasRole() helper function
 * - isAdmin() helper function
 * - All 4 user roles tested
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import {
  requireRole,
  requireAdmin,
  requireBZROfficer,
  hasRole,
  isAdmin,
  type UserRole,
} from '../../../src/api/middleware/rbac';
import { authMiddleware } from '../../../src/api/middleware/auth';
import { generateAccessToken } from '../../../src/lib/utils/jwt';

// Mock database module
import { vi } from 'vitest';
vi.mock('../../../src/db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({}),
  },
}));

describe('RBAC Middleware Unit Tests', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  describe('requireRole() - Single Role', () => {
    it('should allow access for matching role', async () => {
      const payload = {
        userId: 1,
        email: 'bzr@test.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.get('/action', authMiddleware, requireRole('bzr_officer'), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/action', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should deny access for non-matching role', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.post('/protected', authMiddleware, requireRole('bzr_officer'), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
      expect(data.message).toContain('bzr_officer');
      expect(data.message).toContain('Your role: viewer');
    });

    it('should work with viewer role', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.get('/read-only', authMiddleware, requireRole('viewer'), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/read-only', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
    });

    it('should work with hr_manager role', async () => {
      const payload = {
        userId: 1,
        email: 'hr@test.com',
        role: 'hr_manager' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.post('/employees', authMiddleware, requireRole('hr_manager'), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/employees', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('requireRole() - Multiple Roles', () => {
    it('should allow access if user has any of the allowed roles', async () => {
      const payload = {
        userId: 1,
        email: 'hr@test.com',
        role: 'hr_manager' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.put('/positions', authMiddleware, requireRole('bzr_officer', 'hr_manager', 'admin'), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/positions', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
    });

    it('should deny access if user has none of the allowed roles', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.delete('/positions', authMiddleware, requireRole('bzr_officer', 'hr_manager', 'admin'), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/positions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
      expect(data.message).toContain('bzr_officer, hr_manager, admin');
    });

    it('should list all required roles in error message', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.post('/admin-action', authMiddleware, requireRole('admin', 'bzr_officer'), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/admin-action', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.message).toContain('admin, bzr_officer');
      expect(data.message).toContain('viewer');
    });
  });

  describe('requireAdmin() - Admin-Only Routes', () => {
    it('should allow access for admin users', async () => {
      const payload = {
        userId: 1,
        email: 'admin@test.com',
        role: 'admin' as const,
        companyId: null, // Admins may not have companyId
      };

      const token = generateAccessToken(payload);

      app.delete('/users/:id', authMiddleware, requireAdmin(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/users/123', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should deny access for bzr_officer', async () => {
      const payload = {
        userId: 1,
        email: 'bzr@test.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.post('/admin-settings', authMiddleware, requireAdmin(), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/admin-settings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
      expect(data.message).toContain('admin');
    });

    it('should deny access for hr_manager', async () => {
      const payload = {
        userId: 1,
        email: 'hr@test.com',
        role: 'hr_manager' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.get('/system-logs', authMiddleware, requireAdmin(), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/system-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });

    it('should deny access for viewer', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.delete('/companies/:id', authMiddleware, requireAdmin(), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/companies/1', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('requireBZROfficer() - BZR Officer Routes', () => {
    it('should allow access for bzr_officer', async () => {
      const payload = {
        userId: 1,
        email: 'bzr@test.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.post('/documents/generate', authMiddleware, requireBZROfficer(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/documents/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
    });

    it('should allow access for admin (admin hierarchy)', async () => {
      const payload = {
        userId: 1,
        email: 'admin@test.com',
        role: 'admin' as const,
        companyId: null,
      };

      const token = generateAccessToken(payload);

      app.post('/risks', authMiddleware, requireBZROfficer(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/risks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should deny access for hr_manager', async () => {
      const payload = {
        userId: 1,
        email: 'hr@test.com',
        role: 'hr_manager' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.put('/risks/:id', authMiddleware, requireBZROfficer(), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/risks/123', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });

    it('should deny access for viewer', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.delete('/risks/:id', authMiddleware, requireBZROfficer(), (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/risks/123', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('hasRole() Helper Function', () => {
    it('should return true for matching role', async () => {
      const payload = {
        userId: 1,
        email: 'bzr@test.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.get('/check-role', authMiddleware, (c) => {
        const result = hasRole(c, 'bzr_officer');
        expect(result).toBe(true);
        return c.json({ hasRole: result });
      });

      const response = await app.request('/check-role', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.hasRole).toBe(true);
    });

    it('should return false for non-matching role', async () => {
      const payload = {
        userId: 1,
        email: 'viewer@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const token = generateAccessToken(payload);

      app.get('/check-role', authMiddleware, (c) => {
        const result = hasRole(c, 'bzr_officer');
        expect(result).toBe(false);
        return c.json({ hasRole: result });
      });

      const response = await app.request('/check-role', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.hasRole).toBe(false);
    });

    it('should return true for admin checking any role', async () => {
      const payload = {
        userId: 1,
        email: 'admin@test.com',
        role: 'admin' as const,
        companyId: null,
      };

      const token = generateAccessToken(payload);

      const roles: UserRole[] = ['viewer', 'hr_manager', 'bzr_officer', 'admin'];

      for (const roleToCheck of roles) {
        app = new Hono(); // Reset app
        app.get('/check-admin-role', authMiddleware, (c) => {
          const result = hasRole(c, roleToCheck);
          expect(result).toBe(true);
          return c.json({ hasRole: result, checkedRole: roleToCheck });
        });

        const response = await app.request('/check-admin-role', {
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.hasRole).toBe(true);
      }
    });

    it('should return false for unauthenticated user', async () => {
      app.get('/check-role-no-auth', (c) => {
        const result = hasRole(c, 'viewer');
        expect(result).toBe(false);
        return c.json({ hasRole: result });
      });

      const response = await app.request('/check-role-no-auth');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.hasRole).toBe(false);
    });
  });

  describe('isAdmin() Helper Function', () => {
    it('should return true for admin users', async () => {
      const payload = {
        userId: 1,
        email: 'admin@test.com',
        role: 'admin' as const,
        companyId: null,
      };

      const token = generateAccessToken(payload);

      app.get('/check-admin', authMiddleware, (c) => {
        const result = isAdmin(c);
        expect(result).toBe(true);
        return c.json({ isAdmin: result });
      });

      const response = await app.request('/check-admin', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.isAdmin).toBe(true);
    });

    it('should return false for non-admin users', async () => {
      const roles: Array<'bzr_officer' | 'hr_manager' | 'viewer'> = [
        'bzr_officer',
        'hr_manager',
        'viewer',
      ];

      for (const role of roles) {
        const payload = {
          userId: 1,
          email: `${role}@test.com`,
          role,
          companyId: 1,
        };

        const token = generateAccessToken(payload);

        app = new Hono(); // Reset app
        app.get('/check-admin', authMiddleware, (c) => {
          const result = isAdmin(c);
          expect(result).toBe(false);
          return c.json({ isAdmin: result, role });
        });

        const response = await app.request('/check-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.isAdmin).toBe(false);
      }
    });

    it('should return false for unauthenticated user', async () => {
      app.get('/check-admin-no-auth', (c) => {
        const result = isAdmin(c);
        expect(result).toBe(false);
        return c.json({ isAdmin: result });
      });

      const response = await app.request('/check-admin-no-auth');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.isAdmin).toBe(false);
    });
  });

  describe('Permission Matrix (FR-053b Compliance)', () => {
    it('should enforce correct permission hierarchy', async () => {
      const permissionTests = [
        { role: 'admin' as const, canAccessAdmin: true, canAccessBZR: true, canAccessHR: true, canAccessViewer: true },
        { role: 'bzr_officer' as const, canAccessAdmin: false, canAccessBZR: true, canAccessHR: false, canAccessViewer: true },
        { role: 'hr_manager' as const, canAccessAdmin: false, canAccessBZR: false, canAccessHR: true, canAccessViewer: true },
        { role: 'viewer' as const, canAccessAdmin: false, canAccessBZR: false, canAccessHR: false, canAccessViewer: true },
      ];

      for (const test of permissionTests) {
        const payload = {
          userId: 1,
          email: `${test.role}@test.com`,
          role: test.role,
          companyId: test.role === 'admin' ? null : 1,
        };

        const token = generateAccessToken(payload);

        // Test admin route
        app = new Hono();
        app.get('/admin', authMiddleware, requireAdmin(), (c) => c.json({ success: true }));
        let response = await app.request('/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.status).toBe(test.canAccessAdmin ? 200 : 403);

        // Test BZR officer route
        app = new Hono();
        app.get('/bzr', authMiddleware, requireBZROfficer(), (c) => c.json({ success: true }));
        response = await app.request('/bzr', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.status).toBe(test.canAccessBZR ? 200 : 403);

        // Test HR manager route
        app = new Hono();
        app.get('/hr', authMiddleware, requireRole('hr_manager', 'admin'), (c) => c.json({ success: true }));
        response = await app.request('/hr', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.status).toBe(test.canAccessHR ? 200 : 403);

        // Test viewer route
        app = new Hono();
        app.get('/view', authMiddleware, requireRole('viewer', 'hr_manager', 'bzr_officer', 'admin'), (c) => c.json({ success: true }));
        response = await app.request('/view', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.status).toBe(test.canAccessViewer ? 200 : 403);
      }
    });
  });
});
