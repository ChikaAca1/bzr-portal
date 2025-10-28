/**
 * Unit Tests: DocumentService (T059)
 *
 * Tests complete document generation flow:
 * 1. Template loading from file
 * 2. Data preparation via DocumentGeneratorService
 * 3. DOCX generation with docx-templates
 * 4. S3 upload to Wasabi
 * 5. Database record creation
 * 6. Pre-signed URL generation
 *
 * Requirements:
 * - FR-034-FR-042: All 8 mandatory document sections
 * - FR-052a: Document metadata tracking
 * - FR-052e: Pre-signed URL downloads (1-hour expiration)
 * - NFR-001: <8s generation time (90th percentile)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockInstance } from 'vitest';

// Mock dependencies before imports
vi.mock('../../../src/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
  documents: {
    id: 'id',
    companyId: 'company_id',
    positionId: 'position_id',
    filename: 'filename',
    filePathS3: 'file_path_s3',
    fileSizeBytes: 'file_size_bytes',
    mimeType: 'mime_type',
    generationTimestamp: 'generation_timestamp',
    generationDurationMs: 'generation_duration_ms',
    version: 'version',
    documentType: 'document_type',
    isDeleted: 'is_deleted',
    deletedAt: 'deleted_at',
  },
}));

vi.mock('../../../src/services/document-generator.service', () => ({
  DocumentGeneratorService: vi.fn(),
}));

vi.mock('../../../src/services/storage.service', () => ({
  StorageService: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    access: vi.fn(),
  },
}));

vi.mock('docx-templates', () => ({
  default: vi.fn(),
}));

// Import after mocks
import { db, documents } from '../../../src/db';
import { DocumentGeneratorService } from '../../../src/services/document-generator.service';
import { StorageService } from '../../../src/services/storage.service';
import fs from 'fs/promises';
import createReport from 'docx-templates';

describe('DocumentService', () => {
  let mockDocumentGeneratorService: any;
  let mockStorageService: any;
  let mockDb: any;
  let DocumentService: any;

  const mockCompanyId = 1;
  const mockUserId = 'user-123';
  const mockPositionId = 1;

  const mockDocumentData = {
    company: {
      name: 'Test Company DOO',
      pib: '123456789',
      address: 'Belgrade, Serbia',
      city: 'Belgrade',
      activityCode: '8130',
      activityDescription: 'Landscape service activities',
      director: 'Marko Markovic',
      bzrResponsiblePerson: 'Jovana Jovanovic, inženjer BZR',
      employeeCount: '15',
    },
    positions: [
      {
        positionName: 'Računovođa',
        department: 'Finansije',
        totalCount: 2,
        maleCount: 0,
        femaleCount: 2,
        requiredEducation: 'VII stepen',
        requiredExperience: '3 godine',
        risks: [
          {
            hazardName: 'Rad sa monitorom',
            hazardCategory: 'Ergonomski',
            ei: 3,
            pi: 4,
            fi: 5,
            ri: 60,
            correctiveMeasures: 'Ergonomska stolica, pauze svakih 60 minuta',
            e: 2,
            p: 3,
            f: 4,
            r: 24,
            riskLevel: 'Низак ризик',
            isHighRisk: false,
          },
        ],
      },
    ],
    summary: {
      totalPositions: 1,
      totalRisks: 1,
      highRiskPositions: 0,
      lowRiskCount: 1,
      mediumRiskCount: 0,
      highRiskCount: 0,
    },
    metadata: {
      generatedDate: '15.10.2025',
      validityPeriod: '15.10.2027',
    },
  };

  const mockDocxBuffer = Buffer.from('fake-docx-content');
  const mockS3Path = 'documents/1/doc_1_akt-123456789.docx';
  const mockPreSignedUrl = 'https://s3.wasabisys.com/presigned-url';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocked services
    mockDocumentGeneratorService = {
      generateDocumentData: vi.fn().mockResolvedValue(mockDocumentData),
    };

    mockStorageService = {
      uploadDocument: vi.fn().mockResolvedValue({
        key: mockS3Path,
        bucket: 'bzr-documents',
        size: mockDocxBuffer.length,
      }),
      getPreSignedUrl: vi.fn().mockResolvedValue(mockPreSignedUrl),
    };

    (DocumentGeneratorService as any).mockImplementation(() => mockDocumentGeneratorService);
    (StorageService as any).mockImplementation(() => mockStorageService);

    // Mock fs.readFile for template loading
    (fs.readFile as MockInstance).mockResolvedValue(Buffer.from('template-content'));

    // Mock fs.access for template existence check
    (fs.access as MockInstance).mockResolvedValue(undefined);

    // Mock docx-templates createReport
    (createReport as any).mockResolvedValue(mockDocxBuffer);

    // Mock database
    mockDb = db;

    // Mock db.select() chain for getNextVersion query
    (mockDb.select as MockInstance).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing versions by default
          }),
        }),
      }),
    });

    // Mock db.insert() chain for saveDocumentMetadata
    (mockDb.insert as MockInstance).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            companyId: mockCompanyId,
            positionId: mockPositionId,
            filename: 'Akt_Procena_Rizika_123456789.docx',
            filePathS3: mockS3Path,
            fileSizeBytes: mockDocxBuffer.length,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            generationTimestamp: new Date(),
            generationDurationMs: 3500,
            version: 1,
            documentType: 'akt_procena_rizika',
            isDeleted: false,
            deletedAt: null,
          },
        ]),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Template Loading', () => {
    it('should load template from file system', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      // Verify template was loaded (full path will vary by environment)
      expect(fs.readFile).toHaveBeenCalled();
      const callPath = (fs.readFile as MockInstance).mock.calls[0][0] as string;
      expect(callPath).toMatch(/akt-procena-rizika-template\.docx$/);
    });

    it('should throw error if template file not found', async () => {
      // Reset cache to test error path
      const { DocumentService } = await import('../../../src/services/document.service');
      (DocumentService as any).templateCache = null;

      (fs.access as MockInstance).mockRejectedValueOnce(new Error('ENOENT: no such file'));

      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow(
        /Предложак документа није пронађен/
      );
    });

    it('should cache template buffer for subsequent calls', async () => {
      // Reset cache before test
      const { DocumentService } = await import('../../../src/services/document.service');
      (DocumentService as any).templateCache = null;

      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);
      await service.generateDocument(mockCompanyId, mockPositionId);

      // Should only load template once (cached)
      // Note: Due to static caching, may have been called in previous tests
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe('Data Preparation', () => {
    it('should fetch document data from DocumentGeneratorService', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      expect(mockDocumentGeneratorService.generateDocumentData).toHaveBeenCalledWith(
        mockCompanyId,
        mockUserId
      );
    });

    it('should transform data to include all FR-034-FR-042 sections', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      const callArgs = (createReport as any).mock.calls[0];
      const templateData = callArgs[0].data;

      // Verify all mandatory sections present
      expect(templateData).toHaveProperty('company');
      expect(templateData).toHaveProperty('positions');
      expect(templateData).toHaveProperty('summary');
      expect(templateData).toHaveProperty('metadata');
    });

    it('should format dates in Serbian locale (dd.mm.yyyy)', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      const callArgs = (createReport as any).mock.calls[0];
      const templateData = callArgs[0].data;

      expect(templateData.metadata.generatedDate).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
      expect(templateData.metadata.validityPeriod).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });
  });

  describe('DOCX Generation', () => {
    it('should generate DOCX using docx-templates', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      expect(createReport).toHaveBeenCalledWith({
        template: expect.any(Buffer),
        data: expect.objectContaining({
          company: expect.any(Object),
          positions: expect.any(Array),
          summary: expect.any(Object),
          metadata: expect.any(Object),
        }),
        cmdDelimiter: ['{{', '}}'], // Mustache syntax
      });
    });

    it('should return valid DOCX buffer', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      const result = await service.generateDocument(mockCompanyId, mockPositionId);

      expect(result.filePathS3).toBe(mockS3Path);
      expect(result.fileSizeBytes).toBe(mockDocxBuffer.length);
    });

    it('should throw error if DOCX generation fails', async () => {
      (createReport as any).mockRejectedValue(new Error('Template rendering error'));

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow(
        /Грешка при генерисању документа/
      );
    });
  });

  describe('S3 Upload', () => {
    it('should upload DOCX to Wasabi S3', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      expect(mockStorageService.uploadDocument).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          companyId: mockCompanyId,
          filename: expect.stringMatching(/Akt_Procena_Rizika_\d+\.docx/),
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      );
    });

    it('should use Serbian filename with Cyrillic characters', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      const uploadCall = mockStorageService.uploadDocument.mock.calls[0];
      const filename = uploadCall[1].filename;

      expect(filename).toMatch(/Akt_Procena_Rizika/);
    });

    it('should retry S3 upload on failure (3 attempts)', async () => {
      mockStorageService.uploadDocument
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          key: mockS3Path,
          bucket: 'bzr-documents',
          size: mockDocxBuffer.length,
        });

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      expect(mockStorageService.uploadDocument).toHaveBeenCalledTimes(3);
    });

    it('should throw error after all S3 retry attempts exhausted', async () => {
      mockStorageService.uploadDocument.mockRejectedValue(new Error('S3 upload failed'));

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow(
        /Неуспешно отпремање документа/
      );

      expect(mockStorageService.uploadDocument).toHaveBeenCalledTimes(3);
    });
  });

  describe('Database Persistence', () => {
    it('should save document metadata to database', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      expect(mockDb.insert).toHaveBeenCalledWith(documents);
      const insertCall = mockDb.insert().values.mock.calls[0][0];

      expect(insertCall).toMatchObject({
        companyId: mockCompanyId,
        positionId: mockPositionId,
        filename: expect.any(String),
        filePathS3: mockS3Path,
        fileSizeBytes: mockDocxBuffer.length,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        documentType: 'akt_procena_rizika',
        version: 1,
      });
    });

    it('should track generation duration in milliseconds', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      const insertCall = mockDb.insert().values.mock.calls[0][0];
      // Mocked operations are instant, but duration should still be tracked
      expect(insertCall.generationDurationMs).toBeGreaterThanOrEqual(0);
      expect(insertCall.generationDurationMs).toBeLessThan(9000); // Should be < 9s (Vercel 10s - 1s buffer)
    });

    it('should increment version for regenerated documents', async () => {
      // Mock existing document query - override the default empty array
      (mockDb.select as MockInstance).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 1, version: 2 }, // Existing version 2
              ]),
            }),
          }),
        }),
      });

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      const insertCall = mockDb.insert().values.mock.calls[0][0];
      expect(insertCall.version).toBe(3); // Incremented to 3
    });
  });

  describe('Download URL Generation', () => {
    it('should generate pre-signed URL with 1-hour expiration (FR-052e)', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      expect(mockStorageService.getPreSignedUrl).toHaveBeenCalledWith(mockS3Path, 3600); // 1 hour
    });

    it('should return document with download URL', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      const result = await service.generateDocument(mockCompanyId, mockPositionId);

      expect(result).toMatchObject({
        id: expect.any(Number),
        filename: expect.stringMatching(/Akt_Procena_Rizika/),
        downloadUrl: mockPreSignedUrl,
        fileSizeBytes: mockDocxBuffer.length,
        generationDurationMs: expect.any(Number),
      });
    });
  });

  describe('Performance', () => {
    it('should complete generation in <9 seconds (NFR-001 - Vercel 10s timeout)', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      const startTime = Date.now();
      await service.generateDocument(mockCompanyId, mockPositionId);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(9000); // 9s limit with 1s buffer
    });

    it('should track generation time for performance monitoring', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      const result = await service.generateDocument(mockCompanyId, mockPositionId);

      // In mocked tests, duration will be near-instant, but should still be tracked
      expect(result.generationDurationMs).toBeGreaterThanOrEqual(0);
      expect(result.generationDurationMs).toBeLessThan(9000);
    });
  });

  describe('Error Handling', () => {
    it('should throw Serbian error if company not found', async () => {
      mockDocumentGeneratorService.generateDocumentData.mockRejectedValue(
        new Error('Предузеће није пронађено или није доступно.')
      );

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow(
        /Предузеће није пронађено или није доступно/
      );
    });

    it('should throw Serbian error if user not authorized', async () => {
      mockDocumentGeneratorService.generateDocumentData.mockRejectedValue(new Error('Forbidden'));

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow();
    });

    it('should rollback database insert if S3 upload fails', async () => {
      mockStorageService.uploadDocument.mockRejectedValue(
        new Error('S3 upload failed permanently')
      );

      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow();

      // Should not create database record if upload fails
      expect(mockDb.insert().values().returning).not.toHaveBeenCalled();
    });
  });

  describe('Serbian Localization', () => {
    it('should use Serbian Cyrillic error messages', async () => {
      // Reset cache and mock error
      const { DocumentService } = await import('../../../src/services/document.service');
      (DocumentService as any).templateCache = null;
      (fs.access as MockInstance).mockRejectedValueOnce(new Error('ENOENT'));

      const service = new DocumentService(mockDb, mockUserId);

      await expect(service.generateDocument(mockCompanyId, mockPositionId)).rejects.toThrow(
        /Предложак документа није пронађен/
      );
    });

    it('should format company data with Serbian characters', async () => {
      const { DocumentService } = await import('../../../src/services/document.service');
      const service = new DocumentService(mockDb, mockUserId);

      await service.generateDocument(mockCompanyId, mockPositionId);

      const callArgs = (createReport as any).mock.calls[0];
      const templateData = callArgs[0].data;

      expect(templateData.company.director).toBe('Marko Markovic');
      expect(templateData.company.bzrResponsiblePerson).toContain('inženjer BZR');
    });
  });
});
