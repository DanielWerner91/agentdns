'use client';

import { useState } from 'react';

interface JsonViewerProps {
  data: Record<string, unknown>;
  label: string;
}

export function JsonViewer({ data, label }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-hover transition-colors text-sm"
      >
        <span className="font-medium">{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <pre className="p-4 text-xs font-mono text-muted overflow-x-auto bg-background">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
