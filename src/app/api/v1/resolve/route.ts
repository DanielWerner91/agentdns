import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateApiKey } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { resolveParamsSchema } from '@/lib/validators';

const RESOLVE_FIELDS =
  'id, slug, name, trust_score, a2a_endpoint, mcp_server_url, api_endpoint, pricing_model, capabilities, protocols';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
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
  const parsed = resolveParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { capability, protocol, limit } = parsed.data;
  const supabase = createAdminClient();

  // Split capability on comma for multi-capability queries
  const caps = capability.split(',').map((c) => c.trim()).filter(Boolean);

  let query = supabase
    .from('agents')
    .select(RESOLVE_FIELDS, { count: 'exact' })
    .eq('status', 'active')
    .overlaps('capabilities', caps)
    .order('trust_score', { ascending: false })
    .order('total_lookups', { ascending: false })
    .limit(limit);

  if (protocol) {
    query = query.contains('protocols', [protocol]);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to resolve agents' } },
      { status: 500 }
    );
  }

  // Increment lookups for all matched agents (fire-and-forget)
  if (data && data.length > 0) {
    for (const agent of data) {
      supabase.rpc('increment_lookups', { agent_uuid: agent.id }).then(() => {});
    }
  }

  // Log the resolution
  supabase
    .from('lookup_log')
    .insert({
      query_type: 'resolve_capability',
      query_params: rawParams,
      requester_api_key_prefix: auth.keyPrefix ?? null,
      requester_ip: ip,
    })
    .then(() => {});

  return NextResponse.json(
    {
      matches: data ?? [],
      query: { capability, ...(protocol ? { protocol } : {}) },
      total: count ?? 0,
    },
    { headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
  );
}
