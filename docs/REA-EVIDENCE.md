# REA and reference evidence

**Evidence date:** 2026-10-24

**Scope:** public Puter AI Gateway reconstruction, public ChatGPT interaction reference, REA setup/MCP verification, and local implementation inspection.

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
- Major sections: navigation, hero, provider marquee, capability bento grid, three-step integration guide, provider wall, FAQ, prompt CTA, and footer.
- Provider directory: 28 unique providers in two repeated 14-provider sequences. `src/data.test.ts` protects the observed names, order, destinations, and image URLs.

Public stylesheet reference: <https://developer.puter.com/styles.css>

Reference-derived design evidence includes:

- Roboto/Arial typography and primary blue `#1d49e7`.
- Fixed translucent, blurred navigation.
- White hero with `160px 0 60px` desktop padding, an 88px rounded gradient icon, and a 40px icon glyph.
- Light-gray feature area, 8px white bento cards with 20px padding, inline heading icons, three columns, and 20px gaps.
- Blue timeline accents, documented mobile timeline offsets, responsive prompt-box/modal rules, and a dark `#333` footer.

The final audit removed invented feature headings, badges, extra CTA content, and an extra footer strip. Capability links and all 28 provider entries were aligned with the public content. The implementation uses original React components and CSS derived from these public observations; it is not a copied proprietary application bundle.

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

### WebLLM local-inference reference

Official project: <https://github.com/mlc-ai/web-llm>

The installed `0.2.86` package documents in-browser WebGPU inference, OpenAI-compatible streaming chat, browser caching, and dedicated Web Worker support. The implementation uses `CreateWebWorkerMLCEngine` with `WebWorkerMLCEngineHandler`, and validates its six curated model records against the package’s `prebuiltAppConfig.model_list`.

This is the credit-free alternative to hosted inference: model artifacts are downloaded from public model hosts on first use, while subsequent prompt processing runs on the user’s device. It does not bypass hosted provider billing or quotas.

### ChatGPT public UI reference

Public reference: <https://chatgpt.com/>

The unauthenticated public fetch exposed mostly login/no-auth content and did not provide enough visual evidence for a pixel-level reproduction of an authenticated ChatGPT session. The Studio therefore uses the familiar public interaction pattern—sidebar history, central greeting, model picker, suggestion cards, streaming conversation, and bottom composer—without claiming to be an exact authenticated ChatGPT copy.

No authenticated ChatGPT account was accessed or automated.

## REA setup and registration evidence

The approved dry-run contained two actions: configure Claude Code and install the reverse-engineering skill. Applying setup reported `status: ready` and applied both actions.

- Node.js: `v22.22.3`, satisfying the requested 22.19+ requirement.
- REA release: `6.7.0`.
- Scoped doctor: `healthy: true`.
- Skill: version `42`, 207 tools, state `aligned`.
- Claude Code registration: `npx -y rea-agents@6.7.0 mcp`, state `aligned`.
- Project MCP registration: `.mcp.json`, server name `rea`, with the same pinned launcher.
- Live MCP stdio initialize: server `rea 6.7.0`, protocol `2025-03-26`.
- Live MCP discovery: 207 tools and 6 prompts.

This verifies installation, registration, and MCP availability. Optional native-analysis providers are not required for web observation.

## Remote REA attempts and network boundary

A Chromium CDP browser was pointed at both public origins. REA target discovery worked, but the sandbox closed both remote connections before a same-origin document existed. The browser location became `chrome-error://chromewebdata/`; REA correctly refused page inspection as `target_not_allowed`.

| Target | REA evidence | Result |
| --- | --- | --- |
| `https://developer.puter.com/ai/` | `ev_99cc1a2b61d90dffea6e60ec0e77d0c8abddb3bf30736a0a4e97c1b345977825` | Target discovered; remote document unavailable after network failure |
| `https://chatgpt.com/` | `ev_0b7824b59420759537a91df7fcd1cc54988e4fbbe880528dbf4087f14ab05e26` | Target discovered; `ERR_CONNECTION_CLOSED`, no inspectable public document |

No successful remote visual capture is claimed. Public page, stylesheet, and API artifacts obtained through the page-fetching tool were used for the implementation audit instead.

## Final local REA observations

REA successfully inspected the corrected implementation running locally. These are **local implementation observations**, not remote-reference captures.

| Page/operation | Evidence ID | Observed result |
| --- | --- | --- |
| Local target discovery | `ev_0771bcd8b9a3642811ae46aee28fef2824e3e8300993027920579a9e0ec8a5e6` | Headless Chromium 153 target for the corrected local app |
| Landing `inspect_web_page` | `ev_f8f5fe51fadf3f28d9ae0f9be640f481aca4810c2fea0366f9ecd66640ae669e` | 930 DOM nodes, 31 resources, 1,021 accessibility nodes |
| Landing `capture_web_screenshot` | `ev_ef62f94e5fe2ebd27217dd22dcef185bd3e1218f025612f80198db4f43b91044` | Observed 800×600 PNG viewport artifact |
| Studio `inspect_web_page` | `ev_c48474ebc47219f4b76025886f0112fa514ace53da8123b139e27ccf5ad48ff4` | 254 DOM nodes, 9 resources, 157 accessibility nodes |
| Studio `capture_web_screenshot` | `ev_37adfa534e72b78043f31d2296cccdcefbf188024392180bd1deef6497a769d3` | Observed 800×600 PNG viewport artifact |
| Local-AI Studio target discovery | `ev_ec248e247a764d5793e0a2db89d1bd9701d1b5956c055f23498777b605b03bdc` | Updated local Studio target with the on-device default |
| Local-AI Studio `inspect_web_page` | `ev_7939511760ff11898ce47c6622adac92bf4cc3220a52afc0bc1f4075eca2fe64` | 284 DOM nodes, 32 resources, 156 accessibility nodes |
| Local-AI Studio `capture_web_screenshot` | `ev_def69da4fbc1660fe36c405fbfa5e234d8c3d240bb003d51ce70fd2c7db68a80` | Observed 800×600 PNG viewport artifact |

The inspections report policy-filtered completeness. They provide structural evidence, not a complete accessibility or security audit.

Generated local evidence is under `.cache/rea-current/`.

## Independent verification

- TypeScript and production Vite build passed.
- Vitest passed 19 tests, including local/hosted streaming, local cancellation, multimodal adapters, WebLLM model-record validation, utility behavior, and the 28-provider reference directory.
- npm audit reported zero vulnerabilities.
- Chromium checks covered the landing page, Studio, six local model options, the local default, Images, Audio, and mobile sidebar at 1440×1000 and 390×844.
- The forced unsupported-WebGPU path displayed the intended compatibility message without downloading model artifacts.
- No runtime JavaScript exceptions or horizontal document overflow occurred at the tested widths.

Screenshots and `report.json` are under `.cache/screenshots/`.

## Limitations

- External provider images/fonts and Puter API/WebSocket connections can fail in the sandbox. Fallback rendering worked, but that is not evidence of a successful live provider response.
- No paid AI call or local model download was made. Local/hosted streaming and multimodal behavior were tested with non-networked mocks.
- Actual local inference requires a user-run WebGPU browser and first-time model download; the sandbox result is not represented as a completed local model response.
- End-to-end hosted provider calls require explicit user action and Puter sign-in in a network-capable browser.
- Arena connectors remain agent-side development/deployment tools; no connector credentials are embedded in browser code.
