import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GitHubImporter } from './GitHubImporter';

export const metadata: Metadata = {
  title: 'Import from GitHub — AgentDNS',
  description: 'Paste a GitHub repo URL to auto-import your AI agent into the AgentDNS registry.',
};

export default function ImportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import from GitHub</h1>
          <p className="text-muted">
            Paste your GitHub repo URL and we&apos;ll read the README, <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded">package.json</code>, and <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded">agentdns.json</code> to pre-populate your listing.
          </p>
        </div>
        <GitHubImporter />
      </main>
      <Footer />
    </div>
  );
}
