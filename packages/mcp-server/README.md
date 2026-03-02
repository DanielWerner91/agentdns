# @agentdns/mcp-server

MCP server for [AgentDNS](https://agentdns-green.vercel.app) — AI agent discovery and resolution.

Lets any MCP-compatible client (Claude Desktop, Cursor, etc.) search, resolve, and register AI agents through the AgentDNS directory.

## Quick start

```bash
npx @agentdns/mcp-server
```

Or install globally:

```bash
npm install -g @agentdns/mcp-server
agentdns-mcp
```

## Configuration

| Variable | Description | Default |
|---|---|---|
| `AGENTDNS_API_URL` | AgentDNS API base URL | `https://agentdns-green.vercel.app` |
| `AGENTDNS_API_KEY` | API key (required for `register_agent`) | — |

## Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentdns": {
      "command": "npx",
      "args": ["-y", "@agentdns/mcp-server"],
      "env": {
        "AGENTDNS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

| Tool | Description | Auth required |
|---|---|---|
| `search_agents` | Search agents by keyword, category, protocol, or capability | No |
| `get_agent` | Get full details for a single agent by ID or slug | No |
| `resolve_by_capability` | Find the best agents for a specific task | No |
| `register_agent` | Register a new agent in the directory | Yes |
| `list_categories` | List all categories with agent counts | No |
| `get_agent_card` | Fetch the AgentDNS A2A Agent Card | No |

## Development

```bash
npm install
npm run build
node dist/index.js
```

## License

MIT
