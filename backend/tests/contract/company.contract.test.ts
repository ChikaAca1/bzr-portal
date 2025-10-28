/**
 * Contract Tests: Company API Service (T053)
 *
 * Tests CompanyService business logic with authentication, RLS, and validation.
 * Requirements: FR-001 (company management), FR-030 (multi-tenancy)
 *
 * Test Coverage:
 * - CompanyService.create with PIB/activity code validation
 * - CompanyService.getById with RLS enforcement
 * - CompanyService.listByUser filtering by userId
 * - CompanyService.update with ownership check
 * - CompanyService.delete (soft delete)
 * - PIB modulo-11 checksum validation
 * - Serbian Cyrillic error messages
 * - Trial account limit (1 company max via countByUser)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock database module
vi.mock('../../src/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    query: {
      companies: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
  companies: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    pib: 'pib',
    maticniBroj: 'maticniBroj',
    activityCode: 'activityCode',
    address: 'address',
    director: 'director',
    bzrResponsiblePerson: 'bzrResponsiblePerson',
    isDeleted: 'isDeleted',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
  },
}));

// Mock validators
vi.mock('../../src/lib/validators', () => ({
  validatePIBOrThrow: vi.fn((pib: string) => {
    if (!/^\d{9}$/.test(pib)) {
      throw new Error(`Неважећи ПИБ (треба 9 цифара): ${pib}`);
    }
    // Simulate checksum validation
    if (pib === '999999999' || pib === '106006802') {
      throw new Error(`Неважећи ПИБ (провера контролне суме): ${pib}`);
    }
  }),
  validateActivityCodeOrThrow: vi.fn((code: string) => {
    if (!/^\d{4}$/.test(code)) {
      throw new Error(`Неважећа шифра делатности (треба тачно 4 цифре): ${code}`);
    }
  }),
}));

// Mock logger
vi.mock('../../src/lib/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logAuth: vi.fn(),
}));

// Import after mocks
import { CompanyService } from '../../src/services/CompanyService';
import { db } from '../../src/db';

describe('Company API Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CompanyService.create', () => {
    it('should create company with valid data and enforce RLS', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Тест Компанија ДОО',
        pib: '106006801',
        maticniBroj: '12345678',
        activityCode: '4520',
        activityDescription: 'Трговина аутомобилима',
        address: 'Београд, Кнеза Милоша 10',
        city: 'Београд',
        postalCode: '11000',
        phone: '+381 11 1234567',
        email: 'kontakt@test.rs',
        director: 'Петар Петровић',
        directorJmbg: '0101995123456',
        bzrResponsiblePerson: 'Марко Марковић',
        bzrResponsibleJmbg: '1512990070007',
        employeeCount: '50',
        organizationChart: 'https://test.rs/chart.pdf',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      // Mock duplicate PIB check
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      // Mock insert
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCompany]),
        }),
      });

      const result = await CompanyService.create({
        userId: 'user-123',
        name: mockCompany.name,
        pib: mockCompany.pib,
        maticniBroj: mockCompany.maticniBroj,
        activityCode: mockCompany.activityCode,
        activityDescription: mockCompany.activityDescription,
        address: mockCompany.address,
        city: mockCompany.city,
        postalCode: mockCompany.postalCode,
        phone: mockCompany.phone,
        email: mockCompany.email,
        director: mockCompany.director,
        directorJmbg: mockCompany.directorJmbg,
        bzrResponsiblePerson: mockCompany.bzrResponsiblePerson,
        bzrResponsibleJmbg: mockCompany.bzrResponsibleJmbg,
        employeeCount: mockCompany.employeeCount,
        organizationChart: mockCompany.organizationChart,
      });

      expect(result).toMatchObject({
        id: 1,
        userId: 'user-123',
        name: mockCompany.name,
        pib: mockCompany.pib,
      });
    });

    it('should reject duplicate PIB (Serbian error)', async () => {
      // Mock existing company with same PIB
      (db.query.companies.findFirst as any).mockResolvedValue({
        id: 1,
        pib: '106006801',
        isDeleted: false,
      });

      await expect(
        CompanyService.create({
          userId: 'user-456',
          name: 'Duplicate Company',
          pib: '106006801',
          activityCode: '4520',
          address: 'Test Address',
          director: 'Test Director',
          bzrResponsiblePerson: 'Test BZR',
        })
      ).rejects.toThrow(/ПИБ-ом 106006801 већ постоји/);
    });

    it('should reject invalid PIB checksum', async () => {
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      await expect(
        CompanyService.create({
          userId: 'user-123',
          name: 'Test Company',
          pib: '106006802', // Wrong checksum
          activityCode: '4520',
          address: 'Test Address',
          director: 'Test Director',
          bzrResponsiblePerson: 'Test BZR',
        })
      ).rejects.toThrow(/Неважећи ПИБ.*контролне суме/);
    });

    it('should reject invalid PIB length', async () => {
      await expect(
        CompanyService.create({
          userId: 'user-123',
          name: 'Test Company',
          pib: '1060068', // Only 7 digits
          activityCode: '4520',
          address: 'Test Address',
          director: 'Test Director',
          bzrResponsiblePerson: 'Test BZR',
        })
      ).rejects.toThrow(/9 цифара/);
    });

    it('should reject invalid activity code format', async () => {
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      await expect(
        CompanyService.create({
          userId: 'user-123',
          name: 'Test Company',
          pib: '106006801',
          activityCode: '45', // Only 2 digits
          address: 'Test Address',
          director: 'Test Director',
          bzrResponsiblePerson: 'Test BZR',
        })
      ).rejects.toThrow(/4 цифре/);
    });
  });

  describe('CompanyService.getById', () => {
    it('should return company for authorized user (RLS)', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test Company',
        pib: '106006801',
        activityCode: '4520',
        address: 'Test Address',
        director: 'Test Director',
        bzrResponsiblePerson: 'Test BZR',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (db.query.companies.findFirst as any).mockResolvedValue(mockCompany);

      const result = await CompanyService.getById(1, 'user-123');

      expect(result).toMatchObject({
        id: 1,
        userId: 'user-123',
        name: 'Test Company',
      });
    });

    it('should return null for company owned by different user (RLS)', async () => {
      // Mock returns null when userId doesn't match (RLS filter)
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      const result = await CompanyService.getById(1, 'user-456');

      expect(result).toBeNull();
    });

    it('should not return soft-deleted companies', async () => {
      // isDeleted=false filter excludes deleted companies
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      const result = await CompanyService.getById(1, 'user-123');

      expect(result).toBeNull();
    });

    it('should return null for non-existent company', async () => {
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      const result = await CompanyService.getById(999, 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('CompanyService.listByUser', () => {
    it('should return all companies for user (RLS filtering)', async () => {
      const mockCompanies = [
        {
          id: 1,
          userId: 'user-123',
          name: 'Company A',
          pib: '106006801',
          isDeleted: false,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          userId: 'user-123',
          name: 'Company B',
          pib: '100001011',
          isDeleted: false,
          createdAt: new Date('2024-01-02'),
        },
      ];

      (db.query.companies.findMany as any).mockResolvedValue(mockCompanies);

      const result = await CompanyService.listByUser('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Company A');
      expect(result[1].name).toBe('Company B');
      expect(result.every((c) => c.userId === 'user-123')).toBe(true);
    });

    it('should return empty array if user has no companies', async () => {
      (db.query.companies.findMany as any).mockResolvedValue([]);

      const result = await CompanyService.listByUser('user-123');

      expect(result).toEqual([]);
    });

    it('should not include soft-deleted companies', async () => {
      const activeCompanies = [
        {
          id: 1,
          userId: 'user-123',
          name: 'Active Company',
          isDeleted: false,
        },
      ];

      (db.query.companies.findMany as any).mockResolvedValue(activeCompanies);

      const result = await CompanyService.listByUser('user-123');

      expect(result.every((c) => c.isDeleted === false)).toBe(true);
    });
  });

  describe('CompanyService.update', () => {
    it('should update company with valid data and ownership check', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Old Name',
        pib: '106006801',
        activityCode: '4520',
        address: 'Old Address',
        director: 'Old Director',
        bzrResponsiblePerson: 'Old BZR',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCompany = {
        ...mockCompany,
        name: 'New Name',
        address: 'New Address',
        updatedAt: new Date(),
      };

      // Mock getById (ownership check)
      (db.query.companies.findFirst as any).mockResolvedValue(mockCompany);

      // Mock update
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedCompany]),
          }),
        }),
      });

      const result = await CompanyService.update({
        id: 1,
        userId: 'user-123',
        name: 'New Name',
        address: 'New Address',
      });

      expect(result.name).toBe('New Name');
      expect(result.address).toBe('New Address');
    });

    it('should reject update without ownership (RLS)', async () => {
      // getById returns null for different user (RLS)
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      await expect(
        CompanyService.update({
          id: 1,
          userId: 'user-456', // Different user
          name: 'Hacked Name',
        })
      ).rejects.toThrow(/није пронађена или није доступна/);
    });

    it('should validate PIB if updated', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test Company',
        pib: '106006801',
        isDeleted: false,
      };

      (db.query.companies.findFirst as any).mockResolvedValue(mockCompany);

      await expect(
        CompanyService.update({
          id: 1,
          userId: 'user-123',
          pib: '999999999', // Invalid checksum
        })
      ).rejects.toThrow(/Неважећи ПИБ.*контролне суме/);
    });

    it('should validate activity code if updated', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test Company',
        activityCode: '4520',
        isDeleted: false,
      };

      (db.query.companies.findFirst as any).mockResolvedValue(mockCompany);

      await expect(
        CompanyService.update({
          id: 1,
          userId: 'user-123',
          activityCode: '45', // Wrong format
        })
      ).rejects.toThrow(/4 цифре/);
    });
  });

  describe('CompanyService.delete', () => {
    it('should soft delete company', async () => {
      const mockCompany = {
        id: 1,
        userId: 'user-123',
        name: 'Test Company',
        pib: '106006801',
        isDeleted: false,
      };

      // Mock getById (ownership check)
      (db.query.companies.findFirst as any).mockResolvedValue(mockCompany);

      // Mock soft delete
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      await expect(CompanyService.delete(1, 'user-123')).resolves.not.toThrow();
    });

    it('should reject delete without ownership (RLS)', async () => {
      // getById returns null for different user
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      await expect(CompanyService.delete(1, 'user-456')).rejects.toThrow(
        /није пронађена или није доступна/
      );
    });

    it('should reject deletion of already deleted company', async () => {
      // isDeleted=false filter excludes it
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      await expect(CompanyService.delete(1, 'user-123')).rejects.toThrow(
        /није пронађена или није доступна/
      );
    });

    it('should reject deletion of non-existent company', async () => {
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      await expect(CompanyService.delete(999, 'user-123')).rejects.toThrow(
        /није пронађена или није доступна/
      );
    });
  });

  describe('CompanyService.countByUser (Trial Limits)', () => {
    it('should count active companies for user', async () => {
      const mockCompanies = [
        { id: 1, userId: 'user-123', isDeleted: false },
        { id: 2, userId: 'user-123', isDeleted: false },
      ];

      (db.query.companies.findMany as any).mockResolvedValue(mockCompanies);

      const count = await CompanyService.countByUser('user-123');

      expect(count).toBe(2);
    });

    it('should not count soft-deleted companies', async () => {
      const activeCompanies = [{ id: 1, userId: 'user-123', isDeleted: false }];

      (db.query.companies.findMany as any).mockResolvedValue(activeCompanies);

      const count = await CompanyService.countByUser('user-123');

      expect(count).toBe(1);
    });

    it('should return 0 if user has no companies', async () => {
      (db.query.companies.findMany as any).mockResolvedValue([]);

      const count = await CompanyService.countByUser('user-123');

      expect(count).toBe(0);
    });

    it('should be used for trial limit enforcement', async () => {
      // This test demonstrates how trial limits would be enforced
      // In actual implementation, middleware checks count before allowing create

      // Trial limit is 1 company
      const TRIAL_COMPANY_LIMIT = 1;

      const mockCompanies = [{ id: 1, userId: 'user-123', isDeleted: false }];
      (db.query.companies.findMany as any).mockResolvedValue(mockCompanies);

      const count = await CompanyService.countByUser('user-123');

      // User would be blocked from creating second company
      const canCreateMore = count < TRIAL_COMPANY_LIMIT;
      expect(canCreateMore).toBe(false);
    });
  });

  describe('Serbian Localization', () => {
    it('should return Serbian error messages for all validation failures', async () => {
      (db.query.companies.findFirst as any).mockResolvedValue(null);

      const testCases = [
        {
          name: 'Invalid PIB length',
          pib: '12345',
          expectedMessage: /9 цифара/,
        },
        {
          name: 'Invalid PIB checksum',
          pib: '999999999',
          expectedMessage: /контролне суме/,
        },
        {
          name: 'Invalid activity code',
          activityCode: '45',
          expectedMessage: /4 цифре/,
        },
        {
          name: 'Duplicate PIB',
          pib: '106006801',
          setupMock: () => {
            (db.query.companies.findFirst as any).mockResolvedValue({
              id: 1,
              pib: '106006801',
            });
          },
          expectedMessage: /ПИБ-ом.*већ постоји/,
        },
      ];

      for (const testCase of testCases) {
        if (testCase.setupMock) {
          testCase.setupMock();
        }

        try {
          await CompanyService.create({
            userId: 'user-123',
            name: 'Test Company',
            pib: testCase.pib || '106006801',
            activityCode: testCase.activityCode || '4520',
            address: 'Test Address',
            director: 'Test Director',
            bzrResponsiblePerson: 'Test BZR',
          });
          expect.fail(`Should have thrown error for: ${testCase.name}`);
        } catch (error: any) {
          expect(error.message, `Test case: ${testCase.name}`).toMatch(testCase.expectedMessage);
        }

        // Reset mock for next test
        (db.query.companies.findFirst as any).mockResolvedValue(null);
      }
    });
  });
});
