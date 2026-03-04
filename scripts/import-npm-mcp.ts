/**
 * Import MCP servers from npm registry.
 * Searches for packages with keyword "mcp-server" and imports them.
 *
 * Usage: npx tsx scripts/import-npm-mcp.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { autoTagCapabilities } from './lib/auto-tagger';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const BATCH_SIZE = 50;
const PAGE_SIZE = 250;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

interface NpmPackage {
  package: {
    name: string;
    version: string;
    description?: string;
    keywords?: string[];
    links?: {
      npm?: string;
      homepage?: string;
      repository?: string;
      bugs?: string;
    };
    publisher?: { username: string; email?: string };
    maintainers?: Array<{ username: string }>;
    date: string;
  };
  score?: {
    final?: number;
    detail?: {
      quality?: number;
      popularity?: number;
      maintenance?: number;
    };
  };
}

async function run() {
  console.log('npm MCP Server Import');
  console.log('=====================');

  // Fetch existing slugs
  const { data: existing } = await supabase.from('agents').select('slug').limit(20000);
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  console.log(`Existing agents: ${existingSlugs.size}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  let from = 0;
  let batch: Record<string, unknown>[] = [];

  while (true) {
    const url = `https://registry.npmjs.org/-/v1/search?text=keywords:mcp-server&size=${PAGE_SIZE}&from=${from}`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`npm API error: ${res.status}`); break; }
    const data = await res.json() as { objects: NpmPackage[]; total: number };

    if (from === 0) console.log(`Total npm packages found: ${data.total}`);
    if (!data.objects?.length) break;

    for (const obj of data.objects) {
      const pkg = obj.package;
      const description = pkg.description ?? `${pkg.name} - MCP server package`;
      if (description.length < 5) { skipped++; continue; }

      const slug = slugify(pkg.name);
      if (!slug || slug.length < 2 || existingSlugs.has(slug)) { skipped++; continue; }
      existingSlugs.add(slug);

      // Build a nice display name from package name
      const name = pkg.name
        .replace(/^@[^/]+\//, '') // remove scope
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/^Mcp Server /, '')
        .replace(/ Mcp$/, '');

      const capabilities = autoTagCapabilities(pkg.name + ' ' + name, description + ' ' + (pkg.keywords ?? []).join(' '));
      const repoUrl = pkg.links?.repository ?? pkg.links?.homepage ?? pkg.links?.npm ?? '';
      const npmUrl = pkg.links?.npm ?? `https://www.npmjs.com/package/${pkg.name}`;
      const isGitHub = repoUrl.includes('github.com');

      // Trust score bonus from npm score
      const npmQuality = obj.score?.detail?.quality ?? 0;
      const npmPopularity = obj.score?.detail?.popularity ?? 0;

      const agent: Record<string, unknown> = {
        slug,
        name: name.substring(0, 200),
        tagline: description.substring(0, 300),
        description: description.substring(0, 2000),
        capabilities,
        categories: [],
        protocols: ['mcp'],
        mcp_server_url: npmUrl,
        api_endpoint: null,
        a2a_endpoint: null,
        docs_url: isGitHub ? repoUrl : npmUrl,
        listing_type: 'community',
        owner_id: 'community',
        owner_name: pkg.publisher?.username ?? 'AgentDNS Community',
        status: 'active',
        source: 'npm-registry',
        metadata: {
          source: 'npm-registry',
          npm_package: pkg.name,
          npm_version: pkg.version,
          npm_url: npmUrl,
          source_url: repoUrl || null,
          npm_quality: npmQuality,
          npm_popularity: npmPopularity,
          keywords: pkg.keywords ?? [],
          last_published: pkg.date,
        },
        trust_score: 0,
      };

      agent.trust_score = computeInitialTrustScore({
        description: agent.description as string,
        tagline: agent.tagline as string,
        capabilities: agent.capabilities as string[],
        mcp_server_url: agent.mcp_server_url as string,
        docs_url: agent.docs_url as string | null,
        listing_type: agent.listing_type as string,
        metadata: agent.metadata as Record<string, unknown>,
      });

      // npm quality bonus
      if (npmPopularity > 0.01) (agent.trust_score as number) + 0.03;
      if (npmPopularity > 0.05) (agent.trust_score as number) + 0.05;
      agent.trust_score = parseFloat(Math.min(0.99, agent.trust_score as number).toFixed(2));

      batch.push(agent);

      if (batch.length >= BATCH_SIZE) {
        const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
        if (error) { console.error('Batch error:', error.message); errors++; }
        else { inserted += batch.length; }
        process.stdout.write(inserted % 250 === 0 ? `\n${inserted}` : '.');
        batch = [];
      }
    }

    from += PAGE_SIZE;
    if (data.objects.length < PAGE_SIZE) break;
    await new Promise(r => setTimeout(r, 200));
  }

  if (batch.length > 0) {
    const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { console.error('Final batch error:', error.message); errors++; }
    else inserted += batch.length;
  }

  console.log('\n\n--- Results ---');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
}

run().catch(console.error);
