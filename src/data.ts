import type { PuterModel } from './types'

export const BUILD_PROMPT = 'Build an AI chat app using Puter.js'

export const agentLinks = [
  { name: 'Claude Code', href: `claude-cli://open?q=${encodeURIComponent(`${BUILD_PROMPT} (if you need more information, read https://docs.puter.com/llms.txt)`)}` },
  { name: 'Codex', href: `codex://new?prompt=${encodeURIComponent(`${BUILD_PROMPT} (if you need more information, read https://docs.puter.com/llms.txt)`)}` },
  { name: 'Claude', href: `https://claude.ai/new?q=${encodeURIComponent(`${BUILD_PROMPT} (if you need more information, read https://docs.puter.com/llms.txt)`)}` },
  { name: 'ChatGPT', href: `https://chatgpt.com/?q=${encodeURIComponent(`${BUILD_PROMPT} (if you need more information, read https://docs.puter.com/llms.txt)`)}` },
  { name: 'Cursor', href: `https://cursor.com/link/prompt?text=${encodeURIComponent(`${BUILD_PROMPT} (if you need more information, read https://docs.puter.com/llms.txt)`)}` },
  { name: 'Lovable', href: `https://lovable.dev/?autosubmit=true#prompt=${encodeURIComponent(`${BUILD_PROMPT} (if you need more information, read https://docs.puter.com/llms.txt)`)}` },
]

export const providers = [
  { name: 'OpenAI', short: 'OA', color: '#111111', image: 'https://openai.com/favicon.svg', href: 'https://developer.puter.com/ai/openai/' },
  { name: 'Claude', short: 'CL', color: '#d97757', image: 'https://cdn.simpleicons.org/anthropic', href: 'https://developer.puter.com/ai/anthropic/' },
  { name: 'OpenRouter', short: 'OR', color: '#6562f1', image: 'https://cdn.simpleicons.org/openrouter', href: 'https://developer.puter.com/tutorials/free-unlimited-openrouter-api/' },
  { name: 'DeepSeek', short: 'DS', color: '#4d6bfe', image: 'https://developer.puter.com/assets/img/deepseek/favicon.ico', href: 'https://developer.puter.com/ai/deepseek/' },
  { name: 'Gemini', short: 'GM', color: '#4285f4', image: 'https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg', href: 'https://developer.puter.com/ai/google/' },
  { name: 'Grok', short: 'X', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://x.ai/&size=256', href: 'https://developer.puter.com/ai/x-ai/' },
  { name: 'Llama', short: 'LM', color: '#0866ff', image: 'https://cdn.simpleicons.org/meta', href: 'https://developer.puter.com/ai/meta-llama/' },
  { name: 'Microsoft', short: 'MS', color: '#737373', image: 'https://www.microsoft.com/favicon.ico?v2', href: 'https://developer.puter.com/ai/microsoft/' },
  { name: 'NVIDIA', short: 'NV', color: '#76b900', image: 'https://cdn.simpleicons.org/nvidia', href: 'https://developer.puter.com/ai/nvidia/' },
  { name: 'Mistral', short: 'MI', color: '#ff7000', image: 'https://mistral.ai/favicon.ico', href: 'https://developer.puter.com/ai/mistralai/' },
  { name: 'Amazon', short: 'A', color: '#ff9900', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://nova.amazon.com/&size=256', href: 'https://developer.puter.com/ai/amazon/' },
  { name: 'Cohere', short: 'CO', color: '#39594d', image: 'https://cohere.com/apple-touch-icon.png', href: 'https://developer.puter.com/ai/cohere/' },
  { name: 'Qwen', short: 'QW', color: '#6c5ce7', image: 'https://img.alicdn.com/imgextra/i2/O1CN01B9mlGG1msAz3fxxWL_!!6000000005009-2-tps-84-84.png', href: 'https://developer.puter.com/ai/qwen/' },
  { name: 'KwaiPilot', short: 'KP', color: '#111111', image: 'https://s16-def.ap4r.com/kos/s101/nlav112218/home-sgp/icons/favicon.svg', href: 'https://developer.puter.com/ai/kwaipilot/' },
  { name: 'ElevenLabs', short: '11', color: '#111111', image: 'https://cdn.simpleicons.org/elevenlabs', href: 'https://developer.puter.com/ai/elevenlabs/' },
  { name: 'Perplexity', short: 'PP', color: '#20808d', image: 'https://cdn.simpleicons.org/perplexity', href: 'https://developer.puter.com/ai/perplexity/' },
  { name: 'Stable Diffusion', short: 'SD', color: '#111111', image: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/804f0e8b-0028-4262-a8b0-b9f1c5de72c0/favicon.ico?format=100w', href: 'https://developer.puter.com/ai/stabilityai/' },
  { name: 'Black Forest Labs', short: 'BF', color: '#111111', image: 'https://bfl.ai/icon0.svg', href: 'https://developer.puter.com/ai/black-forest-labs/' },
  { name: 'ByteDance', short: 'BD', color: '#111111', image: 'https://cdn.simpleicons.org/bytedance', href: 'https://developer.puter.com/ai/bytedance-seed/' },
  { name: 'Moonshot', short: 'MS', color: '#111111', image: 'https://avatars.githubusercontent.com/u/129152888', href: 'https://developer.puter.com/ai/moonshotai/' },
  { name: 'Z.ai', short: 'Z', color: '#4468e8', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/model-api&size=256', href: 'https://developer.puter.com/ai/z-ai/' },
  { name: 'Minimax', short: 'MM', color: '#f54d42', image: 'https://avatars.githubusercontent.com/u/194880281', href: 'https://developer.puter.com/ai/minimax/' },
  { name: 'Inception Labs', short: 'IL', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.inceptionlabs.ai/&size=256', href: 'https://developer.puter.com/ai/inception/' },
  { name: 'Allen AI', short: 'AI', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://allenai.org/&size=256', href: 'https://developer.puter.com/ai/allenai/' },
  { name: 'Arcee AI', short: 'AR', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.arcee.ai/&size=256', href: 'https://developer.puter.com/ai/arcee-ai/' },
  { name: 'Liquid AI', short: 'LF', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.liquid.ai/&size=256', href: 'https://developer.puter.com/ai/liquid/' },
  { name: 'Nous Research', short: 'NR', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://nousresearch.com/&size=256', href: 'https://developer.puter.com/ai/nousresearch/' },
  { name: 'Essential AI', short: 'EA', color: '#111111', image: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.essential.ai/&size=256', href: 'https://developer.puter.com/ai/essentialai/' },
]

export const fallbackModels: PuterModel[] = [
  { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', provider: 'openai', context: 400000 },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', provider: 'openai', context: 1000000 },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'claude', context: 200000 },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'claude', context: 200000 },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'google', context: 1000000 },
  { id: 'grok-4.1', name: 'Grok 4.1', provider: 'xai', context: 256000 },
  { id: 'deepseek-v4.1-flash-1017', name: 'DeepSeek V4.1 Flash', provider: 'deepseek', context: 1000000 },
  { id: 'minimax/minimax-m3.1-flash', name: 'MiniMax M3.1 Flash', provider: 'minimax', context: 1000000 },
  { id: 'recursive/flint-v1.0:free', name: 'Flint v1.0 Free', provider: 'recursive', context: 262000, cost: { input: 0, output: 0, currency: 'usd-cents', tokens: 1000000 } },
]

export const chatSuggestions = [
  { title: 'Build an AI chat app', prompt: 'Build an AI chat app using Puter.js. Explain the architecture and provide the code.' },
  { title: 'Explain a concept', prompt: 'Explain how large language models work, using a simple analogy.' },
  { title: 'Write product copy', prompt: 'Write a concise landing page for a privacy-first AI notes app.' },
  { title: 'Plan a project', prompt: 'Create a practical seven-day launch plan for a small developer tool.' },
]

export const imageModels = [
  { id: 'gpt-image-2', label: 'GPT Image 2' },
  { id: 'gemini-3.1-flash-image', label: 'Gemini Flash Image' },
  { id: 'black-forest-labs/flux-schnell', label: 'FLUX Schnell' },
  { id: 'grok-imagine-image', label: 'Grok Imagine' },
  { id: 'seedream-5-0-lite-260128', label: 'Seedream 5.0 Lite' },
]

export const videoModels = [
  { id: 'togetherai:wan-ai/wan2.7-t2v', label: 'Wan 2.7' },
  { id: 'veo-3.1', label: 'Google Veo 3.1' },
  { id: 'kling-v3', label: 'Kling 3' },
  { id: 'seedance-2.0', label: 'Seedance 2.0' },
]
