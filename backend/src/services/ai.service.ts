/**
 * AI Service (Phase 3a: T119)
 *
 * Wrapper service for AI agents with error handling, fallback, and validation.
 * Ensures graceful degradation when AI fails (FR-027).
 */

import { suggestHazards as hazardIdentifierAgent, type HazardIdentifierInput, type HazardSuggestion } from '../lib/ai/agents/hazard-identifier.agent.js';
import { getHazardByCode } from '../lib/ai/knowledge/hazard-codes.js';
import { isAIConfigured, getAIProvider } from '../lib/ai/config.js';
import { aiCacheService } from './ai-cache.service.js';
import { generateJobEmbedding, isEmbeddingsAvailable } from '../lib/ai/embeddings.js';

// =============================================================================
// AI Service Class
// =============================================================================

export class AIService {
  /**
   * Suggest hazards for a work position
   *
   * Phase 3b: Now with semantic caching! 🚀
   * - Checks cache for similar jobs first
   * - If cache hit (>85% similarity), returns instant result
   * - If cache miss, calls AI and saves result
   *
   * @param input - Job position data
   * @param companyId - Company ID for multi-tenancy (optional for testing)
   * @returns Object with suggestions or fallback indication
   *
   * Example:
   *   const result = await aiService.suggestHazards({
   *     positionName: "Програмер",
   *     jobDescription: "Пише код 8h дневно",
   *     equipment: ["Компјутер", "2 монитора"],
   *     workspace: "канцеларија",
   *     workHours: { daily: 8 }
   *   }, companyId);
   *
   *   if (result.success) {
   *     console.log(result.suggestions); // AI or cached suggestions
   *     console.log(result.source); // 'AI', 'CACHE', or 'FALLBACK'
   *   } else {
   *     console.log(result.error); // Fallback to manual
   *   }
   */
  async suggestHazards(
    input: HazardIdentifierInput,
    companyId?: number
  ): Promise<
    | { success: true; suggestions: HazardSuggestion[]; source: 'AI' | 'CACHE'; similarity?: number }
    | { success: false; error: string; source: 'FALLBACK'; userMessage: string }
  > {
    try {
      // ===== Phase 3b: Check cache first =====
      if (companyId && isEmbeddingsAvailable()) {
        const cached = await aiCacheService.findSimilar(companyId, input);

        if (cached) {
          return {
            success: true,
            suggestions: cached.suggestions,
            source: 'CACHE',
            similarity: cached.similarity,
          };
        }
      }

      // ===== Cache miss - Call AI =====
      const suggestions = await Promise.race([
        hazardIdentifierAgent(input),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout after 20 seconds')), 20000)
        ),
      ]);

      // Validate hazard codes against database
      const validSuggestions = suggestions.filter((s) => {
        const hazard = getHazardByCode(s.hazardCode);
        return hazard !== undefined;
      });

      // Check if we have at least some valid suggestions
      if (validSuggestions.length === 0) {
        console.warn('AI returned no valid hazard codes (hallucination detected)');
        return {
          success: false,
          error: 'AI_NO_VALID_SUGGESTIONS',
          source: 'FALLBACK',
          userMessage:
            'AI није могао да идентификује релевантне опасности. Молимо изаберите ручно из листе.',
        };
      }

      // ===== Save to cache for future reuse =====
      if (companyId && isEmbeddingsAvailable()) {
        try {
          const embedding = await generateJobEmbedding(input);
          await aiCacheService.save({
            companyId,
            input,
            suggestions: validSuggestions,
            embedding,
          });
        } catch (cacheError) {
          console.warn('Failed to save to cache:', cacheError);
          // Don't fail the request if caching fails
        }
      }

      // Success - return validated suggestions
      return {
        success: true,
        suggestions: validSuggestions,
        source: 'AI',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('AI hazard suggestion failed:', errorMessage);

      // Graceful fallback - system still works manually
      return {
        success: false,
        error: errorMessage,
        source: 'FALLBACK',
        userMessage:
          'AI предлози тренутно нису доступни. Молимо изаберите опасности ручно из листе.',
      };
    }
  }

  /**
   * Check if AI is configured and available
   *
   * @returns boolean
   */
  isAvailable(): boolean {
    return isAIConfigured();
  }

  /**
   * Get current AI provider name
   *
   * @returns AI provider ('anthropic' | 'deepseek' | 'openai')
   */
  getProvider(): string {
    return getAIProvider();
  }
}

// Export singleton instance
export const aiService = new AIService();
