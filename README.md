# Puter AI Gateway + Studio

An independent, responsive reconstruction of the public [Puter AI Gateway](https://developer.puter.com/ai/) page, plus a ChatGPT-style AI Studio powered by [WebLLM](https://github.com/mlc-ai/web-llm) for on-device chat and the official [`@heyputer/puter.js`](https://docs.puter.com/) SDK for hosted models and media APIs.

The landing page preserves the reference’s content hierarchy, visual language, provider directory, coding-prompt workflow, FAQ, and footer. The Studio adds a functional, browser-based workspace for credit-free local chat and Puter’s hosted AI APIs—without API keys or an application backend.

> **Independent project:** this is not an official Puter or OpenAI product. Puter, ChatGPT, and provider names belong to their respective owners.

## Features

### AI Gateway landing page

- Reference-derived navigation, hero, provider marquee, feature bento grid, three-step guide, provider directory, FAQ, coding-prompt modal, CTA, and footer.
- Responsive desktop/mobile layouts and an accessible mobile navigation menu.
- Working copy actions, coding-agent links, tutorial/documentation links, and direct links into the Studio.

### AI Studio

- **Credit-free local chat:** six WebLLM models running in a dedicated Web Worker, streaming responses, cancellation, model-download progress, browser caching, and a local Phi vision option. No Puter sign-in or per-message credits are used for local inference.
- **Hosted chat:** Puter’s live model catalog with a graceful fallback, provider filters, search, free-model indicators, streaming responses, Markdown/GFM rendering, image attachments, and conversation history.
- **Images:** text-to-image and reference-image editing, model selection, aspect ratios, previews, and downloads.
- **Video:** text-to-video, optional first-frame input, duration/size controls, supported audio generation, playback, and downloads.
- **Audio:** text-to-speech with multiple providers/voices, speech-to-text from local recordings, and ElevenLabs speech-to-speech voice conversion.
- **OCR:** image/document text extraction with AWS Textract or Mistral OCR, copy, and text download.
- **Persistence:** conversations, selected model, and UI preferences are stored locally in the browser.
- **Responsive UI:** desktop sidebar, mobile drawer, keyboard shortcuts, loading/error states, and no horizontal page overflow at the tested viewports.

## Quick start

### Requirements

- Node.js **22.19 or newer** (also satisfies REA’s requirement)
- npm 10+
- A WebGPU-capable browser for on-device AI; a current modern browser for the rest of the UI
- Enough device GPU memory and storage for the local model you select
- A Puter account only when you intentionally use hosted AI features

### Install and run

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The landing page is `/`; the Studio is `/app`.

There are **no environment variables, provider API keys, or application secrets** to configure. WebLLM handles local inference; Puter.js handles hosted authentication in the browser.

## Using credit-free local AI

1. Open **AI Studio**. **SmolLM2 360M** is the default for new sessions.
2. Keep a `local:` model selected and submit a prompt. No Puter sign-in is needed.
3. On the first use, allow the selected model files to download and remain on the page while the runtime initializes. Subsequent runs reuse the browser’s model cache.

Local inference has **no API keys, subscriptions, per-message credits, or application-enforced message quota**. It is limited by your device’s WebGPU support, GPU memory, compute, storage, browser behavior, and the chosen model’s license. Smaller models are faster and less capable; larger models need more resources. The first model download can be substantial and requires network access to WebLLM’s public model hosts.

The model picker labels local models with estimated GPU memory. Phi 3.5 Vision supports local image input; the other included local models are text-only. Local chat’s **Read aloud** action uses browser speech playback instead of hosted Puter TTS.

This does **not** make hosted GPT, Claude, Gemini, or other proprietary models unlimited. Select a hosted model only when you accept Puter’s account usage terms.

## Using hosted Puter AI

1. Open **AI Studio** and choose **Sign in** when prompted by Puter.
2. Select a model or capability.
3. Submit a prompt or upload an input file.

Puter uses a **user-pays** model. Usage is covered by the signed-in user’s Puter account; provider pricing, model availability, balances, and quotas still apply. This project does not bypass provider billing, and “500+ models” does not mean every model is free.

Image, video, audio, and OCR panels default to Puter’s documented **test mode**, which returns sample output without using credits. Turn test mode off only when you intentionally want a live request. Chat requests are live only after you explicitly submit them.

If the live model catalog cannot be reached, the picker displays a small fallback catalog and explains that the live list is unavailable. It never presents that fallback as a complete live catalog.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on `0.0.0.0` |
| `npm run build` | Run TypeScript validation and create the production build |
| `npm run preview` | Serve the production build |
| `npm test` | Run the non-networked Vitest suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:visual` | Run Chromium desktop/mobile smoke checks and capture screenshots |

The visual check expects the app at `http://127.0.0.1:5173` by default. To test a production preview instead:

```bash
npm run build
npm run preview -- --port 4173
# In another terminal:
BASE_URL=http://127.0.0.1:4173 npm run test:visual
```

Screenshots and the browser report are written to `.cache/screenshots/`. The script uses Sparticuz Chromium and its bundled runtime libraries for the minimal Linux container. It makes no paid AI calls and forces the unsupported-WebGPU path so its local compatibility check cannot download model weights.

## Project structure

```text
src/
  components/
    LandingPage.tsx       Reference-derived public page
    PromptBox.tsx         Coding prompt and agent actions
    Studio.tsx            Authenticated Studio shell and persistence
    ChatPanel.tsx         Streaming chat and attachments
    ModelPicker.tsx       Dynamic model catalog and filters
    CapabilityPanel.tsx   Image, video, audio, and OCR workspaces
  lib/
    local.ts              On-device model catalog and WebLLM adapter
    webllm.worker.ts      Dedicated local-inference worker
    puter.ts              Official Puter.js adapter
    utils.ts              Response/media normalization and helpers
  styles/                 Landing and Studio responsive styles
scripts/
  visual-check.mjs        Non-billing Chromium smoke verification
docs/
  SETUP.md                App and REA setup/verification
  REA-EVIDENCE.md         Reference and REA evidence record
```

## Persistence and privacy

- Conversation and UI persistence uses browser `localStorage`; clearing site data removes it.
- WebLLM model artifacts are cached separately by the browser. Clearing site data/cache may remove them and require another download.
- After local model assets are available, local prompts and responses are processed on the device rather than sent to Puter by this app.
- Selected upload files are held in memory for the current operation and are not persisted by this app.
- Hosted AI inputs are sent through Puter.js according to Puter’s authentication and provider-routing behavior.
- Arena-connected apps and REA registration are agent-side tools. They are not secretly shared with, or exposed as, end-user website integrations.

## Deployment

```bash
npm run build
```

Deploy `dist/` to a static host. Configure an SPA fallback to `index.html` for `/app`; a `vercel.json` with the required rewrites is included.

## Verification status

Verified in this workspace on **2026-10-24**:

- TypeScript and production Vite build passed.
- **19/19** non-networked tests passed, including local/hosted streaming, local cancellation and multimodal adapters, model-record validation, and the 28-provider reference directory.
- npm audit reported **0 vulnerabilities**.
- Chromium smoke checks passed at **1440×1000** and **390×844** with no runtime JavaScript errors or horizontal overflow.
- The browser check confirmed the local default, all six local model options, and the unsupported-WebGPU compatibility message without downloading a model.
- REA produced observed local DOM/page-inspection and screenshot evidence for the updated Studio.

No paid AI call or local model download was made during verification. Actual local inference still requires a user-run WebGPU browser and its first model download; hosted provider responses also require a network-capable browser and intentional Puter usage. These environment boundaries are not represented as successful end-to-end model calls.

## Documentation and references

- [Setup and REA registration](docs/SETUP.md)
- [REA and reference evidence](docs/REA-EVIDENCE.md)
- [WebLLM local-inference documentation](https://webllm.mlc.ai/docs/)
- [Puter AI Gateway reference](https://developer.puter.com/ai/)
- [Puter AI documentation](https://docs.puter.com/AI/)
- [Puter model directory](https://developer.puter.com/ai/models/)
