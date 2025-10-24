-- Base Tables Migration
-- Creates minimum required tables for BZR Portal

-- =============================================================================
-- 1. Companies table (for multi-tenancy)
-- =============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pib VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 2. Users table (for authentication)
-- =============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'bzr_officer', 'hr_manager', 'viewer');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'viewer' NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 3. Sessions table (for JWT refresh tokens)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(512) NOT NULL UNIQUE,
  refresh_token_expires_at TIMESTAMP NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 4. Hazard Types table (40+ hazard codes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS hazard_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name_sr VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 5. Create indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS users_company_idx ON users(company_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(refresh_token);

-- =============================================================================
-- 6. Insert a test company for development
-- =============================================================================
INSERT INTO companies (id, name, pib, address)
VALUES (1, 'Test Company', '123456789', 'Test Address')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. Comments for documentation
-- =============================================================================
COMMENT ON TABLE companies IS 'Companies using the BZR Portal (multi-tenant)';
COMMENT ON TABLE users IS 'User accounts with RBAC (admin, bzr_officer, hr_manager, viewer)';
COMMENT ON TABLE sessions IS 'JWT refresh token storage for session management';
COMMENT ON TABLE hazard_types IS 'Master list of 40+ hazard types per Serbian BZR regulations';
