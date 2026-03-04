/**
 * Backfill categories for all agents based on their capabilities array
 * and keyword matching in name/tagline/description.
 *
 * Usage: npx tsx scripts/backfill-categories.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

// Capability tag → category mappings (priority order matters — first match wins per category)
const CAP_TO_CATS: [string[], string[]][] = [
  // Data & Analytics
  [['database','sql','nosql','vector-search','data-extraction','analytics','bigquery'], ['data']],
  [['web-scraping','web-search','research'], ['data']],
  [['rag'], ['data','engineering']],

  // Engineering (AI/ML, code, dev tools)
  [['ai-ml','llm','orchestration','agent-framework'], ['engineering']],
  [['code-generation','code-review','debugging','testing'], ['engineering']],
  [['nlp','summarization','classification','ocr','document-analysis','translation'], ['engineering']],
  [['monitoring'], ['engineering']],

  // Version control → developer-tools AND engineering
  [['version-control','github','gitlab'], ['developer-tools','engineering']],

  // Developer Tools
  [['browser-automation','webdriver'], ['developer-tools']],
  [['file-management','developer-tools'], ['developer-tools']],

  // Infrastructure / DevOps
  [['infrastructure','devops','deployment','cloud','aws','gcp','azure','cloudflare'], ['infrastructure']],

  // Productivity / Automation
  [['automation','workflow','integration'], ['productivity']],
  [['project-management','issue-tracking','task-management'], ['productivity']],
  [['scheduling','calendar','knowledge-management'], ['productivity']],
  [['caching'], ['infrastructure']],

  // Finance
  [['financial-data','finance','payments','commerce'], ['finance']],

  // Content / Media
  [['image-generation','video','music','voice-synthesis','tts'], ['content']],
  [['computer-vision'], ['content','engineering']],
  [['news'], ['content']],

  // Communication / Support
  [['communication','messaging','email','sms'], ['support']],

  // Sales & CRM
  [['crm','sales'], ['sales']],
  [['social-media'], ['sales','content']],

  // Security
  [['authentication','security'], ['security']],

  // Healthcare
  [['healthcare'], ['healthcare']],

  // Design / Creative
  [['design','ui-ux','3d-modeling','creative'], ['design-creative']],

  // Geolocation → infrastructure/data
  [['geolocation','maps'], ['data']],
];

// Keyword → categories for name/tagline/description text
const TEXT_RULES: [RegExp, string[]][] = [
  [/\b(legal|law|contract|compliance|gdpr|attorney|court|regulation)\b/i, ['legal']],
  [/\b(educat|learn|tutor|course|student|teach|school|quiz|exam)\b/i, ['education']],
  [/\b(ecommerce|e-commerce|shopify|woocommerce|retail|product.?catalog)\b/i, ['sales','finance']],
  [/\b(medical|clinical|patient|diagnosis|health|hospital|doctor|ehr|fhir)\b/i, ['healthcare']],
  [/\b(travel|hotel|flight|booking|airbnb|expedia|trip)\b/i, ['content']],
  [/\b(music|spotify|playlist|audio|podcast)\b/i, ['content']],
  [/\b(recipe|food|cook|restaurant|meal)\b/i, ['content']],
  [/\b(real.?estate|property|mortgage|zillow)\b/i, ['finance']],
  [/\b(news|article|journalism|blog|rss|feed)\b/i, ['content']],
  [/\b(game|gaming|unity|unreal|3d|blender)\b/i, ['design-creative','content']],
];

function deriveCategories(agent: {
  capabilities: string[];
  name: string;
  tagline?: string | null;
  description?: string | null;
}): string[] {
  const cats = new Set<string>();

  // 1. Map capabilities
  const capSet = new Set(agent.capabilities ?? []);
  for (const [caps, assignedCats] of CAP_TO_CATS) {
    if (caps.some(c => capSet.has(c))) {
      for (const cat of assignedCats) cats.add(cat);
    }
  }

  // 2. Keyword-match text
  const text = `${agent.name} ${agent.tagline ?? ''} ${agent.description ?? ''}`;
  for (const [pattern, assignedCats] of TEXT_RULES) {
    if (pattern.test(text)) {
      for (const cat of assignedCats) cats.add(cat);
    }
  }

  return Array.from(cats);
}

async function run() {
  console.log('Category Backfill');
  console.log('=================');

  // Fetch all agents (paginate in chunks of 1000)
  let updated = 0;
  let kept = 0;
  let errors = 0;
  let offset = 0;
  const CHUNK = 1000;

  while (true) {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, slug, name, tagline, description, capabilities, categories')
      .order('id')
      .range(offset, offset + CHUNK - 1);

    if (error) { console.error('DB error:', error.message); process.exit(1); }
    if (!agents || agents.length === 0) break;

    const batch: { id: string; categories: string[] }[] = [];

    for (const agent of agents) {
      const newCats = deriveCategories(agent as {
        capabilities: string[];
        name: string;
        tagline?: string | null;
        description?: string | null;
      });

      // Skip if new cats would be empty (keep existing) or identical to current
      const existing = (agent.categories ?? []) as string[];
      if (newCats.length === 0) { kept++; continue; }

      const existingSorted = [...existing].sort().join(',');
      const newSorted = [...newCats].sort().join(',');
      if (existingSorted === newSorted) { kept++; continue; }

      batch.push({ id: agent.id as string, categories: newCats });
    }

    // Update in batch using individual updates (Supabase doesn't support bulk conditional update)
    for (const item of batch) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({ categories: item.categories })
        .eq('id', item.id);
      if (updateError) { errors++; } else { updated++; }
    }

    process.stdout.write(`\rProcessed ${offset + agents.length} agents — updated: ${updated}, kept: ${kept}, errors: ${errors}`);
    offset += CHUNK;
    if (agents.length < CHUNK) break;
  }

  console.log('\n');
  console.log('--- Results ---');
  console.log(`Updated: ${updated}`);
  console.log(`Kept:    ${kept}`);
  console.log(`Errors:  ${errors}`);
}

run().catch(console.error);
