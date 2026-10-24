import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUp, Check, Copy, Cpu, Image as ImageIcon, Paperclip, Square, Volume2, X } from 'lucide-react'
import { chatSuggestions } from '../data'
import type { ChatMessage, Conversation, LocalProgress, MessageAttachment } from '../types'
import { copyText, fileToDataUrl, formatModelName } from '../lib/utils'
import PuterMark from './PuterMark'

interface ChatPanelProps {
  conversation?: Conversation
  sending: boolean
  isLocal: boolean
  supportsVision: boolean
  localProgress: LocalProgress | null
  onSend: (prompt: string, attachment?: MessageAttachment) => void
  onStop: () => void
  onSpeak: (text: string) => Promise<void>
  onOpenAudio: () => void
}

function MessageView({ message, onSpeak }: { message: ChatMessage; onSpeak: (text: string) => Promise<void> }) {
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const copy = async () => {
    await copyText(message.content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  const speak = async () => {
    setSpeaking(true)
    try { await onSpeak(message.content) } finally { setSpeaking(false) }
  }

  if (message.role === 'user') {
    return (
      <div className="message-row user-message-row">
        <div className="user-message">
          {message.attachment && <img className="message-attachment" src={message.attachment.dataUrl} alt={message.attachment.name} />}
          <p>{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="message-row assistant-message-row">
      <div className="assistant-avatar"><PuterMark size={25} /></div>
      <div className="assistant-message">
        {message.content ? (
          <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div>
        ) : (
          <div className="typing-indicator" aria-label="Model is responding"><span /><span /><span /></div>
        )}
        {message.content && (
          <div className="message-actions">
            <button type="button" onClick={copy} aria-label="Copy response">{copied ? <Check /> : <Copy />}<span>{copied ? 'Copied' : 'Copy'}</span></button>
            <button type="button" onClick={speak} disabled={speaking} aria-label="Read response aloud"><Volume2 /><span>{speaking ? 'Preparing…' : 'Read aloud'}</span></button>
            {message.model && <span className="message-model">{formatModelName({ id: message.model, provider: '' })}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPanel({ conversation, sending, isLocal, supportsVision, localProgress, onSend, onStop, onSpeak, onOpenAudio }: ChatPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [attachment, setAttachment] = useState<MessageAttachment>()
  const [attachmentError, setAttachmentError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const messages = conversation?.messages ?? []
  const progressPercent = localProgress ? Math.round(Math.min(1, Math.max(0, localProgress.progress)) * 100) : 0

  useEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  useEffect(() => {
    if (isLocal && !supportsVision) setAttachment(undefined)
  }, [isLocal, supportsVision])

  const submit = () => {
    const value = prompt.trim()
    if ((!value && !attachment) || sending) return
    onSend(value || 'Describe this image.', attachment)
    setPrompt('')
    setAttachment(undefined)
    setAttachmentError('')
    if (textRef.current) textRef.current.style.height = 'auto'
  }

  const attach = async (file?: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError('Choose an image smaller than 10 MB.')
      return
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setAttachment({ name: file.name, type: file.type, dataUrl })
      setAttachmentError('')
    } catch {
      setAttachmentError('That image could not be read.')
    }
  }

  const empty = messages.length === 0
  return (
    <div className="chat-panel">
      <div className={`chat-scroll ${empty ? 'is-empty' : ''}`} ref={scrollRef}>
        {empty ? (
          <div className="chat-empty">
            <div className={`empty-mark ${isLocal ? 'is-local' : ''}`}>{isLocal ? <Cpu size={30} /> : <PuterMark size={42} />}</div>
            <h1>What can I help with?</h1>
            <p>{isLocal ? 'Run open models on your device. No API keys, sign-in, or usage credits.' : 'Chat with 500+ hosted models, or create something new.'}</p>
            <div className="suggestion-grid">
              {chatSuggestions.map(suggestion => <button type="button" key={suggestion.title} onClick={() => onSend(suggestion.prompt)}><strong>{suggestion.title}</strong><span>{suggestion.prompt.slice(0, 65)}…</span><ArrowUp /></button>)}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(message => <MessageView key={message.id} message={message} onSpeak={onSpeak} />)}
          </div>
        )}
      </div>
      <div className="composer-region">
        {isLocal && localProgress && (
          <div className="local-progress" role="status">
            <div className="local-progress-copy"><Cpu /><span>{localProgress.text}</span><strong>{progressPercent}%</strong></div>
            <div className="local-progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
            <small>Keep this tab open. Downloaded model files are cached in this browser.</small>
          </div>
        )}
        <div className={`composer ${attachment ? 'has-attachment' : ''}`}>
          {attachment && <div className="attachment-chip"><img src={attachment.dataUrl} alt="" /><span>{attachment.name}</span><button type="button" onClick={() => setAttachment(undefined)} aria-label="Remove attachment"><X /></button></div>}
          <textarea
            ref={textRef}
            rows={1}
            value={prompt}
            onChange={event => {
              setPrompt(event.target.value)
              event.target.style.height = 'auto'
              event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Ask anything"
            aria-label={isLocal ? 'Message local AI' : 'Message Puter AI'}
          />
          <div className="composer-toolbar">
            <div className="composer-tools">
              <input ref={fileInput} className="sr-only" type="file" accept="image/*" onChange={event => { void attach(event.target.files?.[0]); event.target.value = '' }} />
              <button className="composer-icon" type="button" disabled={isLocal && !supportsVision} onClick={() => fileInput.current?.click()} aria-label="Attach an image" title={isLocal && !supportsVision ? 'Choose Phi 3.5 Vision for local image chat' : 'Attach an image'}><Paperclip /></button>
              <button className="composer-icon labeled" type="button" onClick={onOpenAudio}><ImageIcon /><span>Create</span></button>
            </div>
            {sending ? <button className="send-button stop" type="button" onClick={onStop} aria-label="Stop generating"><Square /></button> : <button className="send-button" type="button" onClick={submit} disabled={!prompt.trim() && !attachment} aria-label="Send message"><ArrowUp /></button>}
          </div>
        </div>
        {attachmentError && <p className="composer-error">{attachmentError}</p>}
        <p className="composer-note">{isLocal ? 'On-device inference · no per-message credits. Speed and capacity depend on your device.' : 'Hosted by Puter · usage is covered by your Puter account. Check important information.'}</p>
      </div>
    </div>
  )
}
