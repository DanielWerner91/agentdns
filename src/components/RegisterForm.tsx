'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const STEPS = [
  'Basic Info',
  'Capabilities',
  'Endpoints',
  'Communication',
  'Pricing',
  'Review',
];

const CATEGORY_OPTIONS = [
  'legal', 'finance', 'content', 'engineering', 'data',
  'support', 'sales', 'healthcare', 'education', 'security',
];

const PROTOCOL_OPTIONS = ['a2a', 'mcp', 'rest', 'graphql', 'websocket'] as const;
const INPUT_FORMAT_OPTIONS = ['text', 'json', 'pdf', 'image', 'audio'] as const;
const OUTPUT_FORMAT_OPTIONS = ['text', 'json', 'markdown', 'pdf'] as const;
const PRICING_OPTIONS = ['free', 'per-task', 'subscription', 'usage-based', 'custom'] as const;

interface FormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  capabilities: string;
  categories: string[];
  a2a_endpoint: string;
  mcp_server_url: string;
  api_endpoint: string;
  docs_url: string;
  protocols: string[];
  input_formats: string[];
  output_formats: string[];
  pricing_model: string;
  pricing_details: string;
  tags: string;
  agent_card_json: string;
}

const initialFormData: FormData = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  capabilities: '',
  categories: [],
  a2a_endpoint: '',
  mcp_server_url: '',
  api_endpoint: '',
  docs_url: '',
  protocols: [],
  input_formats: [],
  output_formats: [],
  pricing_model: '',
  pricing_details: '',
  tags: '',
  agent_card_json: '',
};

export function RegisterForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <div className="text-center py-16">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Sign in to register your agent</h2>
        <p className="text-muted mb-6">You need a GitHub account to register and manage agents.</p>
        <button
          onClick={() => signIn('github')}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>
      </div>
    );
  }

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'categories' | 'protocols' | 'input_formats' | 'output_formats', value: string) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const capabilities = form.capabilities
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      let agentCard: Record<string, unknown> | undefined;
      if (form.agent_card_json.trim()) {
        try {
          agentCard = JSON.parse(form.agent_card_json);
        } catch {
          setError('Agent card JSON is invalid');
          setSubmitting(false);
          return;
        }
      }

      const payload: Record<string, unknown> = {
        slug: form.slug,
        name: form.name,
        capabilities,
        categories: form.categories,
        protocols: form.protocols,
        input_formats: form.input_formats,
        output_formats: form.output_formats,
        tags,
      };

      if (form.tagline) payload.tagline = form.tagline;
      if (form.description) payload.description = form.description;
      if (form.a2a_endpoint) payload.a2a_endpoint = form.a2a_endpoint;
      if (form.mcp_server_url) payload.mcp_server_url = form.mcp_server_url;
      if (form.api_endpoint) payload.api_endpoint = form.api_endpoint;
      if (form.docs_url) payload.docs_url = form.docs_url;
      if (form.pricing_model) payload.pricing_model = form.pricing_model;
      if (form.pricing_details) payload.pricing_details = form.pricing_details;
      if (agentCard) payload.agent_card = agentCard;

      const res = await fetch('/api/dashboard/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error?.message ?? 'Registration failed');
        setSubmitting(false);
        return;
      }

      router.push(`/agent/${result.data.slug}`);
    } catch {
      setError('Something went wrong');
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.name.length >= 1 && form.slug.length >= 3;
      default:
        return true;
    }
  };

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => i < step && setStep(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              i === step
                ? 'bg-accent text-white'
                : i < step
                ? 'bg-accent/10 text-accent cursor-pointer'
                : 'bg-surface text-muted'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">
              {i < step ? '✓' : i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {step === 0 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Agent Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  updateField('name', e.target.value);
                  if (!form.slug || form.slug === autoSlug(form.name)) {
                    updateField('slug', autoSlug(e.target.value));
                  }
                }}
                placeholder="My Amazing Agent"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden focus-within:border-accent">
                <span className="px-4 text-muted text-sm">agentdns.com/agent/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-amazing-agent"
                  className="flex-1 bg-transparent px-2 py-3 text-foreground placeholder:text-muted outline-none font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="One-line description of what your agent does"
                maxLength={300}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Full description of your agent (markdown supported)"
                rows={5}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent resize-y"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Capabilities</label>
              <p className="text-xs text-muted mb-2">Comma-separated capability tags (e.g. contract-review, summarization, translation)</p>
              <input
                type="text"
                value={form.capabilities}
                onChange={(e) => updateField('capabilities', e.target.value)}
                placeholder="document-analysis, summarization, translation"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent"
              />
              {form.capabilities && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.capabilities.split(',').map((c) => c.trim()).filter(Boolean).map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleArrayField('categories', cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      form.categories.includes(cat)
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <p className="text-xs text-muted mb-2">Comma-separated freeform tags for discovery</p>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                placeholder="ai, nlp, fast, production-ready"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">A2A Endpoint</label>
              <input
                type="url"
                value={form.a2a_endpoint}
                onChange={(e) => updateField('a2a_endpoint', e.target.value)}
                placeholder="https://your-agent.example.com/.well-known/agent.json"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">MCP Server URL</label>
              <input
                type="url"
                value={form.mcp_server_url}
                onChange={(e) => updateField('mcp_server_url', e.target.value)}
                placeholder="https://your-mcp-server.example.com"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">REST API Endpoint</label>
              <input
                type="url"
                value={form.api_endpoint}
                onChange={(e) => updateField('api_endpoint', e.target.value)}
                placeholder="https://api.your-agent.example.com/v1"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Documentation URL</label>
              <input
                type="url"
                value={form.docs_url}
                onChange={(e) => updateField('docs_url', e.target.value)}
                placeholder="https://docs.your-agent.example.com"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">A2A Agent Card JSON (optional)</label>
              <textarea
                value={form.agent_card_json}
                onChange={(e) => updateField('agent_card_json', e.target.value)}
                placeholder='{"name": "...", "description": "...", ...}'
                rows={4}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent font-mono text-sm resize-y"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Supported Protocols</label>
              <div className="flex flex-wrap gap-2">
                {PROTOCOL_OPTIONS.map((proto) => (
                  <button
                    key={proto}
                    type="button"
                    onClick={() => toggleArrayField('protocols', proto)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-mono uppercase transition-colors ${
                      form.protocols.includes(proto)
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {proto}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Input Formats</label>
              <div className="flex flex-wrap gap-2">
                {INPUT_FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleArrayField('input_formats', fmt)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      form.input_formats.includes(fmt)
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Output Formats</label>
              <div className="flex flex-wrap gap-2">
                {OUTPUT_FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleArrayField('output_formats', fmt)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      form.output_formats.includes(fmt)
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Pricing Model</label>
              <div className="flex flex-wrap gap-2">
                {PRICING_OPTIONS.map((model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => updateField('pricing_model', form.pricing_model === model ? '' : model)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      form.pricing_model === model
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pricing Details</label>
              <input
                type="text"
                value={form.pricing_details}
                onChange={(e) => updateField('pricing_details', e.target.value)}
                placeholder="e.g. Free during beta, $0.01 per task, etc."
                maxLength={500}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent"
              />
            </div>
          </>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review your agent</h3>
            <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
              <ReviewRow label="Name" value={form.name} />
              <ReviewRow label="Slug" value={form.slug} mono />
              {form.tagline && <ReviewRow label="Tagline" value={form.tagline} />}
              {form.capabilities && (
                <ReviewRow label="Capabilities" value={form.capabilities.split(',').map((c) => c.trim()).filter(Boolean).join(', ')} />
              )}
              {form.categories.length > 0 && (
                <ReviewRow label="Categories" value={form.categories.join(', ')} />
              )}
              {form.protocols.length > 0 && (
                <ReviewRow label="Protocols" value={form.protocols.join(', ')} />
              )}
              {form.a2a_endpoint && <ReviewRow label="A2A Endpoint" value={form.a2a_endpoint} mono />}
              {form.mcp_server_url && <ReviewRow label="MCP Server" value={form.mcp_server_url} mono />}
              {form.api_endpoint && <ReviewRow label="REST API" value={form.api_endpoint} mono />}
              {form.pricing_model && <ReviewRow label="Pricing" value={`${form.pricing_model}${form.pricing_details ? ` — ${form.pricing_details}` : ''}`} />}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Registering...' : 'Register Agent'}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
