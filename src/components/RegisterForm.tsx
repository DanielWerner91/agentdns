'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const STEPS = ['Basic Info', 'Capabilities', 'Endpoints', 'Communication', 'Pricing', 'Review'];

const CATEGORY_OPTIONS = [
  'legal', 'finance', 'content', 'engineering', 'data',
  'support', 'sales', 'healthcare', 'education', 'security',
  'developer-tools', 'infrastructure', 'productivity', 'design-creative',
];
const PROTOCOL_OPTIONS = ['a2a', 'mcp', 'rest', 'graphql', 'websocket'] as const;
const INPUT_FORMAT_OPTIONS = ['text', 'json', 'pdf', 'image', 'audio'] as const;
const OUTPUT_FORMAT_OPTIONS = ['text', 'json', 'markdown', 'pdf'] as const;
const PRICING_OPTIONS = ['free', 'per-task', 'subscription', 'usage-based', 'custom'] as const;

const CAPABILITY_SUGGESTIONS = [
  'browser-automation','code-generation','code-review','debugging',
  'document-analysis','summarization','translation','classification',
  'data-extraction','web-scraping','web-search','question-answering',
  'image-generation','voice-synthesis','tts','ocr',
  'sql','database','analytics','monitoring',
  'customer-support','email','scheduling','task-management',
  'payments','authentication','deployment','testing',
  'rag','embeddings','semantic-search','vector-search',
  'reasoning','planning','memory','orchestration',
];

interface FormData {
  name: string; slug: string; tagline: string; description: string;
  capabilities: string; categories: string[]; a2a_endpoint: string;
  mcp_server_url: string; api_endpoint: string; docs_url: string;
  protocols: string[]; input_formats: string[]; output_formats: string[];
  pricing_model: string; pricing_details: string; tags: string; agent_card_json: string;
}
interface SuccessData { slug: string; name: string; }

const init: FormData = {
  name:'',slug:'',tagline:'',description:'',capabilities:'',categories:[],
  a2a_endpoint:'',mcp_server_url:'',api_endpoint:'',docs_url:'',
  protocols:[],input_formats:[],output_formats:[],
  pricing_model:'',pricing_details:'',tags:'',agent_card_json:'',
};

export function RegisterForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(init);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [capSuggestions, setCapSuggestions] = useState<string[]>([]);
  const [quickMode, setQuickMode] = useState(false);
  const [quickCapability, setQuickCapability] = useState('');
  const [quickEndpoint, setQuickEndpoint] = useState('');

  if (status === 'loading') return <div className="text-center py-16 text-muted">Loading...</div>;

  if (!session) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Sign in to register your agent</h2>
        <p className="text-muted mb-6">You need a GitHub account to register and manage agents.</p>
        <button onClick={() => signIn('github')}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>
      </div>
    );
  }

  // ── Success share card ──
  if (successData) {
    const agentUrl = `https://agent-dns.tech/agent/${successData.slug}`;
    const shareText = `My agent "${successData.name}" is now discoverable on AgentDNS! ${agentUrl}`;
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Agent Registered!</h2>
        <p className="text-muted mb-8">{successData.name} is now discoverable on AgentDNS.</p>
        <div className="bg-surface border border-border rounded-xl p-6 mb-6 text-left">
          <p className="text-sm font-semibold mb-3">Share your listing</p>
          <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs text-muted mb-4 break-all">{agentUrl}</div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => navigator.clipboard.writeText(agentUrl)}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-accent/50 transition-colors">
              Copy Link
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-accent/50 transition-colors">
              Share on X
            </a>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/agent/${successData.slug}`)}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
            View Profile
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const set = (field: keyof FormData, value: string | string[]) =>
    setForm((p) => ({ ...p, [field]: value }));

  const toggle = (field: 'categories'|'protocols'|'input_formats'|'output_formats', v: string) =>
    setForm((p) => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });

  const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const handleCapInput = (val: string) => {
    set('capabilities', val);
    const last = val.split(',').pop()?.trim() ?? '';
    if (last.length >= 2) {
      setCapSuggestions(CAPABILITY_SUGGESTIONS.filter((s) => s.includes(last) && !val.includes(s)).slice(0, 6));
    } else setCapSuggestions([]);
  };

  const addCap = (cap: string) => {
    const existing = form.capabilities.split(',').map((c) => c.trim()).filter(Boolean);
    set('capabilities', existing.includes(cap) ? form.capabilities : (existing.length ? `${existing.join(', ')}, ${cap}` : cap));
    setCapSuggestions([]);
  };

  const handleSubmit = async () => {
    setError(''); setSubmitting(true);
    try {
      // In quick mode, merge quick fields into form state before submitting
      const capabilities = (quickMode ? quickCapability : form.capabilities)
        .split(',').map((c) => c.trim()).filter(Boolean);
      const endpoint = quickMode ? quickEndpoint : '';
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      let agentCard: Record<string,unknown>|undefined;
      if (form.agent_card_json.trim()) {
        try { agentCard = JSON.parse(form.agent_card_json); }
        catch { setError('Agent card JSON is invalid'); setSubmitting(false); return; }
      }
      const payload: Record<string,unknown> = {
        slug: form.slug, name: form.name, capabilities,
        categories: form.categories, protocols: form.protocols,
        input_formats: form.input_formats, output_formats: form.output_formats, tags,
      };
      if (form.tagline) payload.tagline = form.tagline;
      if (form.description) payload.description = form.description;
      if (form.a2a_endpoint) payload.a2a_endpoint = form.a2a_endpoint;
      if (form.mcp_server_url) payload.mcp_server_url = form.mcp_server_url;
      if (endpoint) payload.api_endpoint = endpoint;
      else if (form.api_endpoint) payload.api_endpoint = form.api_endpoint;
      if (form.docs_url) payload.docs_url = form.docs_url;
      if (form.pricing_model) payload.pricing_model = form.pricing_model;
      if (form.pricing_details) payload.pricing_details = form.pricing_details;
      if (agentCard) payload.agent_card = agentCard;

      const res = await fetch('/api/dashboard/register', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error?.message ?? 'Registration failed'); setSubmitting(false); return; }
      setSuccessData({ slug: result.data.slug, name: result.data.name });
    } catch { setError('Something went wrong'); setSubmitting(false); }
  };

  const canProceed = () => step === 0 ? form.name.length >= 1 && form.slug.length >= 3 : true;
  const canQuickSubmit = form.name.length >= 1 && form.slug.length >= 3;

  const inp = "w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent";

  return (
    <div>
      {/* GitHub user banner */}
      <div className="flex items-center justify-between mb-6 p-3 bg-surface border border-border rounded-lg">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium">{session.user?.name}</p>
            <p className="text-xs text-muted">Registering as verified owner</p>
          </div>
        </div>
        {/* Quick / Full toggle */}
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
          <button
            onClick={() => setQuickMode(false)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!quickMode ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`}
          >
            Full Form
          </button>
          <button
            onClick={() => setQuickMode(true)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${quickMode ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`}
          >
            Quick
          </button>
        </div>
      </div>

      {quickMode ? (
        /* ── Quick Register mode ── */
        <div className="space-y-5">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm text-muted">
            3 fields and you&apos;re done. Add more details anytime from your dashboard.
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Agent Name *</label>
            <input type="text" value={form.name} placeholder="My Amazing Agent" className={inp}
              onChange={(e) => { set('name', e.target.value); if (!form.slug || form.slug === autoSlug(form.name)) set('slug', autoSlug(e.target.value)); }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden focus-within:border-accent">
              <span className="px-4 text-muted text-sm shrink-0">agent-dns.tech/agent/</span>
              <input type="text" value={form.slug} placeholder="my-amazing-agent"
                className="flex-1 bg-transparent px-2 py-3 text-foreground placeholder:text-muted outline-none font-mono text-sm"
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Primary Capability</label>
            <input type="text" value={quickCapability} placeholder="e.g. code-generation" className={inp}
              onChange={(e) => setQuickCapability(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Endpoint URL <span className="text-muted font-normal">(optional)</span></label>
            <input type="url" value={quickEndpoint} placeholder="https://your-agent.example.com/api" className={`${inp} font-mono text-sm`}
              onChange={(e) => setQuickEndpoint(e.target.value)} />
          </div>
          {error && <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>}
          <button onClick={handleSubmit} disabled={submitting || !canQuickSubmit}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Registering...' : 'Register Agent'}
          </button>
        </div>
      ) : (
        /* ── Full multi-step form ── */
        <div>
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {STEPS.map((label, i) => (
              <button key={label} onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  i===step ? 'bg-accent text-white' : i<step ? 'bg-accent/10 text-accent cursor-pointer' : 'bg-surface text-muted'}`}>
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">{i<step?'✓':i+1}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {step === 0 && (<>
              <div>
                <label className="block text-sm font-medium mb-2">Agent Name *</label>
                <input type="text" value={form.name} placeholder="My Amazing Agent" className={inp}
                  onChange={(e) => { set('name', e.target.value); if (!form.slug || form.slug === autoSlug(form.name)) set('slug', autoSlug(e.target.value)); }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden focus-within:border-accent">
                  <span className="px-4 text-muted text-sm">agent-dns.tech/agent/</span>
                  <input type="text" value={form.slug} placeholder="my-amazing-agent"
                    className="flex-1 bg-transparent px-2 py-3 text-foreground placeholder:text-muted outline-none font-mono text-sm"
                    onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} />
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Tagline</label>
                <input type="text" value={form.tagline} maxLength={300} placeholder="One-line description" className={inp} onChange={(e) => set('tagline', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={form.description} rows={5} placeholder="Full description (markdown supported)" className={inp + ' resize-y'} onChange={(e) => set('description', e.target.value)} /></div>
            </>)}

            {step === 1 && (<>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Capabilities</label>
                <p className="text-xs text-muted mb-2">Comma-separated capability tags. These power search and resolution.</p>
                <input type="text" value={form.capabilities} placeholder="document-analysis, summarization, translation" className={inp}
                  onChange={(e) => handleCapInput(e.target.value)}
                  onBlur={() => setTimeout(() => setCapSuggestions([]), 200)} />
                {capSuggestions.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                    {capSuggestions.map((s) => (
                      <button key={s} type="button" onMouseDown={() => addCap(s)}
                        className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-background transition-colors">{s}</button>
                    ))}
                  </div>
                )}
                {form.capabilities && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.capabilities.split(',').map((c)=>c.trim()).filter(Boolean).map((cap)=>(
                      <span key={cap} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs">{cap}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button key={cat} type="button" onClick={() => toggle('categories', cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${form.categories.includes(cat) ? 'bg-accent text-white' : 'bg-surface border border-border text-muted hover:text-foreground'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Tags</label>
                <input type="text" value={form.tags} placeholder="ai, nlp, fast, production-ready" className={inp} onChange={(e) => set('tags', e.target.value)} /></div>
            </>)}

            {step === 2 && (<>
              {(['a2a_endpoint','mcp_server_url','api_endpoint','docs_url'] as const).map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium mb-2">
                    {f==='a2a_endpoint'?'A2A Endpoint':f==='mcp_server_url'?'MCP Server URL':f==='api_endpoint'?'REST API Endpoint':'Documentation URL'}
                  </label>
                  <input type="url" value={form[f]} className={inp+' font-mono text-sm'}
                    placeholder={f==='a2a_endpoint'?'https://your-agent.example.com/.well-known/agent.json':f==='mcp_server_url'?'https://your-mcp-server.example.com':f==='api_endpoint'?'https://api.your-agent.example.com/v1':'https://docs.your-agent.example.com'}
                    onChange={(e) => set(f, e.target.value)} />
                </div>
              ))}
              <div><label className="block text-sm font-medium mb-2">A2A Agent Card JSON (optional)</label>
                <textarea value={form.agent_card_json} rows={4} placeholder='{"name": "...", "description": "..."}' className={inp+' font-mono text-sm resize-y'} onChange={(e) => set('agent_card_json', e.target.value)} /></div>
            </>)}

            {step === 3 && (<>
              <div><label className="block text-sm font-medium mb-2">Supported Protocols</label>
                <div className="flex flex-wrap gap-2">{PROTOCOL_OPTIONS.map((p)=>(
                  <button key={p} type="button" onClick={()=>toggle('protocols',p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-mono uppercase transition-colors ${form.protocols.includes(p)?'bg-accent text-white':'bg-surface border border-border text-muted hover:text-foreground'}`}>{p}</button>
                ))}</div></div>
              <div><label className="block text-sm font-medium mb-2">Input Formats</label>
                <div className="flex flex-wrap gap-2">{INPUT_FORMAT_OPTIONS.map((f)=>(
                  <button key={f} type="button" onClick={()=>toggle('input_formats',f)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${form.input_formats.includes(f)?'bg-accent text-white':'bg-surface border border-border text-muted hover:text-foreground'}`}>{f}</button>
                ))}</div></div>
              <div><label className="block text-sm font-medium mb-2">Output Formats</label>
                <div className="flex flex-wrap gap-2">{OUTPUT_FORMAT_OPTIONS.map((f)=>(
                  <button key={f} type="button" onClick={()=>toggle('output_formats',f)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${form.output_formats.includes(f)?'bg-accent text-white':'bg-surface border border-border text-muted hover:text-foreground'}`}>{f}</button>
                ))}</div></div>
            </>)}

            {step === 4 && (<>
              <div><label className="block text-sm font-medium mb-2">Pricing Model</label>
                <div className="flex flex-wrap gap-2">{PRICING_OPTIONS.map((m)=>(
                  <button key={m} type="button" onClick={()=>set('pricing_model', form.pricing_model===m?'':m)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${form.pricing_model===m?'bg-accent text-white':'bg-surface border border-border text-muted hover:text-foreground'}`}>{m}</button>
                ))}</div></div>
              <div><label className="block text-sm font-medium mb-2">Pricing Details</label>
                <input type="text" value={form.pricing_details} maxLength={500} placeholder="e.g. Free during beta, $0.01 per task" className={inp} onChange={(e) => set('pricing_details', e.target.value)} /></div>
            </>)}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review your agent</h3>
                <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
                  <RR label="Name" value={form.name} />
                  <RR label="Slug" value={form.slug} mono />
                  {form.tagline && <RR label="Tagline" value={form.tagline} />}
                  {form.capabilities && <RR label="Capabilities" value={form.capabilities.split(',').map(c=>c.trim()).filter(Boolean).join(', ')} />}
                  {form.categories.length > 0 && <RR label="Categories" value={form.categories.join(', ')} />}
                  {form.protocols.length > 0 && <RR label="Protocols" value={form.protocols.join(', ')} />}
                  {form.a2a_endpoint && <RR label="A2A Endpoint" value={form.a2a_endpoint} mono />}
                  {form.mcp_server_url && <RR label="MCP Server" value={form.mcp_server_url} mono />}
                  {form.api_endpoint && <RR label="REST API" value={form.api_endpoint} mono />}
                  {form.pricing_model && <RR label="Pricing" value={`${form.pricing_model}${form.pricing_details?` — ${form.pricing_details}`:''}`} />}
                </div>
              </div>
            )}
          </div>

          {error && <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button onClick={() => setStep(Math.max(0, step-1))} disabled={step===0}
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Back</button>
            {step < STEPS.length-1 ? (
              <button onClick={() => setStep(step+1)} disabled={!canProceed()}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !canProceed()}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Registering...' : 'Register Agent'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RR({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm ${mono?'font-mono':''}`}>{value}</span>
    </div>
  );
}
