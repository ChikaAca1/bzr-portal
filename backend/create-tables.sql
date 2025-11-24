-- ============================================================================
-- BZR Portal - Complete Database Schema
-- ============================================================================
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================================

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'bzr_officer', 'hr_manager', 'viewer');
CREATE TYPE account_tier AS ENUM ('trial', 'verified', 'premium');
CREATE TYPE hazard_category AS ENUM ('physical', 'chemical', 'biological', 'ergonomic', 'psychosocial');
CREATE TYPE ppe_category AS ENUM ('head', 'eyes', 'ears', 'respiratory', 'hands', 'feet', 'body', 'fall_protection');
CREATE TYPE training_type AS ENUM ('initial', 'refresher', 'specialized');
CREATE TYPE exam_type AS ENUM ('pre_employment', 'periodic', 'extraordinary');
CREATE TYPE agent_type AS ENUM ('sales', 'document', 'help');

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  role user_role DEFAULT 'viewer' NOT NULL,
  company_id INTEGER,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  account_tier account_tier DEFAULT 'trial' NOT NULL,
  trial_expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP
);

-- ============================================================================
-- Companies Table
-- ============================================================================
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  pib VARCHAR(9) NOT NULL,
  maticni_broj VARCHAR(8),
  activity_code VARCHAR(4) NOT NULL,
  activity_description TEXT,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  phone VARCHAR(50),
  email VARCHAR(255),
  director VARCHAR(255) NOT NULL,
  director_jmbg VARCHAR(255),
  bzr_responsible_person VARCHAR(255) NOT NULL,
  bzr_responsible_jmbg VARCHAR(255),
  employee_count VARCHAR(10),
  organization_chart TEXT,
  account_tier account_tier DEFAULT 'trial' NOT NULL,
  trial_expiry_date TIMESTAMP,
  document_generation_count INTEGER DEFAULT 0 NOT NULL,
  work_position_count INTEGER DEFAULT 0 NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP
);

-- ============================================================================
-- Hazard Types Table
-- ============================================================================
CREATE TABLE hazard_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name_sr VARCHAR(500) NOT NULL,
  name_en VARCHAR(500),
  category hazard_category NOT NULL,
  description TEXT,
  typical_measures TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Work Positions Table
-- ============================================================================
CREATE TABLE work_positions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  employee_count INTEGER,
  workplace_description TEXT,
  work_process_description TEXT,
  equipment_description TEXT,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP
);

-- ============================================================================
-- Risk Assessments Table
-- ============================================================================
CREATE TABLE risk_assessments (
  id SERIAL PRIMARY KEY,
  position_id INTEGER NOT NULL REFERENCES work_positions(id) ON DELETE CASCADE,
  hazard_id INTEGER NOT NULL REFERENCES hazard_types(id),
  ei INTEGER NOT NULL CHECK (ei BETWEEN 1 AND 5),
  pi INTEGER NOT NULL CHECK (pi BETWEEN 1 AND 5),
  fi INTEGER NOT NULL CHECK (fi BETWEEN 1 AND 5),
  e INTEGER CHECK (e BETWEEN 1 AND 5),
  p INTEGER CHECK (p BETWEEN 1 AND 5),
  f INTEGER CHECK (f BETWEEN 1 AND 5),
  corrective_measures TEXT,
  deadline DATE,
  responsible_person VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PPE Table
-- ============================================================================
CREATE TABLE ppe (
  id SERIAL PRIMARY KEY,
  position_id INTEGER NOT NULL REFERENCES work_positions(id) ON DELETE CASCADE,
  category ppe_category NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  standard VARCHAR(100),
  quantity INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Training Table
-- ============================================================================
CREATE TABLE training (
  id SERIAL PRIMARY KEY,
  position_id INTEGER NOT NULL REFERENCES work_positions(id) ON DELETE CASCADE,
  training_type training_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  duration_hours INTEGER,
  frequency_months INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Medical Exams Table
-- ============================================================================
CREATE TABLE medical_exams (
  id SERIAL PRIMARY KEY,
  position_id INTEGER NOT NULL REFERENCES work_positions(id) ON DELETE CASCADE,
  exam_type exam_type NOT NULL,
  description TEXT,
  frequency_months INTEGER,
  required_by_law BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Sessions Table
-- ============================================================================
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- AI Cache Table
-- ============================================================================
CREATE TABLE ai_hazard_suggestions_cache (
  id SERIAL PRIMARY KEY,
  position_title VARCHAR(255) NOT NULL,
  activity_code VARCHAR(4),
  suggestions JSONB NOT NULL,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP
);

-- ============================================================================
-- Contact Form Submissions Table
-- ============================================================================
CREATE TABLE contact_form_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  message TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- ============================================================================
-- Conversations Table
-- ============================================================================
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  agent_type agent_type NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Conversation Messages Table
-- ============================================================================
CREATE TABLE conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_work_positions_company_id ON work_positions(company_id);
CREATE INDEX idx_risk_assessments_position_id ON risk_assessments(position_id);
CREATE INDEX idx_risk_assessments_hazard_id ON risk_assessments(hazard_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_id ON sessions(token_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);

-- ============================================================================
-- Success! All tables created.
-- ============================================================================
