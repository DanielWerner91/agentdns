import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  let agentsCount = 0;

  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    agentsCount = count ?? 0;
  } catch {
    // If DB is unavailable, still return health with 0 count
  }

  return NextResponse.json({
    status: 'ok',
    agents_count: agentsCount,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
