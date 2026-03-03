/**
 * Backfill trust scores for all agents that have trust_score = 0.
 * Uses completeness + source signals (no external API calls).
 *
 * Usage: npx tsx scripts/backfill-trust-scores.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const PAGE_SIZE = 500;

async function run() {
  console.log('Trust Score Backfill');
  console.log('====================');

  let offset = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  while (true) {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, description, tagline, capabilities, mcp_server_url, api_endpoint, a2a_endpoint, docs_url, listing_type, metadata, trust_score')
      .eq('trust_score', 0)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) { console.error('Fetch error:', error.message); break; }
    if (!agents || agents.length === 0) break;

    const updates: Array<{ id: string; trust_score: number }> = [];

    for (const agent of agents) {
      const score = computeInitialTrustScore(agent);
      // Only update if score has changed (or is 0)
      if (agent.trust_score !== score) {
        updates.push({ id: agent.id, trust_score: score });
      } else {
        totalSkipped++;
      }
    }

    // Update each row individually (upsert without all required fields fails)
    if (updates.length > 0) {
      let batchErrors = 0;
      for (const u of updates) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({ trust_score: u.trust_score })
          .eq('id', u.id);
        if (updateError) batchErrors++;
        else totalUpdated++;
      }
      if (batchErrors > 0) console.error(`  ${batchErrors} update errors in this batch`);
      process.stdout.write(`  Updated ${totalUpdated} agents...\r`);
    }

    offset += agents.length;
    if (agents.length < PAGE_SIZE) break;
  }

  console.log(`\nDone.`);
  console.log(`  Updated: ${totalUpdated}`);
  console.log(`  Already correct: ${totalSkipped}`);
}

run().catch(console.error);
