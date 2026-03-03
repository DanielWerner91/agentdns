import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateAgentSchema } from '@/lib/validators';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const supabase = createAdminClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from('agents')
    .select('id, owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== session.user.id) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Not your agent' } },
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
    .eq('id', id)
    .select('id, slug, name, tagline, status, capabilities, categories, protocols, is_verified, trust_score, total_lookups, pricing_model, a2a_endpoint, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: { code: 'conflict', message: 'Slug already exists' } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to update agent' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sign in required' } },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(`dashboard:${session.user.id}`, 'write');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many requests' } },
      { status: 429, headers: getRateLimitHeaders(rl.remaining, rl.resetAt) }
    );
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('agents')
    .select('id, owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== session.user.id) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Not your agent' } },
      { status: 403 }
    );
  }

  await supabase
    .from('agents')
    .update({ status: 'inactive' })
    .eq('id', id);

  return NextResponse.json({ data: { message: 'Agent deactivated' } });
}
