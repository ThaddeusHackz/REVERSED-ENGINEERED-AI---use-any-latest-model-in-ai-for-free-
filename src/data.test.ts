import { describe, expect, it } from 'vitest'
import { providers } from './data'

describe('reference provider directory', () => {
  it('contains all 28 observed providers in the two 14-provider rows', () => {
    expect(providers).toHaveLength(28)
    expect(new Set(providers.map(provider => provider.name)).size).toBe(28)
    expect(providers.slice(0, 14).map(provider => provider.name)).toEqual([
      'OpenAI', 'Claude', 'OpenRouter', 'DeepSeek', 'Gemini', 'Grok', 'Llama',
      'Microsoft', 'NVIDIA', 'Mistral', 'Amazon', 'Cohere', 'Qwen', 'KwaiPilot',
    ])
    expect(providers.slice(14).map(provider => provider.name)).toEqual([
      'ElevenLabs', 'Perplexity', 'Stable Diffusion', 'Black Forest Labs',
      'ByteDance', 'Moonshot', 'Z.ai', 'Minimax', 'Inception Labs', 'Allen AI',
      'Arcee AI', 'Liquid AI', 'Nous Research', 'Essential AI',
    ])
  })

  it('uses a valid provider destination and image for every entry', () => {
    for (const provider of providers) {
      expect(() => new URL(provider.href)).not.toThrow()
      expect(provider.href).toMatch(/^https:\/\/developer\.puter\.com\//)
      expect(provider.image).toBeTruthy()
      expect(() => new URL(provider.image)).not.toThrow()
    }
  })
})
