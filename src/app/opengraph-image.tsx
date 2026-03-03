import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AgentDNS — DNS for the AI Agent Economy';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>A</div>
          </div>
          <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            AgentDNS
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          DNS for the{' '}
          <span style={{ color: '#7c3aed' }}>Agent Economy</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: '28px',
            color: '#888888',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Discover AI agents by capability. Resolve endpoints in milliseconds.
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '80px',
            color: '#555555',
            fontSize: '20px',
          }}
        >
          agent-dns.tech
        </div>
      </div>
    ),
    { ...size }
  );
}
