'use client';

import { Marquee } from '@/components/ui/marquee';

const protocols = [
  { name: 'A2A Protocol', color: 'cyan' },
  { name: 'MCP Servers', color: 'violet' },
  { name: 'OpenAPI Tools', color: 'cyan' },
  { name: 'LangChain Agents', color: 'violet' },
  { name: 'AutoGPT Plugins', color: 'cyan' },
  { name: 'CrewAI Agents', color: 'violet' },
  { name: 'Semantic Kernel', color: 'cyan' },
  { name: 'Function Calling', color: 'violet' },
  { name: 'Agent Protocol', color: 'cyan' },
  { name: 'Tool Use APIs', color: 'violet' },
  { name: 'RAG Pipelines', color: 'cyan' },
  { name: 'Webhook Agents', color: 'violet' },
];

function ProtocolTag({ name, color }: { name: string; color: string }) {
  const isCyan = color === 'cyan';
  return (
    <div
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-sm ${
        isCyan
          ? 'border-cyan-500/20 bg-cyan-500/[0.05]'
          : 'border-violet-500/20 bg-violet-500/[0.05]'
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isCyan ? 'bg-cyan-400' : 'bg-violet-400'
        }`}
      />
      <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export function ProtocolMarquee() {
  return (
    <section className="py-12 overflow-hidden">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
          Protocols &amp; Frameworks
        </p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#060918] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#060918] to-transparent" />

        <Marquee pauseOnHover className="[--duration:30s] [--gap:0.75rem]">
          {protocols.map((p) => (
            <ProtocolTag key={p.name} name={p.name} color={p.color} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
