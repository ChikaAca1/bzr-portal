-- ============================================================================
-- BZR Portal Database Reset Script
-- ============================================================================
-- This script drops ALL existing tables and prepares for fresh schema migration
-- Run this in Supabase SQL Editor BEFORE running `npm run db:push`
-- ============================================================================

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS conversation_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS contact_form_submissions CASCADE;
DROP TABLE IF EXISTS ai_hazard_suggestions_cache CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS medical_exams CASCADE;
DROP TABLE IF EXISTS training CASCADE;
DROP TABLE IF EXISTS ppe CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS work_positions CASCADE;
DROP TABLE IF EXISTS hazard_types CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old/backup tables (from previous project)
DROP TABLE IF EXISTS referral_codes_new_backup_final CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS referrals_backup_final CASCADE;
DROP TABLE IF EXISTS referral_codes_backup_final CASCADE;
DROP TABLE IF EXISTS auth_users_backup CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS account_tier CASCADE;
DROP TYPE IF EXISTS hazard_category CASCADE;
DROP TYPE IF EXISTS ppe_category CASCADE;
DROP TYPE IF EXISTS training_type CASCADE;
DROP TYPE IF EXISTS exam_type CASCADE;
DROP TYPE IF EXISTS agent_type CASCADE;

-- Drop functions (from old project)
DROP FUNCTION IF EXISTS assign_admin_role CASCADE;
DROP FUNCTION IF EXISTS count_admins CASCADE;
DROP FUNCTION IF EXISTS rpc_assign_admin_role CASCADE;
DROP FUNCTION IF EXISTS rpc_count_admins CASCADE;
DROP FUNCTION IF EXISTS rpc_set_first_user_as_admin CASCADE;
DROP FUNCTION IF EXISTS update_last_updated CASCADE;
DROP FUNCTION IF EXISTS set_first_user_as_admin CASCADE;
DROP FUNCTION IF EXISTS search_similar_jobs CASCADE;

-- Drop vector extension (will be reinstalled in correct schema)
DROP EXTENSION IF EXISTS vector CASCADE;

-- ============================================================================
-- READY FOR FRESH MIGRATION
-- ============================================================================
-- After running this script in Supabase SQL Editor:
-- 1. Run: npm run db:push (from backend directory)
-- 2. This will create all tables from Drizzle schema
-- ============================================================================
