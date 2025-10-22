-- Migration: Add score_calculated_at column to leads table
-- Date: 2025-10-22
-- Description: Add timestamp field to track when activity score was last calculated

-- ============================================
-- UP MIGRATION
-- ============================================

-- Add score_calculated_at column
ALTER TABLE leads
ADD COLUMN score_calculated_at TIMESTAMP NULL;

-- For existing leads with activity_score, set score_calculated_at to current time
UPDATE leads
SET score_calculated_at = NOW()
WHERE activity_score IS NOT NULL;

-- Create index for query performance (optional but recommended)
CREATE INDEX idx_leads_score_calculated_at ON leads(score_calculated_at);

-- Add comment for documentation
COMMENT ON COLUMN leads.score_calculated_at IS 'Timestamp when activity score was last calculated';

-- ============================================
-- DOWN MIGRATION (Rollback)
-- ============================================

-- To rollback this migration, execute:
-- DROP INDEX IF EXISTS idx_leads_score_calculated_at;
-- ALTER TABLE leads DROP COLUMN score_calculated_at;
