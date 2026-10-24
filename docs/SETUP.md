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

There is no `.env` file and no application backend. WebLLM runs local chat in a dedicated browser worker; the official Puter.js SDK handles hosted model calls and browser authentication.

## 3. Install REA

The approved setup used the current `rea-agents@latest` release and applied the Claude Code client configuration plus the reverse-engineering skill:

```bash
npx -y rea-agents@latest setup --client claude_code --yes --format json
```

For reproducible subsequent commands, pin the installed release:

```bash
npx -y rea-agents@6.7.0 doctor --client claude_code --format json
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
- Initialize, `tools/list`, and `prompts/list`: successful
- Discovered tools: `207`
- Discovered prompts: `6`

The MCP server speaks stdio and is intended to be launched by an MCP-compatible client; it is not an HTTP server for the website.

## 5. Scope of agent tools

REA, MCP registration, and any Arena-connected applications are available to the development agent, not automatically to visitors of this static website. In particular:

- No Gmail, Drive, Notion, Supabase, Vercel, or other connector credentials are embedded in browser code.
- The website does not claim those connectors are end-user integrations.
- Arena itself is not represented as a REA setup client.
- No account automation, cookie collection, or credential collection is part of the reference reconstruction.

## 6. Use local AI or hosted Puter

For credit-free local chat, keep the default **SmolLM2 360M** or choose another **Local** model. Submitting a prompt starts WebLLM in a dedicated worker; no Puter sign-in is used. The first run downloads model artifacts from WebLLM’s public model hosts and caches them in the browser.

- Use a WebGPU-capable browser and select a model that fits the device’s GPU memory and storage.
- Local inference has no per-message credits, but hardware, browser, and model-license limits still apply.
- Only Phi 3.5 Vision accepts image input among the included local models.
- The app does not bypass quotas or billing for hosted proprietary models.

For hosted AI, use the Studio’s **Sign in** button to start the official Puter authentication flow. Hosted usage is associated with the signed-in user’s Puter account.

- Do not add OpenAI, Anthropic, Gemini, or other provider keys to this project.
- Do not assume all hosted catalog entries are free. Inspect Puter’s model metadata and pricing.
- Keep media/OCR **Test mode** enabled for sample output without credits.
- Only disable test mode when you intentionally want live hosted generation and accept account usage.

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

The visual script checks the landing page, Studio chat, six local model options, the local default, Images and Audio navigation, and the mobile sidebar. It captures 1440px and 390px layouts, records runtime/console errors, and checks document width for horizontal overflow. WebGPU is explicitly disabled during the local request check, which verifies the compatibility message without downloading model artifacts.

The sandbox blocks some external TLS/WebSocket connections. Those network failures are recorded separately from application runtime errors. Verification deliberately avoids paid provider calls and local model downloads. Actual local inference requires a user-run WebGPU browser and an initial model download.

See [REA-EVIDENCE.md](REA-EVIDENCE.md) for the reference sources, evidence IDs, and limitations.
