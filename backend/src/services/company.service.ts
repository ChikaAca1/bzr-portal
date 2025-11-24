import { eq, and } from 'drizzle-orm';
import { db, companies, type Company, type NewCompany } from '../db';
import { throwNotFoundError, throwForbiddenError } from '../api/middleware/error-handler';

type DB = typeof db;

/**
 * Company Service
 *
 * Business logic for company (poslodavac) management.
 * Implements row-level security per FR-030.
 *
 * Maps to FR-001 requirements.
 */

export class CompanyService {
  constructor(private db: DB, private userId: number) {}

  /**
   * Create new company
   *
   * @param data - Company data (validated by Zod schema)
   * @returns Created company
   */
  async create(data: Omit<NewCompany, 'userId'>): Promise<Company> {
    const [company] = await this.db
      .insert(companies)
      .values({
        ...data,
        userId: this.userId, // Row-level security
      })
      .returning();

    if (!company) {
      throw new Error('Failed to create company');
    }

    return company;
  }

  /**
   * Get company by ID
   *
   * Enforces row-level security - user can only access their own companies.
   *
   * @param id - Company ID
   * @returns Company or throws NOT_FOUND/FORBIDDEN
   */
  async getById(id: number): Promise<Company> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.isDeleted, false)));

    if (!company) {
      throwNotFoundError('Предузеће');
    }

    // Row-level security check
    if (company.userId !== this.userId) {
      throwForbiddenError();
    }

    return company;
  }

  /**
   * List all companies for current user
   *
   * @returns List of companies
   */
  async list(): Promise<Company[]> {
    return this.db
      .select()
      .from(companies)
      .where(and(eq(companies.userId, this.userId), eq(companies.isDeleted, false)))
      .orderBy(companies.createdAt);
  }

  /**
   * Update company
   *
   * @param id - Company ID
   * @param data - Updated company data
   * @returns Updated company
   */
  async update(id: number, data: Partial<NewCompany>): Promise<Company> {
    // First, verify ownership
    await this.getById(id);

    const [updated] = await this.db
      .update(companies)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    if (!updated) {
      throw new Error('Failed to update company');
    }

    return updated;
  }

  /**
   * Soft delete company (FR-015)
   *
   * @param id - Company ID
   * @returns Deleted company
   */
  async delete(id: number): Promise<Company> {
    // First, verify ownership
    await this.getById(id);

    const [deleted] = await this.db
      .update(companies)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    if (!deleted) {
      throw new Error('Failed to delete company');
    }

    return deleted;
  }
}

