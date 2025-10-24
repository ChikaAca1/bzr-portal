import { eq, and, sql } from 'drizzle-orm';
import { db, workPositions, companies, type WorkPosition, type NewWorkPosition } from '../db';

type DB = typeof db;
import { throwNotFoundError, throwForbiddenError } from '../api/middleware/error-handler';

/**
 * Position Service
 *
 * Business logic for work position (radno mesto) management.
 * Implements row-level security via company ownership.
 *
 * Maps to FR-002 requirements.
 */

export class PositionService {
  constructor(private db: DB, private userId: string) {}

  /**
   * Create new work position
   *
   * @param data - Position data
   * @returns Created position
   */
  async create(data: NewWorkPosition): Promise<WorkPosition> {
    // Verify company ownership
    await this.verifyCompanyOwnership(data.companyId);

    const [position] = await this.db.insert(workPositions).values(data).returning();

    if (!position) {
      throw new Error('Failed to create position');
    }

    return position;
  }

  /**
   * Get position by ID
   *
   * @param id - Position ID
   * @returns Position
   */
  async getById(id: number): Promise<WorkPosition> {
    const [position] = await this.db
      .select()
      .from(workPositions)
      .where(and(eq(workPositions.id, id), eq(workPositions.isDeleted, false)));

    if (!position) {
      throwNotFoundError('Радно место');
    }

    // Verify company ownership
    await this.verifyCompanyOwnership(position.companyId);

    return position;
  }

  /**
   * List positions by company with pagination and search
   *
   * Maps to positions.listByCompany in contracts/positions.contract.md
   *
   * @param companyId - Company ID
   * @param page - Page number (default 1)
   * @param pageSize - Items per page (default 20)
   * @param search - Search query (optional)
   * @returns Paginated positions
   */
  async listByCompany(
    companyId: number,
    page = 1,
    pageSize = 20,
    search?: string
  ): Promise<{
    positions: WorkPosition[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    // Verify company ownership
    await this.verifyCompanyOwnership(companyId);

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [eq(workPositions.companyId, companyId), eq(workPositions.isDeleted, false)];

    if (search) {
      conditions.push(
        sql`(${workPositions.positionName} ILIKE ${`%${search}%`} OR ${workPositions.department} ILIKE ${`%${search}%`})`
      );
    }

    // Get positions
    const positions = await this.db
      .select()
      .from(workPositions)
      .where(and(...conditions))
      .orderBy(workPositions.positionName)
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(workPositions)
      .where(and(...conditions));

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      positions,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Update position
   *
   * @param id - Position ID
   * @param data - Updated position data
   * @returns Updated position
   */
  async update(id: number, data: Partial<NewWorkPosition>): Promise<WorkPosition> {
    // Verify ownership
    await this.getById(id);

    const [updated] = await this.db
      .update(workPositions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workPositions.id, id))
      .returning();

    if (!updated) {
      throw new Error('Failed to update position');
    }

    return updated;
  }

  /**
   * Soft delete position
   *
   * @param id - Position ID
   * @returns Deleted position
   */
  async delete(id: number): Promise<WorkPosition> {
    // Verify ownership
    await this.getById(id);

    const [deleted] = await this.db
      .update(workPositions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workPositions.id, id))
      .returning();

    if (!deleted) {
      throw new Error('Failed to delete position');
    }

    return deleted;
  }

  /**
   * Verify company ownership (row-level security)
   *
   * @param companyId - Company ID
   * @throws FORBIDDEN if user doesn't own company
   */
  private async verifyCompanyOwnership(companyId: number): Promise<void> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.isDeleted, false)));

    if (!company) {
      throwNotFoundError('Предузеће');
    }

    if (company.userId !== this.userId) {
      throwForbiddenError();
    }
  }
}

