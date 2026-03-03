import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateApiKey } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { searchParamsSchema, createAgentSchema } from '@/lib/validators';

// Escape PostgREST special characters in user input for safe .or() interpolation
function sanitizeForPostgrest(input: string): string {
  return input.replace(/[%_\\,.()"']/g, (ch) => `\\${ch}`);
}

const AGENT_LIST_FIELDS =
  'id, slug, name, tagline, listing_type, capabilities, categories, protocols, is_verified, trust_score, total_lookups, pricing_model, a2a_endpoint, created_at';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const auth = await validateApiKey(request.headers.get('authorization'));
  const tier = auth.valid ? 'authenticated' : 'public';
  const rateLimit = checkRateLimit(auth.valid ? auth.keyPrefix! : ip, tier);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many requests' } },
      { status: 429, headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
    );
  }

  const url = new URL(request.url);
  const rawParams = Object.fromEntries(url.searchParams.entries());
  const parsed = searchParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { q, capability, category, protocol, status, verified, sort, page, limit } = parsed.data;
  const offset = (page - 1) * limit;
  const supabase = createAdminClient();

  let query = supabase.from('agents').select(AGENT_LIST_FIELDS, { count: 'exact' });

  // Status filter
  query = query.eq('status', status);

  // Full-text search (sanitize to prevent PostgREST filter injection)
  if (q) {
    const safeQ = sanitizeForPostgrest(q);
    query = query.or(`name.ilike.%${safeQ}%,tagline.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
  }

  // Capability filter (comma-separated for OR — match any)
  if (capability) {
    const caps = capability.split(',').map((c) => c.trim()).filter(Boolean);
    query = query.overlaps('capabilities', caps);
  }

  // Category filter
  if (category) {
    query = query.contains('categories', [category]);
  }

  // Protocol filter
  if (protocol) {
    query = query.contains('protocols', [protocol]);
  }

  // Verified filter
  if (verified) {
    query = query.eq('is_verified', true);
  }

  // Sorting
  switch (sort) {
    case 'trust':
      query = query.order('trust_score', { ascending: false });
      break;
    case 'lookups':
      query = query.order('total_lookups', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      // relevance: trust_score as default ranking
      query = query.order('trust_score', { ascending: false }).order('total_lookups', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to fetch agents' } },
      { status: 500 }
    );
  }

  // Log the search query
  const logClient = createAdminClient();
  void logClient
    .from('lookup_log')
    .insert({
      query_type: 'search',
      query_params: rawParams,
      requester_api_key_prefix: auth.keyPrefix ?? null,
      requester_ip: ip,
    });

  return NextResponse.json(
    { agents: data, total: count ?? 0, page, limit },
    { headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const auth = await validateApiKey(request.headers.get('authorization'));

  if (!auth.valid) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Valid API key required' } },
      { status: 401 }
    );
  }

  if (!auth.scopes?.includes('write')) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'API key requires write scope' } },
      { status: 403 }
    );
  }

  const rateLimit = checkRateLimit(auth.keyPrefix!, 'write');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many requests' } },
      { status: 429, headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Request body must be valid JSON' } },
      { status: 400 }
    );
  }

  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('agents')
    .insert({
      ...parsed.data,
      owner_id: auth.ownerId!,
    })
    .select(AGENT_LIST_FIELDS)
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: { code: 'conflict', message: 'An agent with this slug already exists' } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to create agent' } },
      { status: 500 }
    );
  }

  // Log the registration
  void supabase
    .from('lookup_log')
    .insert({
      agent_id: data.id,
      query_type: 'register',
      query_params: { slug: parsed.data.slug },
      requester_api_key_prefix: auth.keyPrefix ?? null,
      requester_ip: ip,
    });

  return NextResponse.json(
    { data },
    { status: 201, headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
  );
}
