'use client';

export function ValidatorForm() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:border-accent">
          <span className="px-3 text-muted text-sm shrink-0">https://</span>
          <input
            id="validator-domain"
            type="text"
            placeholder="yourdomain.com"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted outline-none"
          />
        </div>
        <button
          onClick={() => {
            const input = document.getElementById('validator-domain') as HTMLInputElement;
            if (input?.value) {
              window.open(`https://${input.value}/.well-known/agents.json`, '_blank');
            }
          }}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          Validate
        </button>
      </div>
      <p className="text-xs text-muted">Opens your <code className="font-mono">/.well-known/agents.json</code> in a new tab for inspection.</p>
    </div>
  );
}
