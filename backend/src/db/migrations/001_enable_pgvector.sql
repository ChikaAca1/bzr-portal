-- Phase 3b: AI Learning & Caching System
-- Enable pgvector extension for semantic search

-- =============================================================================
-- 1. Enable pgvector extension (if not already enabled)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- 2. Create AI hazard suggestions cache table
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_hazard_suggestions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Input data
  position_name VARCHAR(255) NOT NULL,
  job_description TEXT NOT NULL,
  equipment JSONB NOT NULL,
  workspace VARCHAR(255) NOT NULL,
  work_hours JSONB NOT NULL,

  -- Semantic search (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536) NOT NULL,

  -- AI result
  suggestions JSONB NOT NULL,
  ai_provider VARCHAR(50) NOT NULL,
  confidence_avg REAL NOT NULL,

  -- Metadata
  usage_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by INTEGER
);

-- =============================================================================
-- 3. Create indexes for performance
-- =============================================================================

-- Vector similarity index using HNSW (Hierarchical Navigable Small World)
-- This enables fast approximate nearest neighbor search
-- m=16, ef_construction=64 are good defaults for most use cases
CREATE INDEX IF NOT EXISTS ai_cache_embedding_idx
ON ai_hazard_suggestions_cache
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Company ID index for multi-tenancy
CREATE INDEX IF NOT EXISTS ai_cache_company_idx
ON ai_hazard_suggestions_cache (company_id);

-- Usage tracking index
CREATE INDEX IF NOT EXISTS ai_cache_usage_idx
ON ai_hazard_suggestions_cache (usage_count DESC, last_used_at DESC);

-- =============================================================================
-- 4. Create helper function for similarity search
-- =============================================================================

CREATE OR REPLACE FUNCTION search_similar_jobs(
  query_embedding vector(1536),
  query_company_id INTEGER,
  similarity_threshold REAL DEFAULT 0.85,
  max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  position_name VARCHAR,
  job_description TEXT,
  suggestions JSONB,
  similarity REAL,
  usage_count INTEGER,
  created_at TIMESTAMP
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    id,
    position_name,
    job_description,
    suggestions,
    1 - (embedding <=> query_embedding) AS similarity,
    usage_count,
    created_at
  FROM ai_hazard_suggestions_cache
  WHERE company_id = query_company_id
    AND 1 - (embedding <=> query_embedding) >= similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT max_results;
$$;

-- =============================================================================
-- 5. Add comments for documentation
-- =============================================================================

COMMENT ON TABLE ai_hazard_suggestions_cache IS
  'Caches AI-generated hazard suggestions with semantic embeddings for similarity search';

COMMENT ON COLUMN ai_hazard_suggestions_cache.embedding IS
  'Vector embedding (1536 dims) of job description for semantic search using cosine similarity';

COMMENT ON INDEX ai_cache_embedding_idx IS
  'HNSW index for fast approximate nearest neighbor search on job description embeddings';

COMMENT ON FUNCTION search_similar_jobs IS
  'Find similar jobs using cosine similarity on embeddings (threshold default: 0.85)';
