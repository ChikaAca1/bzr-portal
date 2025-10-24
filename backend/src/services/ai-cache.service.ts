/**
 * AI Cache Service (Phase 3b: T122)
 *
 * Manages semantic caching of AI hazard suggestions using pgvector.
 * Enables the system to learn from previous AI calls and reuse results
 * for similar job descriptions.
 */

import { db } from '../db/index.js';
import { aiHazardSuggestionsCache } from '../db/schema/ai-cache.js';
import { sql, eq } from 'drizzle-orm';
import type { HazardIdentifierInput, HazardSuggestion } from '../lib/ai/agents/hazard-identifier.agent.js';
import { generateJobEmbedding, isEmbeddingsAvailable } from '../lib/ai/embeddings.js';
import { getAIProvider } from '../lib/ai/config.js';

// =============================================================================
// Types
// =============================================================================

export interface CacheSearchResult {
  id: string;
  positionName: string;
  jobDescription: string;
  suggestions: HazardSuggestion[];
  similarity: number;
  usageCount: number;
  createdAt: Date;
}

export interface CacheSaveInput {
  companyId: number;
  input: HazardIdentifierInput;
  suggestions: HazardSuggestion[];
  embedding: number[];
}

// =============================================================================
// AI Cache Service Class
// =============================================================================

export class AICacheService {
  /**
   * Search for similar jobs in the cache
   *
   * Uses cosine similarity on embeddings to find jobs that are semantically
   * similar to the query. Returns the most similar job if it exceeds the threshold.
   *
   * @param companyId - Company ID (for multi-tenancy)
   * @param input - Job position data
   * @param similarityThreshold - Minimum similarity (0-1, default: 0.85)
   * @returns Most similar cached job, or null if none found
   */
  async findSimilar(
    companyId: number,
    input: HazardIdentifierInput,
    similarityThreshold: number = 0.85
  ): Promise<CacheSearchResult | null> {
    // Check if embeddings are available
    if (!isEmbeddingsAvailable()) {
      console.log('⚠️  Embeddings not available - skipping cache search');
      return null;
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await generateJobEmbedding(input);

      // Convert embedding array to PostgreSQL vector format
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      // Use the PostgreSQL function we created in the migration
      const results = await db.execute<CacheSearchResult>(sql`
        SELECT * FROM search_similar_jobs(
          ${embeddingStr}::vector(1536),
          ${companyId},
          ${similarityThreshold},
          1
        )
      `);

      if (results.rows.length === 0) {
        console.log('🔍 Cache MISS - no similar jobs found');
        return null;
      }

      const match = results.rows[0];
      console.log(`✅ Cache HIT! Similarity: ${(match.similarity * 100).toFixed(1)}%`);
      console.log(`   Match: "${match.positionName}" (used ${match.usageCount} times)`);

      // Update usage statistics
      await this.incrementUsage(match.id);

      return match;
    } catch (error) {
      console.error('Error searching cache:', error);
      return null; // Fail gracefully - don't break AI flow
    }
  }

  /**
   * Save AI result to cache
   *
   * Stores the AI-generated hazard suggestions along with the embedding
   * for future similarity searches.
   *
   * @param data - Cache entry data
   */
  async save(data: CacheSaveInput): Promise<void> {
    if (!isEmbeddingsAvailable()) {
      console.log('⚠️  Embeddings not available - skipping cache save');
      return;
    }

    try {
      // Calculate average confidence
      const confidenceAvg =
        data.suggestions.reduce((sum, s) => sum + s.confidence, 0) / data.suggestions.length;

      // Convert embedding array to PostgreSQL vector format
      const embeddingStr = `[${data.embedding.join(',')}]`;

      // Insert into cache
      await db.execute(sql`
        INSERT INTO ai_hazard_suggestions_cache (
          company_id,
          position_name,
          job_description,
          equipment,
          workspace,
          work_hours,
          embedding,
          suggestions,
          ai_provider,
          confidence_avg
        ) VALUES (
          ${data.companyId},
          ${data.input.positionName},
          ${data.input.jobDescription},
          ${JSON.stringify(data.input.equipment)}::jsonb,
          ${data.input.workspace},
          ${JSON.stringify(data.input.workHours)}::jsonb,
          ${embeddingStr}::vector(1536),
          ${JSON.stringify(data.suggestions)}::jsonb,
          ${getAIProvider()},
          ${confidenceAvg}
        )
      `);

      console.log(`💾 Saved to cache: "${data.input.positionName}"`);
    } catch (error) {
      console.error('Error saving to cache:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Increment usage count when cache entry is reused
   *
   * @param id - Cache entry ID
   */
  private async incrementUsage(id: string): Promise<void> {
    try {
      await db
        .update(aiHazardSuggestionsCache)
        .set({
          usageCount: sql`${aiHazardSuggestionsCache.usageCount} + 1`,
          lastUsedAt: sql`NOW()`,
        })
        .where(eq(aiHazardSuggestionsCache.id, id));
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  /**
   * Get cache statistics for a company
   *
   * @param companyId - Company ID
   * @returns Cache stats (total entries, total reuses, avg confidence)
   */
  async getStats(companyId: number): Promise<{
    totalEntries: number;
    totalReuses: number;
    avgConfidence: number;
    topPositions: Array<{ position: string; usageCount: number }>;
  }> {
    try {
      const [statsResult] = await db.execute<{
        total_entries: number;
        total_reuses: number;
        avg_confidence: number;
      }>(sql`
        SELECT
          COUNT(*)::int as total_entries,
          (SUM(usage_count) - COUNT(*))::int as total_reuses,
          AVG(confidence_avg)::float as avg_confidence
        FROM ai_hazard_suggestions_cache
        WHERE company_id = ${companyId}
      `);

      const topPositions = await db.execute<{
        position_name: string;
        usage_count: number;
      }>(sql`
        SELECT
          position_name,
          usage_count
        FROM ai_hazard_suggestions_cache
        WHERE company_id = ${companyId}
        ORDER BY usage_count DESC
        LIMIT 10
      `);

      return {
        totalEntries: statsResult.rows[0]?.total_entries || 0,
        totalReuses: statsResult.rows[0]?.total_reuses || 0,
        avgConfidence: statsResult.rows[0]?.avg_confidence || 0,
        topPositions: topPositions.rows.map((r) => ({
          position: r.position_name,
          usageCount: r.usage_count,
        })),
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        totalReuses: 0,
        avgConfidence: 0,
        topPositions: [],
      };
    }
  }

  /**
   * Clear cache for a company (for testing or reset)
   *
   * @param companyId - Company ID
   */
  async clear(companyId: number): Promise<void> {
    await db.execute(sql`
      DELETE FROM ai_hazard_suggestions_cache
      WHERE company_id = ${companyId}
    `);
    console.log(`🗑️  Cache cleared for company ${companyId}`);
  }
}

// Export singleton instance
export const aiCacheService = new AICacheService();
