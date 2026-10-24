# REA and reference evidence

**Evidence date:** 2026-10-24

**Scope:** public Puter AI Gateway reconstruction, public ChatGPT interaction reference, and local AI Studio verification.

This record separates observed evidence from reconstruction decisions. Raw browser/REA artifacts are generated under `.cache/` and intentionally excluded from Git.

## Public reference sources

### Puter AI Gateway

Primary public reference: <https://developer.puter.com/ai/>

Observed page identity and content:

- Title: `AI Gateway: One API for 500+ AI Models - Puter Developer`
- Hero: `AI Gateway for AI-Generated Apps`
- Core message: one API for 500+ models, no API keys or servers, user-pays authentication, and rapid frontend integration.
- Coding prompt: `Build an AI chat app using Puter.js`
- Agent actions: Claude Code, Codex, Claude, ChatGPT, Cursor, and Lovable.
- Major sections: navigation, hero, provider marquee, capability bento grid, three-step integration guide, model/provider directory, FAQ, prompt CTA, and footer.

Public stylesheet reference: <https://developer.puter.com/styles.css>

Reference-derived design evidence included:

- Roboto/Arial typography and primary blue `#1d49e7`.
- Fixed translucent, blurred navigation.
- White hero with generous vertical spacing and an 88px rounded gradient icon.
- Light-gray feature areas, white cards, a three-column bento layout, and 20px gaps.
- Blue timeline accents, responsive prompt-box/modal rules, and a dark `#333` footer.

The implementation uses original React components and CSS derived from these public observations; it is not a copied proprietary application bundle.

### Official API references

Implementation behavior was checked against the current official documentation:

- [Chat](https://docs.puter.com/AI/chat/) — streaming, abort signals, model selection, multimodal content, and normalized responses.
- [Model listing](https://docs.puter.com/AI/listModels/) and [model directory](https://developer.puter.com/ai/models/) — dynamic metadata and `:free`, `:flex`, and `:priority` variants.
- [Text to image](https://docs.puter.com/AI/txt2img/) — model, aspect ratio, `input_image`, and `test_mode`.
- [Text to video](https://docs.puter.com/AI/txt2vid/) — `seconds`, `size`, `input_reference`, `generate_audio`, and `test_mode`.
- [Text to speech](https://docs.puter.com/AI/txt2speech/) — provider-specific voices and sample audio mode.
- [Speech to text](https://docs.puter.com/AI/speech2txt/) — file/blob inputs, provider options, text/structured results, and sample transcripts.
- [Speech to speech](https://docs.puter.com/AI/speech2speech/) — ElevenLabs voice/model/output options and sample audio mode.
- [Image/document to text](https://docs.puter.com/AI/img2txt/) — AWS Textract, Mistral OCR, document limits, and `testMode`.

The model picker requests the live chat catalog at runtime. The fallback catalog is explicitly identified as a fallback and is not represented as the complete 500+ model list.

### ChatGPT public UI reference

Public reference: <https://chatgpt.com/>

The unauthenticated public fetch exposed mostly login/no-auth content and did not provide enough visual evidence for a faithful pixel-level reproduction. Accordingly, the Studio uses a familiar ChatGPT-style interaction pattern—sidebar history, central greeting, model picker, suggestion cards, streaming conversation, and bottom composer—without claiming to be an exact copy of an authenticated ChatGPT session.

No authenticated ChatGPT account was accessed or automated.

## REA setup and registration evidence

- Installed with `rea-agents@latest`; resolved release: `6.7.0`.
- Setup client: `claude_code`.
- Doctor result: `healthy: true`, with aligned skill identity.
- Installed reverse-engineering skill version: `42`.
- Project MCP registration: `.mcp.json`, server name `rea`, pinned launcher `npx -y rea-agents@6.7.0 mcp`.
- Live MCP stdio initialize and `tools/list`: successful; protocol `2025-03-26`; 207 tools discovered.

This verifies installation, registration, and MCP availability. It does not imply that every REA provider or remote browser route is available in the sandbox.

## Successful local REA observations

A local Chromium CDP target displaying the reconstructed Studio was inspected with REA. These are **local implementation observations**, not captures of the remote Puter or ChatGPT origins.

| Operation | Evidence ID | Observed result |
| --- | --- | --- |
| `list_browser_targets` | `ev_44e4387d2007f52e62c2fcd391e2eaaf6e9ca85d604bdfdb092d3a4a5b922af7` | Headless Chromium 153 target titled `Puter AI Studio` at the local `/app` route |
| `inspect_web_page` | `ev_5b1a069f62107a04b073c739fda71a522747702b08234fcfacf66fdaae78c14f` | Observed page target, DOM, accessibility structure, scripts, resources, metadata, and policy/completeness information |
| `capture_web_screenshot` | `ev_7b12f4533870956c7092ba5d2f7e388ac05019cb35161e17e395ab8b6a616ac6` | Observed 800×600 PNG viewport artifact with a recorded SHA-256 identity |

The inspection reported `policy_filtered` completeness: some script text, accessibility details, metadata, and storage-related fields were not approved or were outside the capture policy. The evidence is therefore useful for structural observation, not a claim of a complete accessibility or security audit.

Generated local files:

```text
.cache/rea/inspect-studio.json
.cache/rea/studio-screenshot.json
```

## Independent browser verification

Playwright/Sparticuz Chromium smoke checks covered both development and production builds:

- Landing page at 1440×1000 and 390×844.
- Studio chat empty state and composer.
- Images workspace and Audio tab navigation.
- Mobile sidebar open state.
- No runtime JavaScript exceptions.
- No horizontal document overflow at the tested widths.

Generated screenshots and `report.json` are under `.cache/screenshots/`.

## Limitations and rejected evidence

- Direct sandbox connections to the public Puter origin and Puter API/WebSocket endpoints failed at the network/TLS layer. Public page and stylesheet evidence was therefore obtained through the available page-fetching tool instead.
- A live remote REA capture of `developer.puter.com/ai/` or an authenticated ChatGPT session is **not** claimed.
- REA `analyze-web-bundle` against the Vite development page exhausted the Node heap while processing development modules. That failed/empty output is not counted as evidence; the narrower page inspection and screenshot operations succeeded.
- External provider images/fonts and Puter connectivity can fail in the sandbox. The application’s fallback rendering still worked, but this is not evidence that live provider generation succeeded.
- No paid AI call was made. Streaming and multimodal behavior were tested with non-networked mocks; end-to-end live provider calls require explicit user action and Puter sign-in in a network-capable browser.
