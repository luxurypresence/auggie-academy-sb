-- UP Migration: Create tasks table
-- This migration creates the tasks table with support for manual tasks, AI-suggested tasks, and dismissed tasks
-- Run this migration: psql -d crm_db -f src/migrations/20251022-create-tasks-table.sql

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "dueDate" TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_suggested', 'dismissed')),
  "aiReasoning" TEXT,
  "leadId" INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks("leadId");
CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Verify table creation
\d tasks

-- DOWN Migration (for rollback)
-- Uncomment and run to rollback:
-- DROP INDEX IF EXISTS idx_tasks_completed;
-- DROP INDEX IF EXISTS idx_tasks_source;
-- DROP INDEX IF EXISTS idx_tasks_lead_id;
-- DROP TABLE IF EXISTS tasks;
