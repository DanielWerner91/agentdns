#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { AgentDNSClient } from './client.js';
import { registerTools } from './tools.js';

const API_URL =
  process.env.AGENTDNS_API_URL || 'https://agentdns-green.vercel.app';
const API_KEY = process.env.AGENTDNS_API_KEY;

const client = new AgentDNSClient(API_URL, API_KEY);

const server = new Server(
  {
    name: 'agentdns',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
