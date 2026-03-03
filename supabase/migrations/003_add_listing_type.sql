-- Add listing_type column to agents table
-- 'verified' = owner registered via GitHub OAuth
-- 'community' = listed by AgentDNS community team (not owner-verified)

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) NOT NULL DEFAULT 'verified'
    CHECK (listing_type IN ('verified', 'community'));

-- Index for filtering by listing_type
CREATE INDEX IF NOT EXISTS idx_agents_listing_type ON agents (listing_type);

-- Backfill: seed agents have owner_id = 'community'
UPDATE agents SET listing_type = 'community' WHERE owner_id = 'community';
