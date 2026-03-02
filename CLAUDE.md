# AgentDNS

DNS for AI agents — discovery and resolution registry for the agent economy.

## Architecture

Standalone Next.js app with Supabase backend. NOT an n8n workflow wrapper.

- **Framework:** Next.js 14+ (App Router, Server Components)
- **Database:** Supabase (Postgres)
- **Auth:** NextAuth.js with GitHub OAuth
- **Styling:** Tailwind CSS, dark-mode-first
- **Validation:** Zod for all API inputs

## Key Files

- `supabase/migrations/001_initial_schema.sql` — Database schema
- `src/lib/supabase/` — Supabase clients (browser, server, admin)
- `src/lib/auth.ts` — NextAuth configuration
- `src/lib/validators.ts` — Zod schemas for API validation
- `src/lib/api-keys.ts` — API key generation, hashing, validation
- `src/lib/rate-limit.ts` — In-memory rate limiter
- `src/lib/types.ts` — Shared TypeScript types

## API Routes

All under `/api/v1/`:
- `GET /api/v1/agents` — Search/list agents (public)
- `POST /api/v1/agents` — Register agent (auth required)
- `GET /api/v1/agents/[id]` — Resolve single agent (public)
- `PATCH /api/v1/agents/[id]` — Update agent (owner only)
- `DELETE /api/v1/agents/[id]` — Soft-delete agent (owner only)
- `GET /api/v1/resolve` — Resolve by capability (public, primary machine endpoint)
- `GET /api/v1/health` — Health check

## Environment Variables

See `.env.local.example` for required variables.

## Repo

GitHub: `agentdns`
