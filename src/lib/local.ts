import type { InitProgressReport, MLCEngineInterface } from '@mlc-ai/web-llm'
import type { ChatMessage, LocalProgress, PuterModel } from '../types'

export interface LocalModel extends PuterModel {
  provider: 'local'
  runtimeId: string
  vramMB: number
  vision?: boolean
}

export const localModels: LocalModel[] = [
  {
    id: 'local:smollm2-360m',
    runtimeId: 'SmolLM2-360M-Instruct-q4f32_1-MLC',
    name: 'SmolLM2 360M',
    provider: 'local',
    context: 4096,
    vramMB: 580,
  },
  {
    id: 'local:llama-3.2-1b',
    runtimeId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    provider: 'local',
    context: 4096,
    vramMB: 879,
  },
  {
    id: 'local:qwen-2.5-1.5b',
    runtimeId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B',
    provider: 'local',
    context: 4096,
    vramMB: 1630,
  },
  {
    id: 'local:llama-3.2-3b',
    runtimeId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    provider: 'local',
    context: 4096,
    vramMB: 2264,
  },
  {
    id: 'local:qwen-2.5-coder-3b',
    runtimeId: 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 Coder 3B',
    provider: 'local',
    context: 4096,
    vramMB: 2505,
  },
  {
    id: 'local:phi-3.5-vision',
    runtimeId: 'Phi-3.5-vision-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Vision',
    provider: 'local',
    context: 4096,
    vramMB: 4522,
    vision: true,
  },
]

interface LocalApiMessage {
  role: ChatMessage['role']
  content: string | Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >
}

interface LocalChunk {
  choices: Array<{ delta: { content?: string | null } }>
}

export interface LocalChatEngine {
  chat: {
    completions: {
      create(request: {
        messages: LocalApiMessage[]
        stream: true
        stream_options: { include_usage: boolean }
      }): Promise<AsyncIterable<LocalChunk>>
    }
  }
  interruptGenerate(): void | Promise<void>
}

type ProgressHandler = (progress: LocalProgress | null) => void

let enginePromise: Promise<LocalChatEngine> | null = null
let worker: Worker | null = null
let loadedRuntimeId: string | null = null
let progressHandler: ProgressHandler | undefined

export function isLocalModelId(id: string) {
  return id.startsWith('local:')
}

export function getLocalModel(id: string) {
  return localModels.find(model => model.id === id)
}

export function supportsWebGPU() {
  if (typeof navigator === 'undefined') return false
  return Boolean((navigator as Navigator & { gpu?: unknown }).gpu)
}

export function toLocalApiMessages(messages: ChatMessage[], model: LocalModel): LocalApiMessage[] {
  return messages.filter(message => !message.error).map(message => {
    if (message.attachment && message.role === 'user') {
      if (!model.vision) {
        throw new Error(`${model.name} is text-only. Choose Phi 3.5 Vision for local image chat, or remove the attachment.`)
      }
      return {
        role: message.role,
        content: [
          { type: 'text' as const, text: message.content || 'Describe this image.' },
          { type: 'image_url' as const, image_url: { url: message.attachment.dataUrl } },
        ],
      }
    }
    return { role: message.role, content: message.content }
  })
}

export async function streamWithLocalEngine(
  engine: LocalChatEngine,
  messages: ChatMessage[],
  model: LocalModel,
  signal: AbortSignal | undefined,
  onText: (text: string) => void,
) {
  const interrupt = () => {
    void Promise.resolve().then(() => engine.interruptGenerate()).catch(() => undefined)
  }
  signal?.addEventListener('abort', interrupt, { once: true })
  try {
    signal?.throwIfAborted()
    const chunks = await engine.chat.completions.create({
      messages: toLocalApiMessages(messages, model),
      stream: true,
      stream_options: { include_usage: true },
    })
    let result = ''
    for await (const chunk of chunks) {
      signal?.throwIfAborted()
      const text = chunk.choices[0]?.delta.content ?? ''
      if (text) {
        result += text
        onText(text)
      }
    }
    return result
  } finally {
    signal?.removeEventListener('abort', interrupt)
  }
}

async function ensureLocalEngine(model: LocalModel, onProgress?: ProgressHandler) {
  progressHandler = onProgress
  if (!enginePromise) {
    enginePromise = (async () => {
      const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm')
      worker = new Worker(new URL('./webllm.worker.ts', import.meta.url), { type: 'module' })
      const engine = await CreateWebWorkerMLCEngine(worker, model.runtimeId, {
        initProgressCallback: (report: InitProgressReport) => progressHandler?.(report),
      })
      loadedRuntimeId = model.runtimeId
      return engine as unknown as LocalChatEngine
    })()
  }

  try {
    const engine = await enginePromise
    if (loadedRuntimeId !== model.runtimeId) {
      await (engine as unknown as MLCEngineInterface).reload(model.runtimeId)
      loadedRuntimeId = model.runtimeId
    }
    return engine
  } catch (error) {
    if (!loadedRuntimeId) {
      enginePromise = null
      worker?.terminate()
      worker = null
    }
    throw error
  }
}

export async function streamLocalChat(
  messages: ChatMessage[],
  modelId: string,
  signal: AbortSignal | undefined,
  onText: (text: string) => void,
  onProgress?: ProgressHandler,
) {
  const model = getLocalModel(modelId)
  if (!model) throw new Error('Choose a valid on-device model.')
  // Validate attachments before starting a potentially large model download.
  toLocalApiMessages(messages, model)
  if (!supportsWebGPU()) {
    throw new Error('Local AI needs WebGPU. Use a current WebGPU-capable browser or choose a hosted Puter model instead.')
  }
  signal?.throwIfAborted()
  onProgress?.({ progress: 0, text: `Preparing ${model.name} on your device…` })
  const engine = await ensureLocalEngine(model, onProgress)
  signal?.throwIfAborted()
  onProgress?.(null)
  return streamWithLocalEngine(engine, messages, model, signal, onText)
}
