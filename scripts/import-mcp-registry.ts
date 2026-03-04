/**
 * Import from the official MCP Registry (registry.modelcontextprotocol.io)
 * Paginates through all servers, imports only isLatest=true entries.
 *
 * Usage: npx tsx scripts/import-mcp-registry.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { autoTagCapabilities } from './lib/auto-tagger';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const REGISTRY_BASE = 'https://registry.modelcontextprotocol.io';
const BATCH_SIZE = 50;

function makeSlug(name: string, title?: string): string {
  // Prefer title if available
  const base = (title && title.length > 2) ? title : name;
  let slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  // Strip leading generic prefixes
  slug = slug.replace(/^(ai|io|com|org|dev|the)-/, '');
  // If slug is < 4 chars, fall back to full name
  if (slug.length < 4) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  return slug.substring(0, 60);
}

function cleanName(name: string, title?: string): string {
  if (title && title.length > 2) return title;
  // Extract the last segment after '/' and title-case it
  const parts = name.split('/');
  const last = parts[parts.length - 1];
  return last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMcp\b/g, 'MCP')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bDb\b/g, 'DB');
}

interface MCPServer {
  name: string;
  title?: string;
  description?: string;
  repository?: { url?: string };
  websiteUrl?: string;
  remotes?: Array<{ type: string; url: string }>;
  packages?: Array<{ registryType: string; identifier: string }>;
  icons?: Array<{ src: string }>;
}

interface RegistryEntry {
  server: MCPServer;
  _meta: {
    'io.modelcontextprotocol.registry/official': {
      status: string;
      isLatest: boolean;
    };
  };
}

async function fetchPage(cursor?: string): Promise<{ entries: RegistryEntry[]; nextCursor?: string }> {
  const params = new URLSearchParams({ limit: '100' });
  if (cursor) params.set('cursor', cursor);
  const res = await fetch(`${REGISTRY_BASE}/v0/servers?${params}`);
  if (!res.ok) throw new Error(`Registry API error: ${res.status}`);
  const data = await res.json() as { servers: RegistryEntry[]; metadata: { nextCursor?: string } };
  return { entries: data.servers, nextCursor: data.metadata.nextCursor };
}

async function run() {
  console.log('MCP Registry Import');
  console.log('===================');

  // Fetch all existing slugs to deduplicate
  const { data: existing } = await supabase.from('agents').select('slug').limit(20000);
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  console.log(`Existing agents in DB: ${existingSlugs.size}`);

  let cursor: string | undefined;
  let pageNum = 0;
  let totalFetched = 0;
  let totalLatest = 0;
  let toInsert: Record<string, unknown>[] = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  do {
    pageNum++;
    process.stdout.write(`  Fetching page ${pageNum}...`);
    const { entries, nextCursor } = await fetchPage(cursor);
    cursor = nextCursor;
    totalFetched += entries.length;

    for (const entry of entries) {
      const meta = entry._meta['io.modelcontextprotocol.registry/official'];
      if (!meta.isLatest || meta.status !== 'active') continue;

      totalLatest++;
      const s = entry.server;
      const slug = makeSlug(s.name, s.title);

      if (existingSlugs.has(slug)) {
        skipped++;
        continue;
      }
      existingSlugs.add(slug); // prevent duplicate slugs within this run

      const description = s.description ?? '';
      const capabilities = autoTagCapabilities(s.name, description);
      const mcpUrl = s.remotes?.[0]?.url ?? null;
      const docsUrl = s.websiteUrl ?? s.repository?.url ?? null;
      const metadata = {
        source: 'mcp-registry',
        registry_name: s.name,
        ...(s.repository?.url ? { source_url: s.repository.url } : {}),
        ...(s.icons?.[0]?.src ? { logo_url: s.icons[0].src } : {}),
      };

      const agent = {
        slug,
        name: cleanName(s.name, s.title),
        tagline: description.substring(0, 300) || null,
        description: description || null,
        capabilities,
        categories: [] as string[],
        protocols: ['mcp'],
        mcp_server_url: mcpUrl,
        docs_url: docsUrl,
        listing_type: 'community',
        owner_id: 'community',
        owner_name: 'AgentDNS Community',
        status: 'active',
        metadata,
        trust_score: 0, // will be set below
      };
      agent.trust_score = computeInitialTrustScore(agent);
      toInsert.push(agent);

      if (toInsert.length >= BATCH_SIZE) {
        const { error } = await supabase.from('agents').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
        if (error) { console.error('\n  Batch error:', error.message); errors += toInsert.length; }
        else inserted += toInsert.length;
        toInsert = [];
        process.stdout.write(` [${inserted} inserted]`);
      }
    }
    console.log(` done (${entries.length} entries, cursor: ${cursor ? 'has more' : 'end'})`);

    // Small delay between pages to be polite
    if (cursor) await new Promise(r => setTimeout(r, 200));
  } while (cursor);

  // Insert remaining
  if (toInsert.length > 0) {
    const { error } = await supabase.from('agents').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { console.error('\nFinal batch error:', error.message); errors += toInsert.length; }
    else inserted += toInsert.length;
  }

  console.log('\n--- Results ---');
  console.log(`Total fetched from registry: ${totalFetched}`);
  console.log(`Latest (active) versions:    ${totalLatest}`);
  console.log(`Skipped (already in DB):     ${skipped}`);
  console.log(`Inserted:                    ${inserted}`);
  console.log(`Errors:                      ${errors}`);
}

run().catch(console.error);
