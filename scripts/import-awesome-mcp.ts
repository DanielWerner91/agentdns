/**
 * Import from punkpeye/awesome-mcp-servers GitHub README.
 * Parses markdown entries: - [Name](url) emoji+ - Description
 *
 * Usage: npx tsx scripts/import-awesome-mcp.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { autoTagCapabilities, categoryFromHeading } from './lib/auto-tagger';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const README_URL = 'https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md';
const BATCH_SIZE = 50;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function parseReadme(content: string) {
  const entries: { name: string; url: string; description: string; category: string }[] = [];
  let currentCategory = '';
  let inServers = false;

  for (const line of content.split('\n')) {
    // Detect when we hit "Server Implementations" section
    if (line.match(/^##\s+Server Implementations/)) { inServers = true; continue; }
    if (!inServers) continue;
    // Stop at Frameworks section
    if (line.match(/^##\s+Frameworks/)) break;

    // Category heading (### heading)
    const catMatch = line.match(/^###\s+[^\w<]*([^<\n]+?)(?:\s*<a|$)/);
    if (catMatch) {
      currentCategory = catMatch[1].trim()
        .replace(/[^\w\s&/-]/g, '') // strip emoji chars
        .trim();
      continue;
    }

    // Entry line: - [Name](url) ...stuff... - Description
    const entryMatch = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(.*)/);
    if (!entryMatch) continue;

    const name = entryMatch[1].trim();
    const rawUrl = entryMatch[2].trim();
    const rest = entryMatch[3];

    // Extract description: everything after the first " - " in rest
    const dashIdx = rest.indexOf(' - ');
    if (dashIdx === -1) continue;
    let description = rest.slice(dashIdx + 3).trim();
    // Remove trailing period
    description = description.replace(/\.$/, '');
    // Skip entries with no meaningful description
    if (description.length < 5) continue;
    // Skip non-GitHub-like URLs and internal anchors
    if (rawUrl.startsWith('#') || rawUrl.includes('badge') || rawUrl.includes('img.shields')) continue;

    entries.push({ name, url: rawUrl, description, category: currentCategory });
  }

  return entries;
}

async function run() {
  console.log('Awesome-MCP-Servers Import');
  console.log('==========================');

  // Fetch README
  process.stdout.write('Fetching README...');
  const res = await fetch(README_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const content = await res.text();
  console.log(` ${content.length} bytes`);

  // Parse entries
  const entries = parseReadme(content);
  console.log(`Parsed ${entries.length} entries`);

  // Fetch existing slugs
  const { data: existing } = await supabase.from('agents').select('slug');
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  console.log(`Existing agents in DB: ${existingSlugs.size}`);

  let toInsert: Record<string, unknown>[] = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of entries) {
    const slug = slugify(entry.name);
    if (!slug || slug.length < 2) continue;

    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }
    existingSlugs.add(slug);

    const capabilities = autoTagCapabilities(entry.name, entry.description);
    const categories = categoryFromHeading(entry.category);
    const metadata: Record<string, unknown> = {
      source: 'awesome-mcp-servers',
      source_url: entry.url,
      category_heading: entry.category,
    };

    const agent = {
      slug,
      name: entry.name,
      tagline: entry.description.substring(0, 300),
      description: entry.description,
      capabilities,
      categories,
      protocols: ['mcp'],
      mcp_server_url: null as string | null,
      docs_url: entry.url as string | null,
      listing_type: 'community',
      owner_id: 'community',
      owner_name: 'AgentDNS Community',
      status: 'active',
      metadata,
      trust_score: 0,
    };
    // Set mcp_server_url if the URL looks like an mcp endpoint (not a GitHub repo page)
    if (!entry.url.includes('github.com') && !entry.url.includes('npmjs.com')) {
      agent.mcp_server_url = entry.url;
      agent.docs_url = null;
    }
    agent.trust_score = computeInitialTrustScore(agent);
    toInsert.push(agent);

    if (toInsert.length >= BATCH_SIZE) {
      const { error } = await supabase.from('agents').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) { console.error('\nBatch error:', error.message); errors += toInsert.length; }
      else { inserted += toInsert.length; process.stdout.write(`.`); }
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
