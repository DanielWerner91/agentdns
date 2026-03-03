import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sign in required' } },
      { status: 401 }
    );
  }

  const rateLimit = checkRateLimit(`claim:${session.user.id}`, 'write');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many requests' } },
      { status: 429, headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt) }
    );
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Get the agent — must be community-listed
  const { data: agent, error: fetchError } = await supabase
    .from('agents')
    .select('id, slug, listing_type, owner_id, status')
    .eq('id', id)
    .single();

  if (fetchError || !agent) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Agent not found' } },
      { status: 404 }
    );
  }

  if (agent.status !== 'active') {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Agent is not active' } },
      { status: 403 }
    );
  }

  // Only community-listed agents (owner_id === 'community') can be claimed
  if (agent.owner_id !== 'community' && agent.listing_type !== 'community') {
    return NextResponse.json(
      { error: { code: 'conflict', message: 'This agent is already owned' } },
      { status: 409 }
    );
  }

  // Transfer ownership
  const { data: updated, error: updateError } = await supabase
    .from('agents')
    .update({
      owner_id: session.user.id,
      owner_name: session.user.name ?? null,
      listing_type: 'verified',
    })
    .eq('id', id)
    .select('id, slug, name, listing_type')
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to claim agent' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated });
}
