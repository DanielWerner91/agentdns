import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BLOG_POSTS } from '@/content/blog/posts';

export const metadata: Metadata = {
  title: 'Blog — AgentDNS',
  description: 'Guides, tutorials, and insights on AI agent discovery, registration, and the MCP ecosystem.',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-muted">Guides and insights on AI agent discovery and the MCP ecosystem.</p>
        </div>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-surface border border-border rounded-xl p-6 hover:border-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 text-xs text-muted mb-3">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>&middot;</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="text-muted text-sm leading-relaxed">{post.description}</p>
              <div className="mt-4 text-sm text-accent font-medium flex items-center gap-1">
                Read more
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
