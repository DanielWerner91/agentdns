import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateApiKey, hashApiKey } from '@/lib/api-keys';
import { createApiKeySchema } from '@/lib/validators';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const MAX_KEYS_PER_USER = 10;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sign in required' } },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, scopes, last_used_at, expires_at, is_active, created_at')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to fetch API keys' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, {
    headers: { 'Cache-Control': 'no-store, private' },
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sign in required' } },
      { status: 401 }
    );
  }

  const rateLimit = checkRateLimit(`dashboard:${session.user.id}`, 'write');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many requests' } },
      { status: 429, headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
    );
  }

  // Check per-user key count limit
  const supabaseCheck = createAdminClient();
  const { count: keyCount } = await supabaseCheck
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', session.user.id)
    .eq('is_active', true);

  if (keyCount !== null && keyCount >= MAX_KEYS_PER_USER) {
    return NextResponse.json(
      { error: { code: 'limit_exceeded', message: `Maximum ${MAX_KEYS_PER_USER} active API keys per user` } },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Invalid JSON' } },
      { status: 400 }
    );
  }

  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { key, prefix } = generateApiKey();
  const keyHash = await hashApiKey(key);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      owner_id: session.user.id,
      key_hash: keyHash,
      key_prefix: prefix,
      name: parsed.data.name,
      scopes: parsed.data.scopes,
    })
    .select('id, key_prefix, name, scopes, created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to create API key' } },
      { status: 500 }
    );
  }

  // Return the full key only this one time
  return NextResponse.json({
    data: { ...data, key },
  }, { status: 201 });
}
