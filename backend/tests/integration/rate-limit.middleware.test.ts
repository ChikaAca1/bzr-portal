/**
 * Integration Tests: Rate Limit Middleware (T025)
 *
 * Tests API rate limiting middleware with Hono app context.
 * Security requirements: FR-053d
 *
 * Test Coverage:
 * - Anonymous user rate limiting (20 req/min)
 * - Authenticated user rate limiting (100 req/min)
 * - Strict rate limiting for expensive operations (5 req/min)
 * - Rate limit headers (X-RateLimit-*)
 * - 429 Too Many Requests response
 * - Retry-After header
 * - Serbian Cyrillic error messages
 * - Rate limit window expiration and reset
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Hono } from 'hono';
import { rateLimitMiddleware, strictRateLimitMiddleware } from '../../src/api/middleware/rate-limit';
import { authMiddleware } from '../../src/api/middleware/auth';
import { generateAccessToken } from '../../src/lib/utils/jwt';

// Mock database and logger
vi.mock('../../src/db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../src/lib/logger', () => ({
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

// Override rate limit config for faster testing
process.env.RATE_LIMIT_WINDOW_MS = '1000'; // 1 second for testing

describe('Rate Limit Middleware Integration', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Anonymous User Rate Limiting', () => {
    it('should allow requests within anonymous limit (20 req/min)', async () => {
      app.get('/public', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Make 10 requests (well within 20 limit)
      for (let i = 0; i < 10; i++) {
        const response = await app.request('/public', {
          headers: {
            'x-forwarded-for': '192.168.1.100',
          },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
        expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
        expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
      }
    });

    it('should block anonymous requests exceeding limit', async () => {
      app.get('/public', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Make 21 requests (exceeds 20 limit)
      let blocked = false;
      for (let i = 0; i < 21; i++) {
        const response = await app.request('/public', {
          headers: {
            'x-forwarded-for': '192.168.1.101',
          },
        });

        if (response.status === 429) {
          blocked = true;
          const data = await response.json();
          expect(data.error).toBe('Too Many Requests');
          expect(data.message).toContain('Превише захтева'); // Serbian Cyrillic
          expect(data.retryAfter).toBeDefined();
          expect(data.retryAfter).toBeGreaterThan(0);
          expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
          break;
        }
      }

      expect(blocked).toBe(true);
    });

    it('should differentiate between different IP addresses', async () => {
      app.get('/public', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // IP 1: Make 20 requests
      for (let i = 0; i < 20; i++) {
        const response = await app.request('/public', {
          headers: { 'x-forwarded-for': '10.0.0.1' },
        });
        expect(response.status).toBe(200);
      }

      // IP 2: Should still be allowed (different quota)
      const response = await app.request('/public', {
        headers: { 'x-forwarded-for': '10.0.0.2' },
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('19'); // Fresh quota
    });
  });

  describe('Authenticated User Rate Limiting', () => {
    it('should allow requests within authenticated limit (100 req/min)', async () => {
      const payload = {
        userId: 123,
        email: 'test@example.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.get('/protected', authMiddleware, rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Make 50 requests (well within 100 limit)
      for (let i = 0; i < 50; i++) {
        const response = await app.request('/protected', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      }
    });

    it('should block authenticated requests exceeding limit', async () => {
      const payload = {
        userId: 456,
        email: 'user@example.com',
        role: 'viewer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.get('/protected', authMiddleware, rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Make 101 requests (exceeds 100 limit)
      let blocked = false;
      for (let i = 0; i < 101; i++) {
        const response = await app.request('/protected', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 429) {
          blocked = true;
          const data = await response.json();
          expect(data.error).toBe('Too Many Requests');
          expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
          expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
          break;
        }
      }

      expect(blocked).toBe(true);
    });

    it('should use user ID for rate limiting, not IP', async () => {
      const payload = {
        userId: 789,
        email: 'user@example.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.get('/protected', authMiddleware, rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Same user, different IPs - should share quota
      const response1 = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-forwarded-for': '10.0.0.1',
        },
      });
      expect(response1.status).toBe(200);
      const remaining1 = parseInt(response1.headers.get('X-RateLimit-Remaining') || '0');

      const response2 = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-forwarded-for': '10.0.0.2', // Different IP
        },
      });
      expect(response2.status).toBe(200);
      const remaining2 = parseInt(response2.headers.get('X-RateLimit-Remaining') || '0');

      // Remaining should decrease (same quota)
      expect(remaining2).toBe(remaining1 - 1);
    });
  });

  describe('Strict Rate Limiting (Document Generation)', () => {
    it('should enforce strict limit of 5 requests per minute', async () => {
      const payload = {
        userId: 999,
        email: 'bzr@example.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.post('/documents/generate', authMiddleware, strictRateLimitMiddleware, (c) => {
        return c.json({ documentId: 123 });
      });

      // Make 6 requests (exceeds 5 limit)
      let blocked = false;
      for (let i = 0; i < 6; i++) {
        const response = await app.request('/documents/generate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 429) {
          blocked = true;
          const data = await response.json();
          expect(data.error).toBe('Too Many Requests');
          expect(data.message).toContain('генерисање докумената'); // Serbian
          expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
          expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
          break;
        }
      }

      expect(blocked).toBe(true);
    });

    it('should not affect normal rate limit quota', async () => {
      const payload = {
        userId: 888,
        email: 'test@example.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.post('/documents/generate', authMiddleware, strictRateLimitMiddleware, (c) => {
        return c.json({ documentId: 1 });
      });

      app.get('/other', authMiddleware, rateLimitMiddleware, (c) => {
        return c.json({ message: 'Other endpoint' });
      });

      // Exhaust strict limit
      for (let i = 0; i < 5; i++) {
        const response = await app.request('/documents/generate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(response.status).toBe(200);
      }

      // Normal endpoints should still work
      const response = await app.request('/other', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include all required rate limit headers', async () => {
      app.get('/test', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Test' });
      });

      const response = await app.request('/test', {
        headers: { 'x-forwarded-for': '192.168.1.200' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();

      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '0');
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
      const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThan(limit);
      expect(reset).toBeGreaterThan(Date.now() / 1000); // Unix timestamp in future
    });

    it('should update remaining count on each request', async () => {
      const payload = {
        userId: 555,
        email: 'counter@example.com',
        role: 'viewer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.get('/count', authMiddleware, rateLimitMiddleware, (c) => {
        return c.json({ message: 'Count' });
      });

      const response1 = await app.request('/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const remaining1 = parseInt(response1.headers.get('X-RateLimit-Remaining') || '0');

      const response2 = await app.request('/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const remaining2 = parseInt(response2.headers.get('X-RateLimit-Remaining') || '0');

      const response3 = await app.request('/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const remaining3 = parseInt(response3.headers.get('X-RateLimit-Remaining') || '0');

      expect(remaining2).toBe(remaining1 - 1);
      expect(remaining3).toBe(remaining2 - 1);
    });
  });

  describe('Error Responses', () => {
    it('should return 429 with Serbian error message', async () => {
      app.get('/public', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Exhaust limit
      for (let i = 0; i < 21; i++) {
        await app.request('/public', {
          headers: { 'x-forwarded-for': '192.168.1.250' },
        });
      }

      const response = await app.request('/public', {
        headers: { 'x-forwarded-for': '192.168.1.250' },
      });

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBe('Too Many Requests');
      expect(data.message).toMatch(/Превише захтева/); // Serbian Cyrillic
      expect(data.retryAfter).toBeDefined();
      expect(typeof data.retryAfter).toBe('number');
      expect(data.retryAfter).toBeGreaterThan(0);
    });

    it('should include Retry-After in response', async () => {
      const payload = {
        userId: 111,
        email: 'retry@example.com',
        role: 'bzr_officer' as const,
        companyId: 1,
      };
      const token = generateAccessToken(payload);

      app.post('/generate', authMiddleware, strictRateLimitMiddleware, (c) => {
        return c.json({ success: true });
      });

      // Exhaust strict limit (5 requests)
      for (let i = 0; i < 6; i++) {
        const response = await app.request('/generate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 429) {
          const data = await response.json();
          expect(data.retryAfter).toBeDefined();
          expect(data.retryAfter).toBeGreaterThan(0);
          expect(data.retryAfter).toBeLessThanOrEqual(60); // Should be within 1 minute
          break;
        }
      }
    });
  });

  describe('Rate Limit Window Reset', () => {
    it('should provide reset timestamp in headers', async () => {
      app.get('/reset-test', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      const response = await app.request('/reset-test', {
        headers: { 'x-forwarded-for': '10.10.10.10' },
      });

      expect(response.status).toBe(200);
      const resetAt = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
      const now = Math.floor(Date.now() / 1000);

      // Reset time should be in the future (within the window)
      expect(resetAt).toBeGreaterThan(now);
      expect(resetAt).toBeLessThanOrEqual(now + 60); // Within 1 minute
    });

    it('should track window expiration in retryAfter', async () => {
      app.get('/retry-test', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Exhaust anonymous limit
      for (let i = 0; i < 21; i++) {
        await app.request('/retry-test', {
          headers: { 'x-forwarded-for': '10.10.10.11' },
        });
      }

      // Next request should be blocked with retryAfter
      const response = await app.request('/retry-test', {
        headers: { 'x-forwarded-for': '10.10.10.11' },
      });

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.retryAfter).toBeDefined();
      expect(data.retryAfter).toBeGreaterThan(0);
      expect(data.retryAfter).toBeLessThanOrEqual(60); // Should reset within 1 minute
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing IP headers gracefully', async () => {
      app.get('/no-ip', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      const response = await app.request('/no-ip');

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('20'); // Anonymous limit
    });

    it('should handle x-real-ip header', async () => {
      app.get('/real-ip', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      const response = await app.request('/real-ip', {
        headers: { 'x-real-ip': '172.16.0.1' },
      });

      expect(response.status).toBe(200);
    });

    it('should prefer x-forwarded-for over x-real-ip', async () => {
      app.get('/both-headers', rateLimitMiddleware, (c) => {
        return c.json({ message: 'Success' });
      });

      // Make request with both headers
      const response1 = await app.request('/both-headers', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      });
      expect(response1.status).toBe(200);
      const remaining1 = parseInt(response1.headers.get('X-RateLimit-Remaining') || '0');

      // Make another request with same x-forwarded-for
      const response2 = await app.request('/both-headers', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.3', // Different x-real-ip
        },
      });
      expect(response2.status).toBe(200);
      const remaining2 = parseInt(response2.headers.get('X-RateLimit-Remaining') || '0');

      // Should share quota (based on x-forwarded-for)
      expect(remaining2).toBe(remaining1 - 1);
    });
  });
});
