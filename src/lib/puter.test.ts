import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  chat: vi.fn(),
  listModels: vi.fn(),
  listModelProviders: vi.fn(),
  txt2img: vi.fn(),
  img2txt: vi.fn(),
  txt2speech: vi.fn(),
  speech2txt: vi.fn(),
  speech2speech: vi.fn(),
  txt2vid: vi.fn(),
}))

vi.mock('@heyputer/puter.js', () => ({
  default: {
    ai: mocks,
    auth: { isSignedIn: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), getUser: vi.fn() },
  },
}))

import { listPuterModels, streamChat } from './puter'

describe('Puter adapter without network or billing', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and sorts the live model catalog', async () => {
    mocks.listModels.mockResolvedValue([
      { id: 'z-model', provider: 'z' },
      { id: 'a-model', provider: 'a', name: 'A model' },
    ])
    const models = await listPuterModels()
    expect(models.map(model => model.id)).toEqual(['a-model', 'z-model'])
    expect(mocks.listModels).toHaveBeenCalledOnce()
  })

  it('rejects an invalid catalog instead of showing an empty live list', async () => {
    mocks.listModels.mockResolvedValue({ invalid: true })
    await expect(listPuterModels()).rejects.toThrow('invalid model catalog')
  })

  it('passes conversation history and aggregates streamed text', async () => {
    mocks.chat.mockResolvedValue((async function * () {
      yield { text: 'Hello ' }
      yield { delta: { text: 'world' } }
    })())
    let text = ''
    const result = await streamChat([
      { id: '1', role: 'user', content: 'Hi', createdAt: 1 },
    ], 'test-model', undefined, chunk => { text += chunk })
    expect(result).toBe('Hello world')
    expect(text).toBe('Hello world')
    expect(mocks.chat).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Hi' }],
      expect.objectContaining({ model: 'test-model', stream: true, normalize: true }),
    )
  })

  it('maps image attachments to multimodal message content', async () => {
    mocks.chat.mockResolvedValue({ message: { content: 'I see an image.' } })
    await streamChat([
      { id: '1', role: 'user', content: 'Describe it', createdAt: 1, attachment: { name: 'pixel.png', type: 'image/png', dataUrl: 'data:image/png;base64,AA==' } },
    ], 'vision-model', undefined, () => undefined)
    const [messages] = mocks.chat.mock.calls[0]
    expect(messages[0].content[1]).toEqual({ type: 'image_url', image_url: { url: 'data:image/png;base64,AA==' } })
  })
})
