import type { PuterModel } from '../types'

export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function formatModelName(model: PuterModel) {
  if (model.name) return model.name.replace(/\s+(Free)$/i, '')
  const tail = model.id.split('/').at(-1) ?? model.id
  return tail
    .replace(/:(free|flex|priority)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

export function formatProvider(provider: string) {
  const names: Record<string, string> = {
    openai: 'OpenAI', claude: 'Claude', anthropic: 'Anthropic', google: 'Google',
    xai: 'xAI', deepseek: 'DeepSeek', minimax: 'MiniMax', meta: 'Meta Llama',
    mistral: 'Mistral AI', mistralai: 'Mistral AI', openrouter: 'OpenRouter',
  }
  return names[provider.toLowerCase()] ?? provider.replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

export function isFreeModel(model: PuterModel) {
  if (model.id.endsWith(':free')) return true
  return model.cost?.input === 0 && model.cost?.output === 0
}

export function formatContext(value?: number) {
  if (!value) return null
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M context`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K context`
  return `${value} tokens`
}

export function formatModelCost(model: PuterModel) {
  if (isFreeModel(model)) return 'Free variant'
  const cost = model.cost
  if (!cost || cost.input == null) return null
  const tokens = cost.tokens ?? 1_000_000
  const divisor = cost.currency === 'usd-cents' ? 100 : 1
  const input = (cost.input / divisor).toFixed(cost.input < 100 ? 2 : 0)
  const output = cost.output == null ? null : (cost.output / divisor).toFixed(cost.output < 100 ? 2 : 0)
  return `$${input}${output ? ` / $${output}` : ''} per ${tokens === 1_000_000 ? '1M' : tokens} tokens`
}

export function createConversationTitle(prompt: string) {
  const normalized = prompt.replace(/\s+/g, ' ').trim()
  if (!normalized) return 'New chat'
  return normalized.length > 46 ? `${normalized.slice(0, 45)}…` : normalized
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return 'Generation stopped.'
    return error.message
  }
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const candidate = error as { message?: unknown; error?: { message?: unknown }; code?: unknown }
    if (typeof candidate.message === 'string') return candidate.message
    if (candidate.error && typeof candidate.error.message === 'string') return candidate.error.message
    if (typeof candidate.code === 'string') return candidate.code.replaceAll('_', ' ')
  }
  return 'Something went wrong. Please try again.'
}

export function extractResponseText(response: unknown): string {
  if (typeof response === 'string') return response
  if (!response || typeof response !== 'object') return ''
  const value = response as {
    text?: unknown
    content?: unknown
    delta?: { text?: unknown; content?: unknown }
    message?: { content?: unknown; text?: unknown }
  }
  const candidates = [value.delta?.text, value.delta?.content, value.text, value.message?.text, value.message?.content, value.content]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate) return candidate
    if (Array.isArray(candidate)) {
      const text = candidate.map(part => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') return part.text
        return ''
      }).join('')
      if (text) return text
    }
  }
  return ''
}

export function mediaToUrl(media: unknown): string {
  if (typeof media === 'string') return media
  if (!media || typeof media !== 'object') return ''
  const value = media as { src?: unknown; url?: unknown; toString?: () => string }
  if (typeof value.src === 'string') return value.src
  if (typeof value.url === 'string') return value.url
  if (typeof value.toString === 'function') {
    const result = value.toString()
    if (result && result !== '[object Object]') return result
  }
  return ''
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

export function copyText(text: string) {
  return navigator.clipboard.writeText(text)
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
