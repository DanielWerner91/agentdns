-- Lock down RLS policies: remove wide-open USING(true) policies
-- The app uses the service_role key for all server-side operations (bypasses RLS),
-- so these policies govern direct access via the anon key only.
-- Goal: anon key can SELECT agents (public read), nothing else.

-- Drop all existing permissive policies
DROP POLICY IF EXISTS "Agents are publicly readable" ON agents;
DROP POLICY IF EXISTS "Owners can insert their agents" ON agents;
DROP POLICY IF EXISTS "Owners can update their agents" ON agents;
DROP POLICY IF EXISTS "Owners can delete their agents" ON agents;

DROP POLICY IF EXISTS "Users see own keys" ON api_keys;
DROP POLICY IF EXISTS "Users create own keys" ON api_keys;
DROP POLICY IF EXISTS "Users manage own keys" ON api_keys;
DROP POLICY IF EXISTS "Users delete own keys" ON api_keys;

DROP POLICY IF EXISTS "Service can insert lookups" ON lookup_log;

-- Agents: public read only via anon key, no writes
CREATE POLICY "Agents are publicly readable" ON agents
  FOR SELECT USING (true);

-- API Keys: no access via anon key (all managed via service_role)
-- No policies = no access when RLS is enabled

-- Lookup log: no access via anon key (all inserts via service_role)
-- No policies = no access when RLS is enabled
