/**
 * Import from the official modelcontextprotocol/servers GitHub repo README.
 * These are high-quality, officially maintained integrations.
 *
 * Usage: npx tsx scripts/import-official-mcp.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { autoTagCapabilities } from './lib/auto-tagger';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const README_URL = 'https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md';
const BATCH_SIZE = 50;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function parseReadme(content: string) {
  const entries: { name: string; url: string; description: string; section: string }[] = [];
  let currentSection = '';

  for (const line of content.split('\n')) {
    const secMatch = line.match(/^#+\s+(.+)/);
    if (secMatch) { currentSection = secMatch[1].trim(); continue; }

    // Match: - **[Name](url)** — Description  OR  - [Name](url) - Description
    const boldMatch = line.match(/^[-*]\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[—–-]\s*(.+)/);
    const plainMatch = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)\s*[—–-]\s*(.+)/);
    const match = boldMatch || plainMatch;
    if (!match) continue;

    const name = match[1].trim();
    const rawUrl = match[2].trim();
    const description = match[3].trim().replace(/\.$/, '');

    if (description.length < 5) continue;
    if (rawUrl.startsWith('#')) continue;

    entries.push({ name, url: rawUrl, description, section: currentSection });
  }

  return entries;
}

async function run() {
  console.log('Official MCP Servers Import');
  console.log('============================');

  process.stdout.write('Fetching README...');
  const res = await fetch(README_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const content = await res.text();
  console.log(` ${content.length} bytes`);

  const entries = parseReadme(content);
  console.log(`Parsed ${entries.length} entries`);

  const { data: existing } = await supabase.from('agents').select('slug');
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  console.log(`Existing agents in DB: ${existingSlugs.size}`);

  let toInsert: Record<string, unknown>[] = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of entries) {
    // Try "official-{slug}" prefix for official servers to avoid collisions
    const baseSlug = slugify(entry.name);
    if (!baseSlug || baseSlug.length < 2) continue;

    // Use base slug, fall back to official- prefix if collision
    const slug = existingSlugs.has(baseSlug) ? `official-${baseSlug}` : baseSlug;
    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }
    existingSlugs.add(slug);

    const capabilities = autoTagCapabilities(entry.name, entry.description);
    const metadata = {
      source: 'mcp-official-servers',
      source_url: entry.url,
      official_section: entry.section,
    };

    // Determine if URL is a direct endpoint or a repo
    const isEndpoint = !entry.url.includes('github.com') && !entry.url.includes('npmjs.com')
      && (entry.url.startsWith('http') && !entry.url.includes('/tree/') && !entry.url.includes('/blob/'));

    const agent = {
      slug,
      name: entry.name,
      tagline: entry.description.substring(0, 300),
      description: `${entry.description}\n\nFrom the official MCP servers collection maintained by the Model Context Protocol team.`,
      capabilities,
      categories: [] as string[],
      protocols: ['mcp'],
      mcp_server_url: isEndpoint ? entry.url : null,
      docs_url: entry.url,
      listing_type: 'community',
      owner_id: 'community',
      owner_name: 'AgentDNS Community',
      status: 'active',
      metadata,
      trust_score: 0,
    };
    agent.trust_score = computeInitialTrustScore(agent);
    toInsert.push(agent);

    if (toInsert.length >= BATCH_SIZE) {
      const { error } = await supabase.from('agents').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) { console.error('\nBatch error:', error.message); errors += toInsert.length; }
      else { inserted += toInsert.length; process.stdout.write('.'); }
      toInsert = [];
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('agents').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { console.error('\nFinal batch error:', error.message); errors += toInsert.length; }
    else inserted += toInsert.length;
  }

  console.log('\n\n--- Results ---');
  console.log(`Parsed:   ${entries.length}`);
  console.log(`Skipped:  ${skipped} (already in DB)`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Errors:   ${errors}`);
}

run().catch(console.error);
