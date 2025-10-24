/**
 * Embeddings Service (Phase 3b: T122)
 *
 * Generates vector embeddings for job descriptions using OpenAI's embeddings API.
 * Used for semantic caching - finding similar jobs without calling expensive LLMs.
 *
 * Model: text-embedding-3-small
 * - 1536 dimensions
 * - $0.02 per 1M tokens (very cheap!)
 * - Fast (~50ms per request)
 */

import OpenAI from 'openai';
import type { HazardIdentifierInput } from './agents/hazard-identifier.agent.js';

// =============================================================================
// Configuration
// =============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key') {
  console.warn('⚠️  OPENAI_API_KEY not configured - embeddings (cache) will not work!');
  console.warn('   Set OPENAI_API_KEY in .env for semantic caching.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// =============================================================================
// Embeddings Generation
// =============================================================================

/**
 * Generate embedding vector for a job description
 *
 * Creates a semantic vector representation (1536 dimensions) that captures
 * the meaning of the job. Similar jobs will have similar vectors.
 *
 * Example:
 *   "čistač pijace" → [0.234, -0.123, 0.456, ...]
 *   "manipulator otpadaka metlom" → [0.229, -0.119, 0.451, ...] (very similar!)
 *
 * @param input - Job position data
 * @returns 1536-dimensional embedding vector
 */
export async function generateJobEmbedding(input: HazardIdentifierInput): Promise<number[]> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key') {
    throw new Error('OPENAI_API_KEY not configured - cannot generate embeddings');
  }

  // Combine all relevant fields into a single text for embedding
  const text = createEmbeddingText(input);

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // 1536 dims, $0.02/1M tokens
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create optimized text representation of job for embedding
 *
 * Combines position name, description, equipment, workspace, and work hours
 * into a single text that captures the essence of the job.
 *
 * @param input - Job position data
 * @returns Text representation for embedding
 */
function createEmbeddingText(input: HazardIdentifierInput): string {
  const parts: string[] = [];

  // Position name (high importance)
  parts.push(`Pozicija: ${input.positionName}`);

  // Job description (highest importance)
  parts.push(`Opis: ${input.jobDescription}`);

  // Equipment (important for hazard identification)
  if (input.equipment.length > 0) {
    parts.push(`Oprema: ${input.equipment.join(', ')}`);
  }

  // Workspace
  parts.push(`Prostor: ${input.workspace}`);

  // Work hours (relevant for fatigue, stress, overtime hazards)
  const workHoursParts: string[] = [];
  workHoursParts.push(`${input.workHours.daily}h dnevno`);
  if (input.workHours.shifts) workHoursParts.push('smenski rad');
  if (input.workHours.nightWork) workHoursParts.push('noćni rad');
  if (input.workHours.overtime) workHoursParts.push('prековremeni');

  parts.push(`Radno vreme: ${workHoursParts.join(', ')}`);

  return parts.join('. ');
}

/**
 * Calculate cosine similarity between two embedding vectors
 *
 * Returns a value between 0 and 1:
 * - 1.0 = identical vectors (same job)
 * - 0.9+ = very similar (probably same job, different wording)
 * - 0.85+ = similar (likely reusable hazards)
 * - <0.85 = different jobs
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Cosine similarity (0-1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Check if embeddings are available (API key configured)
 *
 * @returns true if embeddings can be generated
 */
export function isEmbeddingsAvailable(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key';
}
