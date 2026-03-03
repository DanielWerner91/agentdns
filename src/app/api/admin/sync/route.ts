import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { autoTagCapabilities } from '@/lib/auto-tagger';
import { computeInitialTrustScore } from '@/lib/trust-score';

const REGISTRY_BASE = 'https://registry.modelcontextprotocol.io';
const AWESOME_README = 'https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md';

function makeSlug(name: string, title?: string): string {
  const base = (title && title.length > 2) ? title : name;
  let slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  slug = slug.replace(/^(ai|io|com|org|dev|the)-/, '');
  if (slug.length < 4) slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug.substring(0, 60);
}

function cleanName(name: string, title?: string): string {
  if (title && title.length > 2) return title;
  const last = name.split('/').pop() ?? name;
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMcp\b/g, 'MCP').replace(/\bAi\b/g, 'AI').replace(/\bApi\b/g, 'API');
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}

function parseAwesomeReadme(content: string) {
  const entries: { name: string; url: string; description: string }[] = [];
  let inServers = false;
  for (const line of content.split('\n')) {
    if (line.match(/^##\s+Server Implementations/)) { inServers = true; continue; }
    if (!inServers) continue;
    if (line.match(/^##\s+Frameworks/)) break;
    const m = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(.*)/);
    if (!m) continue;
    const rest = m[3];
    const dashIdx = rest.indexOf(' - ');
    if (dashIdx === -1) continue;
    const description = rest.slice(dashIdx + 3).trim().replace(/\.$/, '');
    if (description.length < 5 || m[2].startsWith('#')) continue;
    entries.push({ name: m[1].trim(), url: m[2].trim(), description });
  }
  return entries;
}

export async function POST(request: NextRequest) {
  // Auth check
  const secret = process.env.ADMIN_SYNC_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();

  // Log start
  const { data: logEntry } = await supabase
    .from('sync_log')
    .insert({ sync_type: 'full', started_at: startedAt })
    .select('id')
    .single();
  const logId = logEntry?.id;

  let mcpInserted = 0, mcpSkipped = 0;
  let awesomeInserted = 0, awesomeSkipped = 0;
  let errors = 0;

  // Fetch existing slugs
  const { data: existing } = await supabase.from('agents').select('slug');
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));

  // ── MCP Registry ──
  let cursor: string | undefined;
  let batch: Record<string, unknown>[] = [];

  do {
    const params = new URLSearchParams({ limit: '100' });
    if (cursor) params.set('cursor', cursor);
    const res = await fetch(`${REGISTRY_BASE}/v0/servers?${params}`);
    if (!res.ok) break;
    const data = await res.json() as {
      servers: Array<{
        server: {
          name: string; title?: string; description?: string;
          repository?: { url?: string }; websiteUrl?: string;
          remotes?: Array<{ url: string }>; icons?: Array<{ src: string }>;
        };
        _meta: { 'io.modelcontextprotocol.registry/official': { status: string; isLatest: boolean } };
      }>;
      metadata: { nextCursor?: string };
    };
    cursor = data.metadata.nextCursor;

    for (const entry of data.servers) {
      const meta = entry._meta['io.modelcontextprotocol.registry/official'];
      if (!meta.isLatest || meta.status !== 'active') continue;
      const s = entry.server;
      const slug = makeSlug(s.name, s.title);
      if (existingSlugs.has(slug)) { mcpSkipped++; continue; }
      existingSlugs.add(slug);
      const desc = s.description ?? '';
      const agent = {
        slug, name: cleanName(s.name, s.title),
        tagline: desc.substring(0, 300) || null, description: desc || null,
        capabilities: autoTagCapabilities(s.name, desc), categories: [],
        protocols: ['mcp'], mcp_server_url: s.remotes?.[0]?.url ?? null,
        docs_url: s.websiteUrl ?? s.repository?.url ?? null,
        listing_type: 'community', owner_id: 'community', owner_name: 'AgentDNS Community',
        status: 'active', source: 'mcp-registry',
        metadata: { source: 'mcp-registry', registry_name: s.name, ...(s.repository?.url ? { source_url: s.repository.url } : {}) },
        trust_score: 0,
      };
      agent.trust_score = computeInitialTrustScore({ ...agent, metadata: agent.metadata as Record<string, unknown> });
      batch.push(agent);
      if (batch.length >= 100) {
        const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
        if (error) errors += batch.length; else mcpInserted += batch.length;
        batch = [];
      }
    }
    await new Promise(r => setTimeout(r, 100));
  } while (cursor);

  if (batch.length > 0) {
    const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) errors += batch.length; else mcpInserted += batch.length;
    batch = [];
  }

  // ── Awesome MCP Servers ──
  try {
    const res = await fetch(AWESOME_README);
    if (res.ok) {
      const entries = parseAwesomeReadme(await res.text());
      for (const entry of entries) {
        const slug = slugify(entry.name);
        if (!slug || slug.length < 2 || existingSlugs.has(slug)) { awesomeSkipped++; continue; }
        existingSlugs.add(slug);
        const agent = {
          slug, name: entry.name,
          tagline: entry.description.substring(0, 300), description: entry.description,
          capabilities: autoTagCapabilities(entry.name, entry.description), categories: [],
          protocols: ['mcp'], docs_url: entry.url,
          listing_type: 'community', owner_id: 'community', owner_name: 'AgentDNS Community',
          status: 'active', source: 'awesome-mcp-servers',
          metadata: { source: 'awesome-mcp-servers', source_url: entry.url },
          trust_score: 0,
        };
        agent.trust_score = computeInitialTrustScore({ ...agent, metadata: agent.metadata as Record<string, unknown> });
        batch.push(agent);
        if (batch.length >= 100) {
          const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
          if (error) errors += batch.length; else awesomeInserted += batch.length;
          batch = [];
        }
      }
      if (batch.length > 0) {
        const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
        if (error) errors += batch.length; else awesomeInserted += batch.length;
      }
    }
  } catch { errors++; }

  // Update sync log
  const finishedAt = new Date().toISOString();
  if (logId) {
    await supabase.from('sync_log').update({
      finished_at: finishedAt,
      inserted: mcpInserted + awesomeInserted,
      skipped: mcpSkipped + awesomeSkipped,
      errors,
      details: { mcp: { inserted: mcpInserted, skipped: mcpSkipped }, awesome: { inserted: awesomeInserted, skipped: awesomeSkipped } },
    }).eq('id', logId);
  }

  return NextResponse.json({
    success: true,
    mcp_registry: { inserted: mcpInserted, skipped: mcpSkipped },
    awesome_mcp: { inserted: awesomeInserted, skipped: awesomeSkipped },
    errors,
    started_at: startedAt,
    finished_at: finishedAt,
  });
}
