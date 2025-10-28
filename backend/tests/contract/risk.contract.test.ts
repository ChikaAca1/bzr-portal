/**
 * Contract Tests: Risk API Service (T057)
 *
 * Tests RiskService with E×P×F calculation, R < Ri validation, and RLS.
 * Requirements: FR-004 (E×P×F), FR-005 (Ri/R), FR-006 (R < Ri), FR-007 (R > 70)
 *
 * Test Coverage:
 * - RiskService.create with E×P×F calculation
 * - Ri and R automatic calculation
 * - R < Ri validation enforcement (FR-006)
 * - R > 70 high-risk flagging (FR-007)
 * - RiskService.getById with position ownership RLS
 * - RiskService.listByPosition with RLS
 * - RiskService.update with recalculation
 * - RiskService.delete (soft delete)
 * - validateReduction helper method
 * - Serbian Cyrillic error messages
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock database module
vi.mock('../../src/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    query: {
      riskAssessments: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
  riskAssessments: {
    id: 'id',
    positionId: 'positionId',
    hazardId: 'hazardId',
    ei: 'ei',
    pi: 'pi',
    fi: 'fi',
    ri: 'ri',
    correctiveMeasures: 'correctiveMeasures',
    e: 'e',
    p: 'p',
    f: 'f',
    r: 'r',
    isHighRisk: 'isHighRisk',
    responsiblePerson: 'responsiblePerson',
    deadline: 'deadline',
    isDeleted: 'isDeleted',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
  },
  workPositions: {
    id: 'id',
    companyId: 'companyId',
    isDeleted: 'isDeleted',
  },
  companies: {
    id: 'id',
    userId: 'userId',
    isDeleted: 'isDeleted',
  },
}));

// Mock risk calculator
vi.mock('../../src/lib/utils/risk-calculator', () => ({
  calculateRisk: vi.fn((e: number, p: number, f: number) => e * p * f),
  validateRiskReduction: vi.fn((ri: number, r: number) => {
    const errors = [];
    const warnings = [];

    // FR-006: R MUST be < Ri
    if (r >= ri) {
      errors.push({
        field: 'r',
        message: `Резидуални ризик (R=${r}) мора бити мањи од иницијалног ризика (Ri=${ri}). Корективне мере нису ефикасне.`,
      });
    }

    // FR-007: If Ri > 70, warn if R > 70
    if (ri > 70 && r > 70) {
      warnings.push({
        field: 'r',
        message: `⚠️ УПОЗОРЕЊЕ: Иницијални ризик био је повећан (Ri=${ri} > 70). Препоручује се да резидуални ризик буде ≤ 70. Тренутно R=${r}.`,
      });
    }

    // Additional check: R > 70 requires immediate action
    if (r > 70) {
      warnings.push({
        field: 'r',
        message: `⚠️ ПОВЕЋАН РИЗИК: R=${r} > 70.`,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }),
}));

// Mock error handlers
vi.mock('../../src/api/middleware/error-handler', () => ({
  throwNotFoundError: vi.fn((entity: string) => {
    throw new Error(`Ентитет није пронађен: ${entity}`);
  }),
  throwForbiddenError: vi.fn(() => {
    throw new Error('Забрањен приступ');
  }),
  throwBusinessLogicError: vi.fn((message: string) => {
    throw new Error(message);
  }),
}));

// Mock logger
vi.mock('../../src/lib/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

// Import after mocks
import { RiskService } from '../../src/services/risk.service';
import { db } from '../../src/db';

describe('Risk API Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('RiskService.create', () => {
    it('should create risk assessment with automatic Ri and R calculation', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      const mockRisk = {
        id: 1,
        positionId: 1,
        hazardId: 1,
        // Initial risk (before mitigation)
        ei: 4, // Serious injury
        pi: 3, // Unlikely (1-10%)
        fi: 5, // Hourly
        ri: 60, // Ri = 4 × 3 × 5 = 60 (calculated automatically)
        correctiveMeasures: 'Обука запослених, заштитна опрема',
        // Residual risk (after mitigation)
        e: 4, // Same severity
        p: 2, // Very unlikely (0.1-1%)
        f: 5, // Same frequency
        r: 40, // R = 4 × 2 × 5 = 40 (calculated automatically)
        isHighRisk: false, // R = 40 ≤ 70
        responsiblePerson: 'Марко Марковић',
        deadline: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      // Mock position ownership verification
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      // Mock insert
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.create({
        positionId: 1,
        hazardId: 1,
        ei: 4,
        pi: 3,
        fi: 5,
        correctiveMeasures: 'Обука запослених, заштитна опрема',
        e: 4,
        p: 2,
        f: 5,
        responsiblePerson: 'Марко Марковић',
        deadline: null,
      });

      expect(result).toMatchObject({
        id: 1,
        positionId: 1,
        ri: 60,
        r: 40,
        isHighRisk: false,
      });
    });

    it('should flag high risk when R > 70 (FR-007)', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      const mockRisk = {
        id: 1,
        positionId: 1,
        hazardId: 1,
        ei: 6, // Death
        pi: 4, // Probable (10-50%)
        fi: 5, // Hourly
        ri: 120, // Ri = 6 × 4 × 5 = 120
        correctiveMeasures: 'Хитне мере, забрана рада',
        e: 6,
        p: 2,
        f: 5,
        r: 60, // R = 6 × 2 × 5 = 60
        isHighRisk: true, // Ri = 120 > 70 (even though R ≤ 70)
        responsiblePerson: 'Петар Петровић',
        deadline: new Date('2025-01-01'),
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.create({
        positionId: 1,
        hazardId: 1,
        ei: 6,
        pi: 4,
        fi: 5,
        correctiveMeasures: 'Хитне мере, забрана рада',
        e: 6,
        p: 2,
        f: 5,
        responsiblePerson: 'Петар Петровић',
        deadline: new Date('2025-01-01'),
      });

      expect(result.isHighRisk).toBe(true); // Ri > 70
      expect(result.ri).toBe(120);
      expect(result.r).toBe(60);
    });

    it('should reject when R >= Ri (FR-006 - ineffective measures)', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(
        service.create({
          positionId: 1,
          hazardId: 1,
          ei: 4,
          pi: 3,
          fi: 5,
          ri: 60, // This will be recalculated
          correctiveMeasures: 'Неефикасне мере',
          e: 4,
          p: 3, // Same as pi
          f: 5,
          r: 60, // R = Ri = 60 (NO REDUCTION!)
          responsiblePerson: 'Test',
          deadline: null,
        })
      ).rejects.toThrow(/Резидуални ризик.*мора бити мањи од иницијалног ризика/);
    });

    it('should reject when R > Ri (worsened risk)', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(
        service.create({
          positionId: 1,
          hazardId: 1,
          ei: 4,
          pi: 3,
          fi: 5,
          ri: 60,
          correctiveMeasures: 'Погоршане мере',
          e: 5, // Increased!
          p: 3,
          f: 5,
          r: 75, // R > Ri (risk increased!)
          responsiblePerson: 'Test',
          deadline: null,
        })
      ).rejects.toThrow(/Резидуални ризик.*мора бити мањи од иницијалног ризика/);
    });

    it('should reject for non-owned position (RLS)', async () => {
      // Position not found or different user
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-456');

      await expect(
        service.create({
          positionId: 1,
          hazardId: 1,
          ei: 4,
          pi: 3,
          fi: 5,
          correctiveMeasures: 'Test',
          e: 4,
          p: 2,
          f: 5,
          responsiblePerson: 'Test',
          deadline: null,
        })
      ).rejects.toThrow(/Радно место|Ентитет није пронађен/);
    });

    it('should reject if position belongs to different user (RLS)', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-456', // Different user
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(
        service.create({
          positionId: 1,
          hazardId: 1,
          ei: 4,
          pi: 3,
          fi: 5,
          correctiveMeasures: 'Test',
          e: 4,
          p: 2,
          f: 5,
          responsiblePerson: 'Test',
          deadline: null,
        })
      ).rejects.toThrow(/Забрањен приступ/);
    });
  });

  describe('RiskService.getById', () => {
    it('should return risk assessment for authorized user (RLS)', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        hazardId: 1,
        ei: 4,
        pi: 3,
        fi: 5,
        ri: 60,
        e: 4,
        p: 2,
        f: 5,
        r: 40,
        isHighRisk: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      // Mock risk select
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      // Mock position verification
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.getById(1);

      expect(result).toMatchObject({
        id: 1,
        positionId: 1,
        ri: 60,
        r: 40,
      });
    });

    it('should reject access to risk from non-owned position (RLS)', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        isDeleted: false,
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-456', // Different user
      };

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(service.getById(1)).rejects.toThrow(/Забрањен приступ/);
    });

    it('should not return soft-deleted risk assessments', async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(service.getById(1)).rejects.toThrow(/Процена ризика/);
    });

    it('should reject access to non-existent risk assessment', async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(service.getById(999)).rejects.toThrow(/Процена ризика/);
    });
  });

  describe('RiskService.listByPosition', () => {
    it('should list risk assessments for owned position ordered by high-risk first', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      const mockRisks = [
        {
          id: 1,
          positionId: 1,
          hazardId: 1,
          ri: 120,
          r: 80,
          isHighRisk: true, // High-risk should be first
          isDeleted: false,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          positionId: 1,
          hazardId: 2,
          ri: 60,
          r: 40,
          isHighRisk: false,
          isDeleted: false,
          createdAt: new Date('2024-01-02'),
        },
      ];

      // Mock position verification
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      // Mock risks select
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockRisks),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.listByPosition(1);

      expect(result).toHaveLength(2);
      expect(result[0].isHighRisk).toBe(true); // High-risk first
      expect(result[1].isHighRisk).toBe(false);
    });

    it('should reject listing for non-owned position (RLS)', async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-456');

      await expect(service.listByPosition(1)).rejects.toThrow(/Радно место/);
    });

    it('should not include soft-deleted risk assessments', async () => {
      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      const activeRisks = [
        {
          id: 1,
          positionId: 1,
          isHighRisk: false,
          isDeleted: false,
        },
      ];

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(activeRisks),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.listByPosition(1);

      expect(result.every((r) => r.isDeleted === false)).toBe(true);
    });
  });

  describe('RiskService.update', () => {
    it('should update risk assessment with recalculation', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        hazardId: 1,
        ei: 4,
        pi: 3,
        fi: 5,
        ri: 60,
        correctiveMeasures: 'Old measures',
        e: 4,
        p: 2,
        f: 5,
        r: 40,
        isHighRisk: false,
        isDeleted: false,
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      const updatedRisk = {
        ...mockRisk,
        correctiveMeasures: 'New improved measures',
        p: 1, // Further reduced
        r: 20, // Recalculated: 4 × 1 × 5 = 20
        updatedAt: new Date(),
      };

      // Mock getById - risk select
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      // Mock position verification
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      // Mock update
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedRisk]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.update(1, {
        correctiveMeasures: 'New improved measures',
        p: 1,
      });

      expect(result.correctiveMeasures).toBe('New improved measures');
      expect(result.r).toBe(20); // Recalculated
    });

    it('should reject update if R >= Ri after recalculation', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        hazardId: 1,
        ei: 4,
        pi: 3,
        fi: 5,
        ri: 60,
        e: 4,
        p: 2,
        f: 5,
        r: 40,
        isHighRisk: false,
        isDeleted: false,
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(
        service.update(1, {
          p: 3, // Increased back to initial level!
          // This would make R = 4 × 3 × 5 = 60 = Ri (no reduction!)
        })
      ).rejects.toThrow(/Резидуални ризик.*мора бити мањи од иницијалног ризика/);
    });

    it('should reject update without ownership (RLS)', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        isDeleted: false,
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-456', // Different user
      };

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(
        service.update(1, {
          correctiveMeasures: 'Hacked measures',
        })
      ).rejects.toThrow(/Забрањен приступ/);
    });
  });

  describe('RiskService.delete', () => {
    it('should soft delete risk assessment', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        isDeleted: false,
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-123',
      };

      const deletedRisk = {
        ...mockRisk,
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock getById
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      // Mock position verification
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      // Mock soft delete
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([deletedRisk]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      const result = await service.delete(1);

      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toBeDefined();
    });

    it('should reject delete without ownership (RLS)', async () => {
      const mockRisk = {
        id: 1,
        positionId: 1,
        isDeleted: false,
      };

      const mockPosition = {
        id: 1,
        companyId: 1,
        userId: 'user-456', // Different user
      };

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockRisk]),
        }),
      });

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockPosition]),
          }),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(service.delete(1)).rejects.toThrow(/Забрањен приступ/);
    });

    it('should reject deletion of already deleted risk assessment', async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const service = new RiskService(db, 'user-123');

      await expect(service.delete(1)).rejects.toThrow(/Процена ризика/);
    });
  });

  describe('RiskService.validateReduction (Helper)', () => {
    it('should validate risk reduction without creating assessment', () => {
      const service = new RiskService(db, 'user-123');

      // Valid reduction: Ri=60, R=40
      const result = service.validateReduction(4, 3, 5, 4, 2, 5);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error if R >= Ri', () => {
      const service = new RiskService(db, 'user-123');

      // Invalid: R = Ri
      const result = service.validateReduction(4, 3, 5, 4, 3, 5);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toMatch(/мора бити мањи од иницијалног ризика/);
    });

    it('should return warning if R > 70', () => {
      const service = new RiskService(db, 'user-123');

      // R=80 > 70 (but R < Ri, so valid)
      const result = service.validateReduction(6, 4, 5, 6, 3, 5);
      // Ri = 6 × 4 × 5 = 120
      // R = 6 × 3 × 5 = 90

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.message.includes('ПОВЕЋАН РИЗИК'))).toBe(true);
    });
  });

  describe('Serbian Localization', () => {
    it('should return Serbian error messages for all failures', async () => {
      const service = new RiskService(db, 'user-123');

      const testCases = [
        {
          name: 'Non-existent risk assessment',
          test: async () => {
            (db.select as any).mockReturnValue({
              from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
              }),
            });
            await service.getById(999);
          },
          expectedMessage: /Процена ризика/,
        },
        {
          name: 'Non-existent position',
          test: async () => {
            (db.select as any).mockReturnValue({
              from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue([]),
                }),
              }),
            });
            await service.create({
              positionId: 999,
              hazardId: 1,
              ei: 4,
              pi: 3,
              fi: 5,
              correctiveMeasures: 'Test',
              e: 4,
              p: 2,
              f: 5,
              responsiblePerson: 'Test',
              deadline: null,
            });
          },
          expectedMessage: /Радно место/,
        },
        {
          name: 'Forbidden access',
          test: async () => {
            const mockPosition = {
              id: 1,
              companyId: 1,
              userId: 'user-456',
            };

            (db.select as any).mockReturnValue({
              from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue([mockPosition]),
                }),
              }),
            });

            await service.create({
              positionId: 1,
              hazardId: 1,
              ei: 4,
              pi: 3,
              fi: 5,
              correctiveMeasures: 'Test',
              e: 4,
              p: 2,
              f: 5,
              responsiblePerson: 'Test',
              deadline: null,
            });
          },
          expectedMessage: /Забрањен приступ/,
        },
        {
          name: 'Ineffective corrective measures (R >= Ri)',
          test: async () => {
            const mockPosition = {
              id: 1,
              companyId: 1,
              userId: 'user-123',
            };

            (db.select as any).mockReturnValue({
              from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                  where: vi.fn().mockResolvedValue([mockPosition]),
                }),
              }),
            });

            await service.create({
              positionId: 1,
              hazardId: 1,
              ei: 4,
              pi: 3,
              fi: 5,
              correctiveMeasures: 'Неефикасне мере',
              e: 4,
              p: 3,
              f: 5,
              responsiblePerson: 'Test',
              deadline: null,
            });
          },
          expectedMessage: /Резидуални ризик.*мора бити мањи од иницијалног ризика/,
        },
      ];

      for (const testCase of testCases) {
        try {
          await testCase.test();
          expect.fail(`Should have thrown error for: ${testCase.name}`);
        } catch (error: any) {
          expect(error.message, `Test case: ${testCase.name}`).toMatch(testCase.expectedMessage);
        }
        vi.clearAllMocks();
      }
    });
  });
});
