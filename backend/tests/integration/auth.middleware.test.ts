/**
 * Integration Tests: Authentication Middleware (T018)
 *
 * Tests JWT authentication middleware with Hono app context.
 * Security requirements: FR-028, FR-030, FR-053c
 *
 * Test Coverage:
 * - Valid JWT authentication flow
 * - Missing token rejection (401)
 * - Invalid token rejection (401)
 * - Expired token rejection (401)
 * - User data attachment to context
 * - Optional authentication behavior
 * - Helper functions (getAuthUser, requireAuthUser)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import {
  authMiddleware,
  optionalAuthMiddleware,
  getAuthUser,
  requireAuthUser
} from '../../src/api/middleware/auth';
import { generateAccessToken } from '../../src/lib/utils/jwt';
import jwt from 'jsonwebtoken';

// Mock database module
vi.mock('../../src/db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({}),
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;

describe('Authentication Middleware Integration', () => {
  let app: Hono;

  beforeEach(() => {
    // Create fresh Hono app for each test
    app = new Hono();
    vi.clearAllMocks();
  });

  describe('authMiddleware - Valid Authentication', () => {
    it('should allow access with valid JWT token', async () => {
      const payload = {
        userId: 123,
        email: 'test@example.com',
        role: 'bzr_officer' as const,
        companyId: 456,
      };

      const token = generateAccessToken(payload);

      // Setup protected route
      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Access granted', user: c.get('user') });
      });

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Access granted');
      expect(data.user.userId).toBe(123);
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.role).toBe('bzr_officer');
      expect(data.user.companyId).toBe(456);
    });

    it('should attach complete user payload to context', async () => {
      const payload = {
        userId: 999,
        email: 'context@test.com',
        role: 'admin' as const,
        companyId: 111,
      };

      const token = generateAccessToken(payload);

      app.get('/check-context', authMiddleware, (c) => {
        const user = c.get('user');
        expect(user).toBeDefined();
        expect(user.userId).toBe(999);
        expect(user.email).toBe('context@test.com');
        expect(user.role).toBe('admin');
        expect(user.companyId).toBe(111);
        expect(user.iat).toBeDefined(); // Issued at
        expect(user.exp).toBeDefined(); // Expires at
        return c.json({ success: true });
      });

      const response = await app.request('/check-context', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
    });

    it('should work with null companyId for admin users', async () => {
      const payload = {
        userId: 1,
        email: 'admin@example.com',
        role: 'admin' as const,
        companyId: null,
      };

      const token = generateAccessToken(payload);

      app.get('/admin-route', authMiddleware, (c) => {
        const user = c.get('user');
        expect(user.companyId).toBeNull();
        return c.json({ success: true });
      });

      const response = await app.request('/admin-route', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('authMiddleware - Authentication Failures', () => {
    it('should return 401 for missing Authorization header', async () => {
      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected');

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toContain('Missing or invalid Authorization header');
    });

    it('should return 401 for malformed Authorization header', async () => {
      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected', {
        headers: {
          Authorization: 'InvalidFormat token123',
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 for invalid JWT token', async () => {
      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected', {
        headers: {
          Authorization: 'Bearer invalid.jwt.token',
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toContain('Invalid');
    });

    it('should return 401 for expired JWT token', async () => {
      const payload = {
        userId: 1,
        email: 'expired@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      // Generate token that expires immediately
      const expiredToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '-1s',
        issuer: 'bzr-portal',
        audience: 'bzr-portal-api',
      });

      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toContain('expired');
    });

    it('should return 401 for tampered JWT token', async () => {
      const payload = {
        userId: 1,
        email: 'tampered@test.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };

      const validToken = generateAccessToken(payload);
      const tamperedToken = validToken.slice(0, -10) + 'XXXXXXXXXXXX';

      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${tamperedToken}`,
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 for token with wrong issuer', async () => {
      const payload = {
        userId: 1,
        email: 'wrong@test.com',
        role: 'admin' as const,
        companyId: 1,
      };

      const wrongIssuerToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'wrong-issuer',
        audience: 'bzr-portal-api',
      });

      app.get('/protected', authMiddleware, (c) => {
        return c.json({ message: 'Should not reach here' });
      });

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${wrongIssuerToken}`,
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should attach user data if valid token provided', async () => {
      const payload = {
        userId: 555,
        email: 'optional@test.com',
        role: 'hr_manager' as const,
        companyId: 777,
      };

      const token = generateAccessToken(payload);

      app.get('/optional', optionalAuthMiddleware, (c) => {
        const user = c.get('user');
        return c.json({
          authenticated: !!user,
          userId: user?.userId
        });
      });

      const response = await app.request('/optional', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.authenticated).toBe(true);
      expect(data.userId).toBe(555);
    });

    it('should allow access without token (anonymous)', async () => {
      app.get('/optional', optionalAuthMiddleware, (c) => {
        const user = c.get('user');
        return c.json({
          authenticated: !!user,
          message: 'Anonymous access allowed'
        });
      });

      const response = await app.request('/optional');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.authenticated).toBe(false);
      expect(data.message).toBe('Anonymous access allowed');
    });

    it('should ignore invalid token and treat as anonymous', async () => {
      app.get('/optional', optionalAuthMiddleware, (c) => {
        const user = c.get('user');
        return c.json({
          authenticated: !!user
        });
      });

      const response = await app.request('/optional', {
        headers: {
          Authorization: 'Bearer invalid.token.here',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.authenticated).toBe(false);
    });

    it('should ignore expired token and treat as anonymous', async () => {
      const payload = {
        userId: 1,
        email: 'expired@test.com',
        role: 'viewer' as const,
        companyId: 1,
      };

      const expiredToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '-1s',
        issuer: 'bzr-portal',
        audience: 'bzr-portal-api',
      });

      app.get('/optional', optionalAuthMiddleware, (c) => {
        const user = c.get('user');
        return c.json({ authenticated: !!user });
      });

      const response = await app.request('/optional', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.authenticated).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    describe('getAuthUser', () => {
      it('should return user from context when authenticated', async () => {
        const payload = {
          userId: 888,
          email: 'helper@test.com',
          role: 'bzr_officer' as const,
          companyId: 999,
        };

        const token = generateAccessToken(payload);

        app.get('/test-helper', authMiddleware, (c) => {
          const user = getAuthUser(c);
          expect(user).toBeDefined();
          expect(user!.userId).toBe(888);
          expect(user!.email).toBe('helper@test.com');
          return c.json({ success: true });
        });

        const response = await app.request('/test-helper', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
      });

      it('should return undefined when not authenticated', async () => {
        app.get('/test-helper', (c) => {
          const user = getAuthUser(c);
          expect(user).toBeUndefined();
          return c.json({ authenticated: false });
        });

        const response = await app.request('/test-helper');

        expect(response.status).toBe(200);
      });
    });

    describe('requireAuthUser', () => {
      it('should return user when authenticated', async () => {
        const payload = {
          userId: 777,
          email: 'require@test.com',
          role: 'admin' as const,
          companyId: 888,
        };

        const token = generateAccessToken(payload);

        app.get('/require', authMiddleware, (c) => {
          const user = requireAuthUser(c);
          expect(user.userId).toBe(777);
          expect(user.email).toBe('require@test.com');
          return c.json({ success: true });
        });

        const response = await app.request('/require', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
      });

      it('should throw error when not authenticated', async () => {
        app.get('/require', (c) => {
          expect(() => requireAuthUser(c)).toThrow(
            'User not authenticated. This should not happen if authMiddleware is used.'
          );
          return c.json({ success: true });
        });

        const response = await app.request('/require');

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Multiple Middleware Chain', () => {
    it('should work with multiple middleware in sequence', async () => {
      const payload = {
        userId: 100,
        email: 'chain@test.com',
        role: 'bzr_officer' as const,
        companyId: 200,
      };

      const token = generateAccessToken(payload);

      // Mock additional middleware
      const loggerMiddleware = async (c: any, next: Function) => {
        c.set('logged', true);
        await next();
      };

      app.get('/chain', authMiddleware, loggerMiddleware, (c) => {
        const user = c.get('user');
        const logged = c.get('logged');
        return c.json({
          userId: user.userId,
          logged
        });
      });

      const response = await app.request('/chain', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.userId).toBe(100);
      expect(data.logged).toBe(true);
    });
  });

  describe('Role-Based Access Patterns', () => {
    it('should allow different roles to access protected routes', async () => {
      const roles = ['admin', 'bzr_officer', 'hr_manager', 'viewer'] as const;

      for (const role of roles) {
        const payload = {
          userId: 1,
          email: `${role}@test.com`,
          role,
          companyId: 1,
        };

        const token = generateAccessToken(payload);

        app.get('/role-test', authMiddleware, (c) => {
          const user = c.get('user');
          return c.json({ role: user.role });
        });

        const response = await app.request('/role-test', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.role).toBe(role);

        // Reset app for next iteration
        app = new Hono();
      }
    });
  });
});
