import { prebuiltAppConfig } from '@mlc-ai/web-llm'
import { describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../types'
import {
  getLocalModel,
  isLocalModelId,
  localModels,
  streamWithLocalEngine,
  toLocalApiMessages,
  type LocalChatEngine,
} from './local'

const userMessage: ChatMessage = {
  id: 'user-1',
  role: 'user',
  content: 'Hello',
  createdAt: 1,
}

describe('browser-local AI', () => {
  it('offers unique low-resource models with valid WebLLM runtime IDs', () => {
    const available = new Set(prebuiltAppConfig.model_list.map(model => model.model_id))
    expect(localModels.length).toBeGreaterThanOrEqual(6)
    expect(new Set(localModels.map(model => model.id)).size).toBe(localModels.length)
    expect(localModels.every(model => model.provider === 'local' && available.has(model.runtimeId))).toBe(true)
    expect(localModels[0].vramMB).toBeLessThan(1024)
    expect(isLocalModelId(localModels[0].id)).toBe(true)
    expect(isLocalModelId('gpt-5.4-nano')).toBe(false)
    expect(getLocalModel(localModels[0].id)?.runtimeId).toBe(localModels[0].runtimeId)
  })

  it('converts vision input and rejects attachments for text-only models before loading', () => {
    const vision = localModels.find(model => model.vision)
    expect(vision).toBeDefined()
    const attachment = { name: 'pixel.png', type: 'image/png', dataUrl: 'data:image/png;base64,AA==' }
    const messages = [{ ...userMessage, attachment }]
    expect(toLocalApiMessages(messages, vision!)[0].content).toEqual([
      { type: 'text', text: 'Hello' },
      { type: 'image_url', image_url: { url: attachment.dataUrl } },
    ])
    expect(() => toLocalApiMessages(messages, localModels[0])).toThrow(/text-only/)
  })

  it('streams OpenAI-compatible local deltas in order', async () => {
    async function* chunks() {
      yield { choices: [{ delta: { content: 'Hello' } }] }
      yield { choices: [{ delta: { content: ' local' } }] }
      yield { choices: [{ delta: { content: ' world' } }] }
    }
    const create = vi.fn().mockResolvedValue(chunks())
    const engine = {
      chat: { completions: { create } },
      interruptGenerate: vi.fn(),
    } as unknown as LocalChatEngine
    const onText = vi.fn()
    const result = await streamWithLocalEngine(engine, [userMessage], localModels[0], undefined, onText)
    expect(result).toBe('Hello local world')
    expect(onText.mock.calls.map(call => call[0])).toEqual(['Hello', ' local', ' world'])
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ stream: true }))
  })

  it('interrupts the local engine when generation is aborted', async () => {
    async function* chunks() {
      yield { choices: [{ delta: { content: 'partial' } }] }
      yield { choices: [{ delta: { content: 'not reached' } }] }
    }
    const interruptGenerate = vi.fn()
    const engine = {
      chat: { completions: { create: vi.fn().mockResolvedValue(chunks()) } },
      interruptGenerate,
    } as unknown as LocalChatEngine
    const controller = new AbortController()
    await expect(streamWithLocalEngine(
      engine,
      [userMessage],
      localModels[0],
      controller.signal,
      () => controller.abort(),
    )).rejects.toMatchObject({ name: 'AbortError' })
    await vi.waitFor(() => expect(interruptGenerate).toHaveBeenCalledTimes(1))
  })
})
