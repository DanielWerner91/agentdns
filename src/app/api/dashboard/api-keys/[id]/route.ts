import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

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
    .from('api_keys')
    .select('id, owner_id')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_id !== session.user.id) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Not your API key' } },
      { status: 403 }
    );
  }

  await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id);

  return NextResponse.json({ data: { message: 'API key revoked' } });
}
