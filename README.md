# Puter AI Gateway + Studio

An independent, responsive reconstruction of the public [Puter AI Gateway](https://developer.puter.com/ai/) page, plus a ChatGPT-style AI Studio powered by the official [`@heyputer/puter.js`](https://docs.puter.com/) SDK.

The landing page preserves the reference’s content hierarchy, visual language, provider directory, coding-prompt workflow, FAQ, and footer. The Studio adds a functional, browser-based workspace for chat and Puter’s media AI APIs—without API keys or a backend.

> **Independent project:** this is not an official Puter or OpenAI product. Puter, ChatGPT, and provider names belong to their respective owners.

## Features

### AI Gateway landing page

- Reference-derived navigation, hero, provider marquee, feature bento grid, three-step guide, provider directory, FAQ, coding-prompt modal, CTA, and footer.
- Responsive desktop/mobile layouts and an accessible mobile navigation menu.
- Working copy actions, coding-agent links, tutorial/documentation links, and direct links into the Studio.

### AI Studio

- **Chat:** live model catalog with a graceful fallback, provider filters, search, free-model indicators, streaming responses, cancellation, Markdown/GFM rendering, image attachments for vision, and conversation history.
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
- A modern browser
- A Puter account only when you choose to use live AI features

### Install and run

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The landing page is `/`; the Studio is `/app`.

There are **no environment variables, provider API keys, or application secrets** to configure. Puter.js handles authentication in the browser.

## Using live AI

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

Screenshots and the browser report are written to `.cache/screenshots/`. The script uses Sparticuz Chromium and its bundled runtime libraries for the minimal Linux container. It does not submit prompts or make paid AI calls.

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
- Selected upload files are held in memory for the current operation and are not persisted by this app.
- Live AI inputs are sent through Puter.js according to Puter’s authentication and provider-routing behavior.
- Arena-connected apps and REA registration are agent-side tools. They are not secretly shared with, or exposed as, end-user website integrations.

## Deployment

```bash
npm run build
```

Deploy `dist/` to a static host. Configure an SPA fallback to `index.html` for `/app`; a `vercel.json` with the required rewrites is included.

## Verification status

Verified in this workspace on **2026-10-24**:

- TypeScript and production Vite build passed.
- **13/13** non-networked tests passed, including streaming and multimodal adapter tests with mocks.
- npm audit reported **0 vulnerabilities**.
- Development and production Chromium smoke checks passed at **1440×1000** and **390×844** with no runtime JavaScript errors or horizontal overflow.
- REA produced observed local DOM/page-inspection and screenshot evidence.

No paid AI call was made during verification. Live provider responses could not be exercised from this sandbox because external Puter/API connections are network-blocked; use the UI with your own Puter sign-in to perform those live checks.

## Documentation and references

- [Setup and REA registration](docs/SETUP.md)
- [REA and reference evidence](docs/REA-EVIDENCE.md)
- [Puter AI Gateway reference](https://developer.puter.com/ai/)
- [Puter AI documentation](https://docs.puter.com/AI/)
- [Puter model directory](https://developer.puter.com/ai/models/)
