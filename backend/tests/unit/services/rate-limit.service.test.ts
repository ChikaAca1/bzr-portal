/**
 * Unit Tests: Rate Limiting Service (T023)
 *
 * Tests daily quota tracking for resource-intensive operations.
 * Security requirements: FR-053d
 *
 * Test Coverage:
 * - checkQuota() with various scenarios
 * - incrementQuota() for new and existing entries
 * - resetQuota() for specific and all event types
 * - getUserQuotas() for all event types
 * - cleanupExpiredQuotas() for expired entries
 * - Serbian Cyrillic error messages
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { RateLimitEventType } from '../../../src/db/schema/rate-limits';

// Mock database module with factory function
vi.mock('../../../src/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import mocked db and service after mock setup
import { db as mockDb } from '../../../src/db';
import { rateLimitService } from '../../../src/services/rate-limit.service';

// Mock rate limit quotas
vi.mock('../../../src/db/schema/rate-limits', async () => {
  const actual = await vi.importActual<typeof import('../../../src/db/schema/rate-limits')>('../../../src/db/schema/rate-limits');
  return {
    ...actual,
    RATE_LIMIT_QUOTAS: {
      document_generation: 5,
      excel_import: 10,
      ai_suggestion: 20,
    },
  };
});

describe('Rate Limiting Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkQuota()', () => {
    it('should allow access when no existing rate limit entry', async () => {
      // Mock database response - no existing entry
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // No entry found
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4); // 5 - 1 (assuming this request will be consumed)
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should allow access when quota available', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Mock database response - existing entry with available quota
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 2, // 2 out of 5 used
                  resetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(2); // 5 - 2 - 1 (current request)
      expect(result.resetAt).toEqual(resetAt);
    });

    it('should deny access when quota exceeded', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now

      // Mock database response - existing entry with quota exceeded
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 5, // 5 out of 5 used (quota exceeded)
                  resetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(0);
      expect(result.resetAt).toEqual(resetAt);
      expect(result.message).toBeDefined();
      expect(result.message).toContain('Дневна квота искоришћена'); // Serbian Cyrillic
      expect(result.message).toContain('5/5');
    });

    it('should include reset time in Serbian message format', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000); // 3.5 hours from now

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 5,
                  resetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(false);
      expect(result.message).toMatch(/\d+h \d+m/); // Should include "3h 30m" or similar
    });

    it('should allow access when quota window expired', async () => {
      const now = new Date();
      const expiredResetAt = new Date(now.getTime() - 1000); // 1 second ago (expired)

      // Mock database response - existing entry but expired
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 5, // Was at quota limit
                  resetAt: expiredResetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(true); // Should allow because window expired
      expect(result.remaining).toBe(4); // Fresh quota window
    });

    it('should work with different event types', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const excelResult = await rateLimitService.checkQuota(123, 'excel_import');
      expect(excelResult.limit).toBe(10);
      expect(excelResult.remaining).toBe(9);

      const aiResult = await rateLimitService.checkQuota(123, 'ai_suggestion');
      expect(aiResult.limit).toBe(20);
      expect(aiResult.remaining).toBe(19);
    });
  });

  describe('incrementQuota()', () => {
    it('should create new entry when none exists', async () => {
      const now = new Date();

      // Mock SELECT (no existing entry)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock INSERT
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 1,
              userId: 123,
              eventType: 'document_generation',
              eventCount: 1,
              resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
              createdAt: now,
              updatedAt: now,
            },
          ]),
        }),
      });

      const count = await rateLimitService.incrementQuota(123, 'document_generation');

      expect(count).toBe(1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should increment existing entry', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Mock SELECT (existing entry)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 3,
                  resetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      // Mock UPDATE
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                id: 1,
                userId: 123,
                eventType: 'document_generation',
                eventCount: 4, // Incremented
                resetAt,
                createdAt: now,
                updatedAt: now,
              },
            ]),
          }),
        }),
      });

      const count = await rateLimitService.incrementQuota(123, 'document_generation');

      expect(count).toBe(4);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should create new entry when existing entry expired', async () => {
      const now = new Date();
      const expiredResetAt = new Date(now.getTime() - 1000);

      // Mock SELECT (expired entry)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 5,
                  resetAt: expiredResetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      // Mock INSERT (new entry for fresh quota window)
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 2,
              userId: 123,
              eventType: 'document_generation',
              eventCount: 1,
              resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
              createdAt: now,
              updatedAt: now,
            },
          ]),
        }),
      });

      const count = await rateLimitService.incrementQuota(123, 'document_generation');

      expect(count).toBe(1); // Fresh count
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('resetQuota()', () => {
    it('should reset specific event type for user', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: 1 },
          ]),
        }),
      });

      const deleted = await rateLimitService.resetQuota(123, 'document_generation');

      expect(deleted).toBe(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should reset all event types for user when eventType not specified', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ]),
        }),
      });

      const deleted = await rateLimitService.resetQuota(123);

      expect(deleted).toBe(3);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return 0 when no entries to delete', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const deleted = await rateLimitService.resetQuota(999, 'document_generation');

      expect(deleted).toBe(0);
    });
  });

  describe('getUserQuotas()', () => {
    it('should return quota status for all event types', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Mock SELECT for document_generation
      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(
                callCount++ === 0
                  ? [
                      {
                        id: 1,
                        userId: 123,
                        eventType: 'document_generation',
                        eventCount: 2,
                        resetAt,
                        createdAt: now,
                        updatedAt: now,
                      },
                    ]
                  : [] // Other event types have no entries
              ),
            }),
          }),
        }),
      }));

      const quotas = await rateLimitService.getUserQuotas(123);

      expect(quotas).toHaveLength(3);
      expect(quotas[0].limit).toBe(5); // document_generation
      expect(quotas[1].limit).toBe(10); // excel_import
      expect(quotas[2].limit).toBe(20); // ai_suggestion
    });
  });

  describe('cleanupExpiredQuotas()', () => {
    it('should delete expired quota entries', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ]),
        }),
      });

      const deleted = await rateLimitService.cleanupExpiredQuotas();

      expect(deleted).toBe(3);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return 0 when no expired entries', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const deleted = await rateLimitService.cleanupExpiredQuotas();

      expect(deleted).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests safely', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 4, // At quota limit minus 1
                  resetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0); // Last available slot
    });

    it('should handle exactly at quota limit', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: 123,
                  eventType: 'document_generation',
                  eventCount: 5, // Exactly at limit
                  resetAt,
                  createdAt: now,
                  updatedAt: now,
                },
              ]),
            }),
          }),
        }),
      });

      const result = await rateLimitService.checkQuota(123, 'document_generation');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });
});
