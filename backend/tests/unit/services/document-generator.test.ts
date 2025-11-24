import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentGeneratorService } from '../../../src/services/document-generator.service';

/**
 * Unit Tests for Document Generator Service
 *
 * Tests FR-008, FR-009 (8 mandatory sections per Pravilnik 5/2018)
 * Covers T080-T081: Template data compilation and timeout validation
 */

describe('Document Generator Service - Template Data Compilation (T080)', () => {
  let mockDb: any;
  let service: DocumentGeneratorService;

  beforeEach(() => {
    // Mock database with chainable methods
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
    };

    service = new DocumentGeneratorService(mockDb);
  });

  describe('generateDocumentData', () => {
    it('should compile complete document data with all required sections', async () => {
      // Mock company data
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test DOO',
        pib: '123456789',
        address: 'Beograd, Kneza Miloša 10',
        city: 'Beograd',
        activityCode: '62.01',
        activityDescription: 'Računarsko programiranje',
        director: 'Marko Marković',
        bzrResponsiblePerson: 'Jelena Jovanović',
        employeeCount: '25',
      };

      // Mock position data
      const mockPositions = [
        {
          id: 1,
          companyId: 1,
          positionName: 'Programer',
          department: 'IT',
          totalCount: 5,
          maleCount: 3,
          femaleCount: 2,
          requiredEducation: 'VSS',
          requiredExperience: '2 godine',
        },
      ];

      // Mock risk assessment data
      const mockRisks = [
        {
          hazardName: 'Дуготрајан рад за рачунаром',
          hazardCategory: 'Ergonomski',
          ei: 3,
          pi: 5,
          fi: 6,
          ri: 90,
          correctiveMeasures: 'Паузе сваких 2 сата, ергономска столица',
          e: 2,
          p: 3,
          f: 6,
          r: 36,
          isHighRisk: false,
        },
      ];

      // Setup mock chain for company query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCompany]),
        }),
      });

      // Setup mock chain for positions query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockPositions),
        }),
      });

      // Setup mock chain for risks query
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockRisks),
          }),
        }),
      });

      const result = await service.generateDocumentData(1, 'user-123');

      // Verify company section (FR-034, FR-036)
      expect(result.company).toBeDefined();
      expect(result.company.name).toBe('Test DOO');
      expect(result.company.pib).toBe('123456789');
      expect(result.company.director).toBe('Marko Marković');
      expect(result.company.bzrResponsiblePerson).toBe('Jelena Jovanović');

      // Verify positions section (FR-038)
      expect(result.positions).toBeDefined();
      expect(result.positions).toHaveLength(1);
      expect(result.positions[0]?.positionName).toBe('Programer');
      expect(result.positions[0]?.totalCount).toBe(5);

      // Verify risk assessments section (FR-039)
      expect(result.positions[0]?.risks).toBeDefined();
      expect(result.positions[0]?.risks).toHaveLength(1);
      expect(result.positions[0]?.risks[0]?.ri).toBe(90);
      expect(result.positions[0]?.risks[0]?.r).toBe(36);
      expect(result.positions[0]?.risks[0]?.riskLevel).toBe('Низак ризик');

      // Verify summary section (FR-040)
      expect(result.summary).toBeDefined();
      expect(result.summary.totalPositions).toBe(1);
      expect(result.summary.totalRisks).toBe(1);
      expect(result.summary.lowRiskCount).toBe(1);
      expect(result.summary.mediumRiskCount).toBe(0);
      expect(result.summary.highRiskCount).toBe(0);

      // Verify metadata (FR-042)
      expect(result.metadata).toBeDefined();
      expect(result.metadata.generatedDate).toMatch(/\d{2}\.\d{2}\.\d{4}/);
      expect(result.metadata.validityPeriod).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it('should correctly categorize risk levels in summary', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test DOO',
        pib: '123456789',
        address: 'Test Address',
        director: 'Director',
        bzrResponsiblePerson: 'BZR Person',
        activityCode: '62.01',
      };

      const mockPositions = [{ id: 1, companyId: 1, positionName: 'Test', totalCount: 1, maleCount: 1, femaleCount: 0 }];

      const mockRisks = [
        { hazardName: 'Low', hazardCategory: 'Test', ei: 1, pi: 1, fi: 1, ri: 10, correctiveMeasures: '', e: 1, p: 1, f: 1, r: 1, isHighRisk: false },
        { hazardName: 'Medium', hazardCategory: 'Test', ei: 3, pi: 3, fi: 3, ri: 50, correctiveMeasures: '', e: 2, p: 2, f: 3, r: 50, isHighRisk: false },
        { hazardName: 'High', hazardCategory: 'Test', ei: 5, pi: 5, fi: 5, ri: 150, correctiveMeasures: '', e: 3, p: 3, f: 3, r: 80, isHighRisk: true },
      ];

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCompany]),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockPositions),
        }),
      });

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockRisks),
          }),
        }),
      });

      const result = await service.generateDocumentData(1, 'user-123');

      // Verify correct categorization per FR-005 thresholds
      expect(result.summary.lowRiskCount).toBe(1); // R ≤ 36
      expect(result.summary.mediumRiskCount).toBe(1); // 36 < R ≤ 70
      expect(result.summary.highRiskCount).toBe(1); // R > 70
      expect(result.summary.highRiskPositions).toBe(1);
    });

    it('should throw error when company not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(service.generateDocumentData(999, 'user-123')).rejects.toThrow('Предузеће');
    });

    it('should throw error when user does not own company', async () => {
      const mockCompany = { id: 1, userId: 'other-user', name: 'Test' };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCompany]),
        }),
      });

      await expect(service.generateDocumentData(1, 'user-123')).rejects.toThrow('Forbidden');
    });

    it('should calculate 2-year validity period per Član 32', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test',
        pib: '123',
        address: 'Addr',
        director: 'Dir',
        bzrResponsiblePerson: 'BZR',
        activityCode: '62',
      };

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCompany]),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.generateDocumentData(1, 'user-123');

      const generatedYear = parseInt(result.metadata.generatedDate.split('.')[2] || '0');
      const validityYear = parseInt(result.metadata.validityPeriod.split('.')[2] || '0');

      expect(validityYear - generatedYear).toBe(2);
    });
  });
});

describe('Document Generator Service - Performance (T081)', () => {
  it('should compile document data in < 8 seconds per FR-052b', async () => {
    const mockDb: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
    };

    const service = new DocumentGeneratorService(mockDb);

    // Mock large dataset (10 positions, 5 risks each = 50 total risks)
    const mockCompany = {
      id: 1,
      userId: 'user-123',
      name: 'Large Company',
      pib: '123456789',
      address: 'Address',
      director: 'Director',
      bzrResponsiblePerson: 'BZR',
      activityCode: '62',
    };

    const mockPositions = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      companyId: 1,
      positionName: `Position ${i + 1}`,
      totalCount: 5,
      maleCount: 3,
      femaleCount: 2,
    }));

    const mockRisks = Array.from({ length: 5 }, (_, i) => ({
      hazardName: `Hazard ${i + 1}`,
      hazardCategory: 'Test',
      ei: 3,
      pi: 3,
      fi: 3,
      ri: 27,
      correctiveMeasures: 'Test measures',
      e: 2,
      p: 2,
      f: 2,
      r: 8,
      isHighRisk: false,
    }));

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockCompany]),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockPositions),
      }),
    });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockRisks),
        }),
      }),
    });

    const startTime = Date.now();
    await service.generateDocumentData(1, 'user-123');
    const duration = Date.now() - startTime;

    // FR-052b: Document generation must complete in < 8 seconds
    expect(duration).toBeLessThan(8000);
  });
});
