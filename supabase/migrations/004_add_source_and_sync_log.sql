-- Migration 004: Add source column to agents + create sync_log table

-- 1. Add source column
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- 2. Backfill from metadata JSONB
UPDATE agents
  SET source = metadata->>'source'
  WHERE metadata->>'source' IS NOT NULL
    AND source = 'manual';

-- 3. Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_agents_source ON agents (source);

-- 4. Create sync_log table
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  inserted INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'
);
