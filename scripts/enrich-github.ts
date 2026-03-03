/**
 * GitHub enrichment pipeline.
 * For agents that have a GitHub URL in docs_url or metadata.source_url,
 * fetch stars, last pushed date, and language, then boost trust score.
 *
 * Usage: npx tsx scripts/enrich-github.ts [--limit 500]
 *
 * Env vars:
 *   GITHUB_TOKEN (optional but strongly recommended to avoid rate limits)
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const RATE_DELAY_MS = GITHUB_TOKEN ? 200 : 1200; // authenticated: 5000/hr, unauthenticated: 60/hr

function parseGitHubUrl(rawUrl: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.replace(/^\//, '').split('/');
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch { return null; }
}

async function fetchGitHubRepo(owner: string, repo: string): Promise<{
  stars: number; pushed_at: string; language: string | null; description: string | null;
  homepage: string | null; topics: string[];
} | null> {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (res.status === 404 || res.status === 451) return null; // not found / unavailable
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset');
      const wait = reset ? Math.max(0, parseInt(reset) * 1000 - Date.now()) + 1000 : 60000;
      console.warn(`\nRate limited. Waiting ${Math.ceil(wait / 1000)}s...`);
      await new Promise(r => setTimeout(r, wait));
      return fetchGitHubRepo(owner, repo); // retry once
    }
    return null;
  }

  const data = await res.json() as {
    stargazers_count: number; pushed_at: string; language: string | null;
    description: string | null; homepage: string | null; topics: string[];
  };
  return {
    stars: data.stargazers_count,
    pushed_at: data.pushed_at,
    language: data.language,
    description: data.description,
    homepage: data.homepage,
    topics: data.topics ?? [],
  };
}

function starBonus(stars: number): number {
  if (stars >= 1000) return 0.10;
  if (stars >= 500) return 0.08;
  if (stars >= 100) return 0.06;
  if (stars >= 50) return 0.04;
  if (stars >= 10) return 0.02;
  return 0;
}

function recencyBonus(pushedAt: string): number {
  const daysSince = (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 30) return 0.05;
  if (daysSince < 90) return 0.03;
  if (daysSince < 365) return 0.01;
  return 0;
}

async function run() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : 2000;

  console.log('GitHub Enrichment Pipeline');
  console.log('==========================');
  if (!GITHUB_TOKEN) console.warn('⚠ No GITHUB_TOKEN set — running unauthenticated (60 req/hr limit)');

  // Fetch agents that have a GitHub URL and haven't been enriched yet
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, slug, name, trust_score, docs_url, metadata, capabilities')
    .or('docs_url.ilike.%github.com%,metadata->>source_url.ilike.%github.com%')
    .is('metadata->>github_stars', null) // not yet enriched
    .order('trust_score', { ascending: false })
    .limit(limit);

  if (error) { console.error('DB error:', error.message); process.exit(1); }
  if (!agents || agents.length === 0) { console.log('No agents to enrich.'); return; }

  console.log(`Found ${agents.length} agents to enrich (limit: ${limit})`);

  let enriched = 0, skipped = 0, errors = 0;

  for (const agent of agents) {
    const githubUrl = (agent.docs_url?.includes('github.com') ? agent.docs_url : null)
      ?? (agent.metadata as Record<string, string> | null)?.source_url
      ?? null;

    if (!githubUrl) { skipped++; continue; }

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) { skipped++; continue; }

    const ghData = await fetchGitHubRepo(parsed.owner, parsed.repo);
    await new Promise(r => setTimeout(r, RATE_DELAY_MS));

    if (!ghData) { skipped++; continue; }

    // Compute new trust score: base current score + star bonus + recency bonus (capped at 0.99)
    const bonus = starBonus(ghData.stars) + recencyBonus(ghData.pushed_at);
    const newScore = parseFloat(Math.min(0.99, (agent.trust_score as number) + bonus).toFixed(2));

    // Merge new metadata
    const existingMeta = (agent.metadata as Record<string, unknown>) ?? {};
    const newMeta = {
      ...existingMeta,
      github_stars: ghData.stars,
      github_pushed_at: ghData.pushed_at,
      github_language: ghData.language,
      github_topics: ghData.topics,
    };

    // If agent has no description but GitHub does, use it
    const updates: Record<string, unknown> = { trust_score: newScore, metadata: newMeta };
    if (ghData.homepage && !agent.metadata?.mcp_server_url) {
      updates.docs_url = ghData.homepage;
    }

    const { error: updateError } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agent.id);

    if (updateError) {
      console.error(`\nError updating ${agent.slug}:`, updateError.message);
      errors++;
    } else {
      enriched++;
      process.stdout.write(enriched % 50 === 0 ? `\n${enriched}` : '.');
    }
  }

  console.log('\n\n--- Results ---');
  console.log(`Agents found: ${agents.length}`);
  console.log(`Enriched:     ${enriched}`);
  console.log(`Skipped:      ${skipped}`);
  console.log(`Errors:       ${errors}`);
}

run().catch(console.error);
