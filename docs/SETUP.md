# Setup and verification

This guide covers both the web application and the requested REA agent setup. No provider credentials are stored in this repository.

## 1. Runtime requirements

Use Node.js **22.19+** and npm 10+:

```bash
node --version
npm --version
```

The verified workspace used Node.js `v22.22.3` and npm `10.9.8`.

## 2. Install and run the application

```bash
npm ci
npm run dev
```

Vite binds to `0.0.0.0`; use the local or preview URL it prints. The two routes are:

- `/` — AI Gateway landing page
- `/app` — AI Studio

There is no `.env` file and no application backend. The official Puter.js SDK handles model calls and browser authentication.

## 3. Install REA

The approved setup used the current `rea-agents@latest` release and applied the Claude Code client configuration plus the reverse-engineering skill:

```bash
npx -y rea-agents@latest setup --client claude_code --yes --json
```

For reproducible subsequent commands, pin the installed release:

```bash
npx -y rea-agents@6.7.0 doctor --client claude_code --skill --format json
```

Observed result:

- REA version: `6.7.0`
- Doctor: `healthy: true`
- Reverse-engineering skill version: `42`
- Client configuration and skill installation: applied successfully

Existing agent sessions may need to be restarted or reloaded before newly installed skills/configuration appear.

## 4. MCP server registration

The repository includes `.mcp.json`:

```json
{
  "mcpServers": {
    "rea": {
      "command": "npx",
      "args": ["-y", "rea-agents@6.7.0", "mcp"]
    }
  }
}
```

The server name is **`rea`**. Pinning `rea-agents@6.7.0` avoids silently changing the MCP server on a later launch.

A live stdio MCP negotiation was also performed directly against this launcher:

- MCP server: `rea 6.7.0`
- Protocol: `2025-03-26`
- Initialize and `tools/list`: successful
- Discovered tools: `207`

The MCP server speaks stdio and is intended to be launched by an MCP-compatible client; it is not an HTTP server for the website.

## 5. Scope of agent tools

REA, MCP registration, and any Arena-connected applications are available to the development agent, not automatically to visitors of this static website. In particular:

- No Gmail, Drive, Notion, Supabase, Vercel, or other connector credentials are embedded in browser code.
- The website does not claim those connectors are end-user integrations.
- Arena itself is not represented as a REA setup client.
- No account automation, cookie collection, or credential collection is part of the reference reconstruction.

## 6. Sign in and use Puter

Use the Studio’s **Sign in** button to start the official Puter authentication flow. Live usage is associated with the signed-in user’s Puter account.

- Do not add OpenAI, Anthropic, Gemini, or other provider keys to this project.
- Do not assume all catalog entries are free. Inspect Puter’s model metadata and pricing.
- Keep media/OCR **Test mode** enabled for sample output without credits.
- Only disable test mode when you intentionally want live generation and accept account usage.

## 7. Verification commands

```bash
npm run build
npm test
npm audit
```

With the development server running:

```bash
npm run test:visual
```

The visual script checks the landing page, Studio chat, Images and Audio navigation, and the mobile sidebar. It captures 1440px and 390px layouts, records runtime/console errors, and checks document width for horizontal overflow.

The sandbox blocks some external TLS/WebSocket connections. Those network failures are recorded separately from application runtime errors. Verification deliberately avoids paid provider calls.

See [REA-EVIDENCE.md](REA-EVIDENCE.md) for the reference sources, evidence IDs, and limitations.
