import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

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
    .from('agents')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Failed to fetch agents' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
