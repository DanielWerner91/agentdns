/**
 * Import AI agents/tools from Hugging Face Spaces.
 * Searches by tags: agent, tool, mcp-server, smolagents
 *
 * Usage: npx tsx scripts/import-huggingface.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { autoTagCapabilities } from './lib/auto-tagger';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const BATCH_SIZE = 50;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}

interface HFSpace {
  id: string; // "author/space-name"
  likes: number;
  private: boolean;
  sdk: string;
  tags: string[];
  createdAt: string;
  author?: string;
  cardData?: {
    title?: string;
    short_description?: string;
  };
  lastModified?: string;
  subdomain?: string;
}

async function fetchSpaces(filter: string, maxPages: number = 10): Promise<HFSpace[]> {
  const all: HFSpace[] = [];
  let url: string | null = `https://huggingface.co/api/spaces?filter=${filter}&sort=likes&limit=100&full=true`;

  for (let page = 0; page < maxPages && url; page++) {
    const res: Response = await fetch(url);
    if (!res.ok) { console.warn(`HF API error: ${res.status}`); break; }
    const spaces = await res.json() as HFSpace[];
    if (!spaces.length) break;
    all.push(...spaces);

    // Parse cursor from Link header
    const link = res.headers.get('link');
    if (link) {
      const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
    } else {
      url = null;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return all;
}

async function run() {
  console.log('Hugging Face Spaces Import');
  console.log('=========================');

  // Fetch existing slugs
  const { data: existing } = await supabase.from('agents').select('slug').limit(20000);
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  console.log(`Existing agents: ${existingSlugs.size}`);

  const filters = ['agent', 'mcp-server', 'smolagents', 'tool'];
  const seenIds = new Set<string>();
  let totalInserted = 0;

  for (const filter of filters) {
    console.log(`\n── Filter: ${filter} ──`);
    const spaces = await fetchSpaces(filter, 5); // 5 pages × 100 = 500 max
    console.log(`  Fetched ${spaces.length} spaces`);

    let inserted = 0;
    let skipped = 0;
    let batch: Record<string, unknown>[] = [];

    for (const space of spaces) {
      if (space.private || seenIds.has(space.id)) { skipped++; continue; }
      seenIds.add(space.id);

      if (space.likes < 3) { skipped++; continue; } // minimum quality threshold

      const parts = space.id.split('/');
      const author = parts[0];
      const spaceName = parts[1] ?? parts[0];
      const slug = slugify(`hf-${spaceName}`);

      if (!slug || slug.length < 4 || existingSlugs.has(slug)) { skipped++; continue; }
      existingSlugs.add(slug);

      const title = space.cardData?.title ?? spaceName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const shortDesc = space.cardData?.short_description ?? '';
      const description = shortDesc || `${title} - Hugging Face Space by ${author}`;
      const spaceUrl = `https://huggingface.co/spaces/${space.id}`;
      const liveUrl = space.subdomain ? `https://${space.subdomain}.hf.space` : spaceUrl;

      const isMCP = space.tags.includes('mcp-server') || space.tags.includes('mcp');
      const protocols = isMCP ? ['mcp'] : ['rest'];
      const capabilities = autoTagCapabilities(title + ' ' + spaceName, description + ' ' + space.tags.join(' '));

      const agent: Record<string, unknown> = {
        slug,
        name: title.substring(0, 200),
        tagline: description.substring(0, 300),
        description: description.substring(0, 2000),
        capabilities,
        categories: [],
        protocols,
        mcp_server_url: isMCP ? liveUrl : null,
        api_endpoint: !isMCP ? liveUrl : null,
        a2a_endpoint: null,
        docs_url: spaceUrl,
        listing_type: 'community',
        owner_id: 'community',
        owner_name: author,
        status: 'active',
        source: 'huggingface',
        metadata: {
          source: 'huggingface',
          hf_id: space.id,
          hf_likes: space.likes,
          hf_sdk: space.sdk,
          hf_tags: space.tags,
          hf_url: spaceUrl,
          hf_live_url: liveUrl,
          source_url: spaceUrl,
          last_modified: space.lastModified,
        },
        trust_score: 0,
      };

      agent.trust_score = computeInitialTrustScore({
        description: agent.description as string,
        tagline: agent.tagline as string,
        capabilities: agent.capabilities as string[],
        mcp_server_url: agent.mcp_server_url as string | null,
        api_endpoint: agent.api_endpoint as string | null,
        docs_url: agent.docs_url as string | null,
        listing_type: agent.listing_type as string,
        metadata: agent.metadata as Record<string, unknown>,
      });

      // Likes bonus
      const likesBonus = space.likes >= 100 ? 0.08 : space.likes >= 50 ? 0.05 : space.likes >= 10 ? 0.03 : 0.01;
      agent.trust_score = parseFloat(Math.min(0.99, (agent.trust_score as number) + likesBonus).toFixed(2));

      batch.push(agent);

      if (batch.length >= BATCH_SIZE) {
        const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
        if (error) console.error('Batch error:', error.message);
        else { inserted += batch.length; process.stdout.write('.'); }
        batch = [];
      }
    }

    if (batch.length > 0) {
      const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) console.error('Final batch error:', error.message);
      else inserted += batch.length;
    }

    console.log(`\n  Inserted: ${inserted}, Skipped: ${skipped}`);
    totalInserted += inserted;
  }

  console.log(`\n=== Total inserted: ${totalInserted} ===`);
}

run().catch(console.error);
