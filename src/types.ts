export type StudioMode = 'chat' | 'image' | 'video' | 'audio' | 'ocr'

export interface ModelCost {
  currency?: string
  tokens?: number
  input?: number
  output?: number
}

export interface PuterModel {
  id: string
  provider: string
  name?: string
  aliases?: string[]
  context?: number
  max_tokens?: number
  cost?: ModelCost
  [key: string]: unknown
}

export interface MessageAttachment {
  name: string
  type: string
  dataUrl: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
  model?: string
  attachment?: MessageAttachment
  error?: boolean
}

export interface Conversation {
  id: string
  title: string
  model: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface PuterUser {
  username?: string
  email?: string
  [key: string]: unknown
}

export interface GeneratedResult {
  id: string
  kind: 'image' | 'video' | 'audio' | 'text'
  url?: string
  text?: string
  prompt: string
  createdAt: number
}
