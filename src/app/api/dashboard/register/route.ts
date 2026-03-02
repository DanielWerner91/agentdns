import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAgentSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sign in required' } },
      { status: 401 }
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
      owner_id: session.user.id,
      owner_name: session.user.name ?? null,
    })
    .select()
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

  return NextResponse.json({ data }, { status: 201 });
}
