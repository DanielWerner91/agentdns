import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { BLOG_POSTS } from '@/content/blog/posts';

const BASE_URL = 'https://agent-dns.tech';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Fetch all active agent slugs
  const { data: agents } = await supabase
    .from('agents')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  const agentUrls: MetadataRoute.Sitemap = (agents ?? []).map((a) => ({
    url: `${BASE_URL}/agent/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/standards/well-known-agents`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/integrations/github-action`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  return [...staticUrls, ...blogUrls, ...agentUrls];
}
