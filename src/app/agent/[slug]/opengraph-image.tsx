import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('agents')
    .select('name, tagline, capabilities, trust_score, protocols')
    .eq('slug', params.slug)
    .single();

  const name = agent?.name ?? 'AI Agent';
  const tagline = agent?.tagline ?? 'Registered on AgentDNS';
  const caps = (agent?.capabilities ?? []).slice(0, 4);
  const score = Math.round((agent?.trust_score ?? 0) * 100);

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: AgentDNS label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            A
          </div>
          <span style={{ color: '#888', fontSize: '20px', fontWeight: 600 }}>AgentDNS</span>
        </div>

        {/* Middle: Agent info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '60px', fontWeight: 800, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1.1 }}>
            {name}
          </div>
          <div style={{ fontSize: '26px', color: '#888888', maxWidth: '850px', lineHeight: 1.4 }}>
            {tagline}
          </div>

          {/* Capabilities */}
          {caps.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
              {caps.map((cap: string) => (
                <div
                  key={cap}
                  style={{
                    background: 'rgba(124, 58, 237, 0.15)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    color: '#a78bfa',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  {cap}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: Trust score + domain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#555', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Trust Score</span>
              <span style={{ color: '#7c3aed', fontSize: '32px', fontWeight: 800 }}>{score}%</span>
            </div>
          </div>
          <div style={{ color: '#444', fontSize: '18px' }}>agent-dns.tech</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
