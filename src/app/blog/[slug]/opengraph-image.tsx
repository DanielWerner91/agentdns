import { ImageResponse } from 'next/og';
import { getPost } from '@/content/blog/posts';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  const title = post?.title ?? 'AgentDNS Blog';
  const description = post?.description ?? 'Guides on AI agent discovery';

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
        {/* Top */}
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
          <span style={{ color: '#888', fontSize: '20px', fontWeight: 600 }}>AgentDNS Blog</span>
        </div>

        {/* Middle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              color: '#a78bfa',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '16px',
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            Guide
          </div>
          <div style={{ fontSize: '52px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', lineHeight: 1.15, maxWidth: '950px' }}>
            {title}
          </div>
          <div style={{ fontSize: '22px', color: '#888', maxWidth: '850px', lineHeight: 1.4 }}>
            {description}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ color: '#444', fontSize: '18px' }}>agent-dns.tech</div>
      </div>
    ),
    { ...size }
  );
}
