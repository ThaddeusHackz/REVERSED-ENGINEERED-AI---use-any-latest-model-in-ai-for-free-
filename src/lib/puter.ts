import puter from '@heyputer/puter.js'
import type { ChatMessage, PuterModel, PuterUser } from '../types'
import { extractResponseText, mediaToUrl } from './utils'

interface ChatOptions {
  model: string
  stream?: boolean
  signal?: AbortSignal
  normalize?: boolean
  temperature?: number
}

interface PuterAI {
  chat(messages: unknown, options?: ChatOptions): Promise<unknown>
  listModels(provider?: string | null): Promise<unknown>
  listModelProviders(): Promise<unknown>
  txt2img(prompt: string, options?: Record<string, unknown>): Promise<unknown>
  img2txt(source: File | string, options?: Record<string, unknown>): Promise<unknown>
  txt2speech(text: string, options?: Record<string, unknown>): Promise<unknown>
  speech2txt(source: File | string, options?: Record<string, unknown>): Promise<unknown>
  speech2speech(source: File | string, options?: Record<string, unknown>): Promise<unknown>
  txt2vid(prompt: string, options?: Record<string, unknown>): Promise<unknown>
}

interface PuterAuth {
  isSignedIn(): boolean
  signIn(): Promise<unknown>
  signOut(): Promise<unknown>
  getUser(): Promise<PuterUser>
}

const ai = puter.ai as unknown as PuterAI
const auth = puter.auth as unknown as PuterAuth

function toApiMessages(messages: ChatMessage[]) {
  return messages.filter(message => !message.error).map(message => {
    if (message.attachment && message.role === 'user') {
      return {
        role: message.role,
        content: [
          { type: 'text', text: message.content || 'Describe this image.' },
          { type: 'image_url', image_url: { url: message.attachment.dataUrl } },
        ],
      }
    }
    return { role: message.role, content: message.content }
  })
}

export async function listPuterModels(): Promise<PuterModel[]> {
  const response = await ai.listModels()
  if (!Array.isArray(response)) throw new Error('Puter returned an invalid model catalog.')
  return response
    .filter(model => model && typeof model === 'object' && typeof model.id === 'string')
    .map(model => ({ ...model, provider: String(model.provider ?? 'other') }))
    .sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id))
}

export async function streamChat(
  messages: ChatMessage[],
  model: string,
  signal: AbortSignal | undefined,
  onText: (text: string) => void,
) {
  const apiMessages = toApiMessages(messages)
  const response = await ai.chat(apiMessages, { model, stream: true, signal, normalize: true })
  if (!response || typeof response !== 'object' || !(Symbol.asyncIterator in response)) {
    const text = extractResponseText(response)
    if (text) onText(text)
    return text
  }
  let result = ''
  for await (const chunk of response as AsyncIterable<unknown>) {
    const text = extractResponseText(chunk)
    if (text) {
      result += text
      onText(text)
    }
  }
  return result
}

export async function generateImage(prompt: string, options: Record<string, unknown>) {
  return mediaToUrl(await ai.txt2img(prompt, options))
}

export async function generateVideo(prompt: string, options: Record<string, unknown>) {
  return mediaToUrl(await ai.txt2vid(prompt, options))
}

export async function generateSpeech(text: string, options: Record<string, unknown>) {
  return mediaToUrl(await ai.txt2speech(text, options))
}

export async function transcribeSpeech(source: File | string, options: Record<string, unknown>) {
  const result = await ai.speech2txt(source, options)
  if (typeof result === 'string') return result
  if (result && typeof result === 'object' && 'text' in result && typeof result.text === 'string') return result.text
  return extractResponseText(result) || JSON.stringify(result, null, 2)
}

export async function changeVoice(source: File | string, options: Record<string, unknown>) {
  return mediaToUrl(await ai.speech2speech(source, options))
}

export async function readImage(source: File | string, options: Record<string, unknown>) {
  const result = await ai.img2txt(source, options)
  return typeof result === 'string' ? result : extractResponseText(result) || JSON.stringify(result, null, 2)
}

export const puterAuth = {
  isSignedIn: () => auth.isSignedIn(),
  signIn: () => auth.signIn(),
  signOut: () => auth.signOut(),
  getUser: () => auth.getUser(),
}
