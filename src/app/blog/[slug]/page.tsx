import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BLOG_POSTS, getPost } from '@/content/blog/posts';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} — AgentDNS Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/blog" className="text-sm text-muted hover:text-accent transition-colors">
            &larr; Back to Blog
          </Link>
        </div>

        {/* Post header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-muted mb-4">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-lg text-muted">{post.description}</p>
        </header>

        {/* Post content */}
        <article
          className="
            prose prose-sm prose-invert max-w-none
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-foreground
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground
            [&_p]:text-muted [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:text-muted [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:text-muted [&_ol]:space-y-1.5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5
            [&_li]:text-muted
            [&_a]:text-accent [&_a]:no-underline [&_a:hover]:underline
            [&_code]:text-xs [&_code]:font-mono [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-foreground
            [&_pre]:bg-surface [&_pre]:border [&_pre]:border-border [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-6
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-muted
            [&_strong]:text-foreground [&_strong]:font-semibold
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Ready to register your agent?</h3>
            <p className="text-muted text-sm mb-4">Join the AgentDNS directory and make your agent discoverable.</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/register"
                className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                Register Agent
              </Link>
              <Link
                href="/explore"
                className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-accent/50 transition-colors"
              >
                Explore Directory
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
