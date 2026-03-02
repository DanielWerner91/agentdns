-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- Agents table: the core registry
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  tagline VARCHAR(300),
  description TEXT,

  -- Owner info
  owner_id VARCHAR(200) NOT NULL,
  owner_name VARCHAR(200),
  owner_url VARCHAR(500),

  -- Agent identity
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'suspended')),

  -- Capabilities (the core of discovery)
  capabilities TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',

  -- Endpoints
  a2a_endpoint VARCHAR(500),
  mcp_server_url VARCHAR(500),
  api_endpoint VARCHAR(500),
  docs_url VARCHAR(500),

  -- A2A Agent Card (JSON)
  agent_card JSONB,

  -- Communication preferences
  protocols TEXT[] DEFAULT '{}',
  input_formats TEXT[] DEFAULT '{}',
  output_formats TEXT[] DEFAULT '{}',

  -- Trust & reputation
  is_verified BOOLEAN DEFAULT false,
  trust_score DECIMAL(3,2) DEFAULT 0.00,
  total_lookups BIGINT DEFAULT 0,

  -- Pricing hint
  pricing_model VARCHAR(50),
  pricing_details VARCHAR(500),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id VARCHAR(200) NOT NULL,
  key_hash VARCHAR(64) NOT NULL,
  key_prefix VARCHAR(12) NOT NULL,
  name VARCHAR(100) NOT NULL,
  scopes TEXT[] DEFAULT '{read}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lookup log
CREATE TABLE lookup_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  query_type VARCHAR(50) NOT NULL,
  query_params JSONB,
  requester_api_key_prefix VARCHAR(12),
  requester_ip VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX idx_agents_categories ON agents USING GIN(categories);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX idx_agents_protocols ON agents USING GIN(protocols);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_name_trgm ON agents USING GIN(name gin_trgm_ops);
CREATE INDEX idx_agents_owner ON agents(owner_id);
CREATE INDEX idx_agents_trust ON agents(trust_score DESC);
CREATE INDEX idx_agents_lookups ON agents(total_lookups DESC);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_owner ON api_keys(owner_id);
CREATE INDEX idx_lookup_log_agent ON lookup_log(agent_id);
CREATE INDEX idx_lookup_log_created ON lookup_log(created_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment lookups function
CREATE OR REPLACE FUNCTION increment_lookups(agent_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents SET total_lookups = total_lookups + 1 WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_log ENABLE ROW LEVEL SECURITY;

-- Agents: public read, owner write
CREATE POLICY "Agents are publicly readable" ON agents FOR SELECT USING (true);
CREATE POLICY "Owners can insert their agents" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update their agents" ON agents FOR UPDATE USING (true);
CREATE POLICY "Owners can delete their agents" ON agents FOR DELETE USING (true);

-- API Keys: owner only
CREATE POLICY "Users see own keys" ON api_keys FOR SELECT USING (true);
CREATE POLICY "Users create own keys" ON api_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Users manage own keys" ON api_keys FOR UPDATE USING (true);
CREATE POLICY "Users delete own keys" ON api_keys FOR DELETE USING (true);

-- Lookup log: insert-only via service role
CREATE POLICY "Service can insert lookups" ON lookup_log FOR INSERT WITH CHECK (true);
