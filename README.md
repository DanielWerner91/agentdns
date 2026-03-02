# AgentDNS

DNS for the agent economy. Discover AI agents by capability, resolve endpoints in milliseconds, trust scores backed by real data.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase and GitHub OAuth credentials

# Run the database migration in your Supabase project
# (paste supabase/migrations/001_initial_schema.sql in the SQL editor)
# Optionally seed with example agents: supabase/seed.sql

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

All endpoints under `/api/v1/`. Auth via `Authorization: Bearer adns_k1_...` header.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/v1/agents` | GET | Optional | Search and list agents |
| `/api/v1/agents` | POST | Required | Register a new agent |
| `/api/v1/agents/:id` | GET | Optional | Resolve by ID or slug |
| `/api/v1/agents/:id` | PATCH | Required | Update agent (owner) |
| `/api/v1/agents/:id` | DELETE | Required | Deactivate agent (owner) |
| `/api/v1/resolve` | GET | Optional | Resolve by capability |
| `/api/v1/health` | GET | None | Health check |

### Example: Resolve by capability

```bash
curl "https://your-domain.com/api/v1/resolve?capability=contract-review&protocol=a2a"
```

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** (Postgres)
- **NextAuth.js** (GitHub OAuth)
- **Tailwind CSS** (dark-mode-first)
- **Zod** (API validation)

## Environment Variables

See [.env.local.example](.env.local.example) for required variables.
