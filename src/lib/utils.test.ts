import { describe, expect, it } from 'vitest'
import {
  createConversationTitle, extractResponseText, formatContext, formatModelName,
  getErrorMessage, isFreeModel, mediaToUrl,
} from './utils'

describe('model presentation', () => {
  it('formats model IDs without losing provider information', () => {
    expect(formatModelName({ id: 'deepseek/deepseek-v4.1-flash:free', provider: 'deepseek' })).toBe('Deepseek V4.1 Flash')
    expect(formatModelName({ id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', provider: 'openai' })).toBe('GPT-5.4 Nano')
  })

  it('recognizes free variants from IDs and cost metadata', () => {
    expect(isFreeModel({ id: 'vendor/model:free', provider: 'vendor' })).toBe(true)
    expect(isFreeModel({ id: 'vendor/model', provider: 'vendor', cost: { input: 0, output: 0 } })).toBe(true)
    expect(isFreeModel({ id: 'vendor/model', provider: 'vendor', cost: { input: 1, output: 2 } })).toBe(false)
  })

  it('formats context windows compactly', () => {
    expect(formatContext(1_000_000)).toBe('1M context')
    expect(formatContext(262_000)).toBe('262K context')
    expect(formatContext(undefined)).toBeNull()
  })
})

describe('Puter response normalization', () => {
  it('extracts normalized chat responses', () => {
    expect(extractResponseText({ message: { content: 'Hello from Puter' } })).toBe('Hello from Puter')
  })

  it('extracts provider content blocks', () => {
    expect(extractResponseText({ message: { content: [{ type: 'text', text: 'Hello ' }, { type: 'text', text: 'world' }] } })).toBe('Hello world')
  })

  it('extracts streamed deltas', () => {
    expect(extractResponseText({ delta: { text: 'next token' } })).toBe('next token')
  })

  it('extracts browser media URLs', () => {
    expect(mediaToUrl({ src: 'https://example.com/image.png' })).toBe('https://example.com/image.png')
    expect(mediaToUrl('https://example.com/audio.mp3')).toBe('https://example.com/audio.mp3')
  })
})

describe('chat utilities', () => {
  it('creates clean bounded conversation titles', () => {
    expect(createConversationTitle('  Build\n an   AI app  ')).toBe('Build an AI app')
    expect(createConversationTitle('x'.repeat(80))).toHaveLength(46)
    expect(createConversationTitle('')).toBe('New chat')
  })

  it('surfaces provider and nested error messages', () => {
    expect(getErrorMessage({ message: 'insufficient_funds' })).toBe('insufficient_funds')
    expect(getErrorMessage({ error: { message: 'Model unavailable' } })).toBe('Model unavailable')
    expect(getErrorMessage(new DOMException('Aborted', 'AbortError'))).toBe('Generation stopped.')
  })
})
