import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateApiKey } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { updateAgentSchema } from '@/lib/validators';

// UUID v4 pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

// Public agent detail fields (excludes owner_id for privacy)
const AGENT_DETAIL_FIELDS =
  'id, slug, name, tagline, description, owner_name, owner_url, version, status, capabilities, categories, a2a_endpoint, mcp_server_url, api_endpoint, docs_url, agent_card, protocols, input_formats, output_formats, is_verified, trust_score, total_lookups, pricing_model, pricing_details, tags, metadata, created_at, updated_at';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const supabase = createAdminClient();

  // Look up by UUID or slug
  const query = isUUID(id)
    ? supabase.from('agents').select(AGENT_DETAIL_FIELDS).eq('id', id).single()
    : supabase.from('agents').select(AGENT_DETAIL_FIELDS).eq('slug', id).single();

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  // Increment lookups (fire-and-forget)
  supabase.rpc('increment_lookups', { agent_uuid: data.id }).then(() => {});

  // Log the resolution
  supabase
    .from('lookup_log')
    .insert({
      agent_id: data.id,
      query_type: 'resolve_id',
      query_params: { id },
      requester_api_key_prefix: auth.keyPrefix ?? null,
      requester_ip: ip,
    })
    .then(() => {});

  return NextResponse.json(
    { data },
    { headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await validateApiKey(request.headers.get('authorization'));

  if (!auth.valid) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Valid API key required' } },
      { status: 401 }
    );
  }

  if (!auth.scopes?.includes('write') && !auth.scopes?.includes('admin')) {
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

  // Verify ownership
  const supabase = createAdminClient();
  const lookup = isUUID(id)
    ? supabase.from('agents').select('id, owner_id').eq('id', id).single()
    : supabase.from('agents').select('id, owner_id').eq('slug', id).single();

  const { data: existing, error: lookupError } = await lookup;

  if (lookupError || !existing) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  if (existing.owner_id !== auth.ownerId) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'You can only update your own agents' } },
      { status: 403 }
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

  const parsed = updateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('agents')
    .update(parsed.data)
    .eq('id', existing.id)
    .select(AGENT_DETAIL_FIELDS)
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: { code: 'conflict', message: 'An agent with this slug already exists' } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to update agent' } },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data },
    { headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await validateApiKey(request.headers.get('authorization'));

  if (!auth.valid) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Valid API key required' } },
      { status: 401 }
    );
  }

  if (!auth.scopes?.includes('write') && !auth.scopes?.includes('admin')) {
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

  // Verify ownership
  const supabase = createAdminClient();
  const lookup = isUUID(id)
    ? supabase.from('agents').select('id, owner_id').eq('id', id).single()
    : supabase.from('agents').select('id, owner_id').eq('slug', id).single();

  const { data: existing, error: lookupError } = await lookup;

  if (lookupError || !existing) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  if (existing.owner_id !== auth.ownerId) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'You can only delete your own agents' } },
      { status: 403 }
    );
  }

  // Soft delete — set status to inactive
  const { error } = await supabase
    .from('agents')
    .update({ status: 'inactive' })
    .eq('id', existing.id);

  if (error) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to delete agent' } },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: { message: 'Agent deactivated' } },
    { headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
  );
}
