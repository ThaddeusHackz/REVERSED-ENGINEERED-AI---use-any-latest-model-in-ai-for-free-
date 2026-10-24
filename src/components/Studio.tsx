import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, AudioLines, BookOpen, ChevronDown, Cpu, Image as ImageIcon, LogOut,
  Menu, MessageSquare, PanelLeft, Plus, ScanText, Search, Sparkles, Trash2,
  UserRound, Video, X,
} from 'lucide-react'
import { fallbackModels } from '../data'
import { getLocalModel, isLocalModelId, localModels, streamLocalChat } from '../lib/local'
import { generateSpeech, listPuterModels, puterAuth, streamChat } from '../lib/puter'
import { createConversationTitle, getErrorMessage, uid } from '../lib/utils'
import type { ChatMessage, Conversation, LocalProgress, MessageAttachment, PuterModel, PuterUser, StudioMode } from '../types'
import CapabilityPanel from './CapabilityPanel'
import ChatPanel from './ChatPanel'
import ModelPicker from './ModelPicker'
import PuterMark from './PuterMark'

const STORAGE_KEY = 'puter-ai-studio-conversations-v1'
const MODEL_STORAGE_KEY = 'puter-ai-studio-model-v2'

function loadSelectedModel() {
  try { return localStorage.getItem(MODEL_STORAGE_KEY) || localModels[0].id } catch { return localModels[0].id }
}

function loadConversations(): Conversation[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter(item => item && typeof item.id === 'string' && Array.isArray(item.messages)) : []
  } catch { return [] }
}

const modeItems = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'image' as const, label: 'Images', icon: ImageIcon },
  { id: 'video' as const, label: 'Video', icon: Video },
  { id: 'audio' as const, label: 'Audio', icon: AudioLines },
  { id: 'ocr' as const, label: 'OCR & documents', icon: ScanText },
]

interface SidebarProps {
  open: boolean
  isLocal: boolean
  mode: StudioMode
  conversations: Conversation[]
  activeId: string | null
  onClose: () => void
  onModeChange: (mode: StudioMode) => void
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onNavigateHome: () => void
}

function Sidebar({ open, isLocal, mode, conversations, activeId, onClose, onModeChange, onSelect, onNew, onDelete, onNavigateHome }: SidebarProps) {
  const [search, setSearch] = useState('')
  const filtered = conversations.filter(conversation => conversation.title.toLowerCase().includes(search.toLowerCase()))
  return (
    <>
      {open && <button className="sidebar-scrim" type="button" onClick={onClose} aria-label="Close sidebar" />}
      <aside className={`studio-sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand"><button type="button" onClick={onNavigateHome}><PuterMark size={29} /><span>Puter <em>AI</em></span></button><button className="sidebar-close" type="button" onClick={onClose} aria-label="Close sidebar"><X /></button></div>
        <button className="new-chat-button" type="button" onClick={onNew}><Plus /><span>New chat</span><kbd>⌘ K</kbd></button>
        <label className="history-search"><Search /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search chats" /></label>
        <nav className="studio-mode-nav" aria-label="AI capabilities">
          {modeItems.map(({ id, label, icon: Icon }) => <button className={mode === id ? 'active' : ''} type="button" key={id} onClick={() => onModeChange(id)}><Icon /><span>{label}</span>{id === 'image' && <Sparkles className="mode-sparkle" />}</button>)}
        </nav>
        <div className="sidebar-history">
          <div className="sidebar-section-label">Your chats</div>
          {filtered.length ? filtered.map(conversation => (
            <div className={`history-item ${activeId === conversation.id && mode === 'chat' ? 'active' : ''}`} key={conversation.id}>
              <button type="button" onClick={() => onSelect(conversation.id)} title={conversation.title}><MessageSquare /><span>{conversation.title}</span></button>
              <button className="history-delete" type="button" onClick={() => onDelete(conversation.id)} aria-label={`Delete ${conversation.title}`}><Trash2 /></button>
            </div>
          )) : <p className="history-empty">{search ? 'No chats match your search.' : 'Your conversations will appear here.'}</p>}
        </div>
        <div className="sidebar-footer">
          <button type="button" onClick={onNavigateHome}><ArrowLeft /><span>AI Gateway home</span></button>
          <a href="https://docs.puter.com/AI/" target="_blank" rel="noreferrer"><BookOpen /><span>Puter AI docs</span></a>
          <div className="sidebar-powered"><span className="status-dot" /> {isLocal ? 'On-device · WebLLM · no credits' : 'Hosted by Puter · user-pays'}</div>
        </div>
      </aside>
    </>
  )
}

export default function Studio({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [initial] = useState(loadConversations)
  const [conversations, setConversations] = useState<Conversation[]>(initial)
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null)
  const [mode, setMode] = useState<StudioMode>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [models, setModels] = useState<PuterModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [catalogLive, setCatalogLive] = useState(false)
  const [catalogAttempt, setCatalogAttempt] = useState(0)
  const [selectedModel, setSelectedModel] = useState(loadSelectedModel)
  const [localProgress, setLocalProgress] = useState<LocalProgress | null>(null)
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<PuterUser | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [toast, setToast] = useState('')
  const abortController = useRef<AbortController | null>(null)
  const activeConversation = conversations.find(conversation => conversation.id === activeId)
  const visibleModels = [...localModels, ...(models.length ? models : fallbackModels)]
  const isLocal = isLocalModelId(selectedModel)
  const localChatActive = mode === 'chat' && isLocal

  const notify = (message: string) => setToast(message)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)) } catch { setToast('Chat history is full. Delete an older conversation or export important chats.') }
  }, [conversations])

  useEffect(() => {
    try { localStorage.setItem(MODEL_STORAGE_KEY, selectedModel) } catch { /* Model selection is still retained for this session. */ }
  }, [selectedModel])

  useEffect(() => {
    let cancelled = false
    setModelsLoading(true)
    setModelsError(null)
    listPuterModels()
      .then(result => {
        if (cancelled) return
        setModels(result)
        setCatalogLive(true)
        setSelectedModel(current => isLocalModelId(current) || result.some(model => model.id === current) ? current : result[0]?.id ?? current)
      })
      .catch(reason => {
        if (cancelled) return
        setCatalogLive(false)
        setModelsError(getErrorMessage(reason))
      })
      .finally(() => { if (!cancelled) setModelsLoading(false) })
    return () => { cancelled = true }
  }, [catalogAttempt])

  useEffect(() => {
    if (puterAuth.isSignedIn()) puterAuth.getUser().then(setUser).catch(() => undefined)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        newChat()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const newChat = () => {
    abortController.current?.abort()
    setActiveId(null)
    setMode('chat')
    setSidebarOpen(false)
  }

  const chooseMode = (next: StudioMode) => {
    setMode(next)
    setSidebarOpen(false)
  }

  const selectModel = (id: string) => {
    setSelectedModel(id)
    if (activeId) setConversations(previous => previous.map(conversation => conversation.id === activeId ? { ...conversation, model: id } : conversation))
  }

  const deleteConversation = (id: string) => {
    if (id === activeId) abortController.current?.abort()
    setConversations(previous => {
      const next = previous.filter(conversation => conversation.id !== id)
      if (id === activeId) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  const sendMessage = async (prompt: string, attachment?: MessageAttachment) => {
    if (sending) return
    const now = Date.now()
    const modelForRequest = selectedModel
    const useLocalModel = isLocalModelId(modelForRequest)
    const id = activeConversation?.id ?? uid()
    const history = activeConversation?.messages ?? []
    const userMessage: ChatMessage = { id: uid(), role: 'user', content: prompt, createdAt: now, attachment }
    const assistantId = uid()
    const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', content: '', createdAt: now, model: modelForRequest }
    const nextConversation: Conversation = {
      id,
      title: activeConversation?.title ?? createConversationTitle(prompt),
      model: modelForRequest,
      messages: [...history, userMessage, assistantMessage],
      createdAt: activeConversation?.createdAt ?? now,
      updatedAt: now,
    }
    setActiveId(id)
    setConversations(previous => [nextConversation, ...previous.filter(conversation => conversation.id !== id)])
    setSending(true)
    const controller = new AbortController()
    abortController.current = controller

    const updateAssistant = (text: string, append: boolean, error = false) => {
      setConversations(previous => previous.map(conversation => conversation.id === id ? {
        ...conversation,
        updatedAt: Date.now(),
        messages: conversation.messages.map(message => message.id === assistantId ? { ...message, content: append ? message.content + text : text, error } : message),
      } : conversation))
    }

    try {
      setLocalProgress(null)
      const result = useLocalModel
        ? await streamLocalChat([...history, userMessage], modelForRequest, controller.signal, text => updateAssistant(text, true), progress => setLocalProgress(progress))
        : await streamChat([...history, userMessage], modelForRequest, controller.signal, text => updateAssistant(text, true))
      if (!result.trim()) updateAssistant('The model returned an empty response. Try again or choose another model.', false)
    } catch (reason) {
      if (controller.signal.aborted) {
        setConversations(previous => previous.map(conversation => conversation.id === id ? { ...conversation, messages: conversation.messages.map(message => message.id === assistantId && !message.content ? { ...message, content: 'Generation stopped.' } : message) } : conversation))
      } else {
        updateAssistant(`I couldn’t complete that request: ${getErrorMessage(reason)}`, false, true)
      }
    } finally {
      abortController.current = null
      setLocalProgress(null)
      setSending(false)
    }
  }

  const signIn = async () => {
    setAuthBusy(true)
    try {
      await puterAuth.signIn()
      setUser(await puterAuth.getUser())
      notify('Signed in to Puter. Live models and generations are ready.')
      setAccountOpen(false)
    } catch (reason) { notify(getErrorMessage(reason)) } finally { setAuthBusy(false) }
  }

  const signOut = async () => {
    setAuthBusy(true)
    try {
      await puterAuth.signOut()
      setUser(null)
      setAccountOpen(false)
      notify('Signed out of Puter.')
    } catch (reason) { notify(getErrorMessage(reason)) } finally { setAuthBusy(false) }
  }

  const speakResponse = async (text: string) => {
    try {
      if (isLocal) {
        if (!('speechSynthesis' in window)) throw new Error('This browser does not provide speech playback.')
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0, 3000)))
        return
      }
      const url = await generateSpeech(text.slice(0, 3000), { provider: 'openai', voice: 'alloy' })
      if (!url) throw new Error('Puter did not return audio.')
      await new Audio(url).play()
    } catch (reason) { notify(getErrorMessage(reason)) }
  }

  const modeLabel = modeItems.find(item => item.id === mode)?.label ?? 'Chat'
  return (
    <div className="studio-shell">
      <Sidebar open={sidebarOpen} isLocal={localChatActive} mode={mode} conversations={conversations} activeId={activeId} onClose={() => setSidebarOpen(false)} onModeChange={chooseMode} onSelect={id => { setActiveId(id); setMode('chat'); setSidebarOpen(false) }} onNew={newChat} onDelete={deleteConversation} onNavigateHome={onNavigateHome} />
      <section className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-left"><button className="mobile-sidebar-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu /></button><button className="desktop-sidebar-button" type="button" onClick={() => setSidebarOpen(value => !value)} aria-label="Toggle sidebar"><PanelLeft /></button>{mode === 'chat' ? <ModelPicker models={visibleModels} selectedModel={selectedModel} onSelect={selectModel} loading={modelsLoading} error={modelsError} onRetry={() => setCatalogAttempt(value => value + 1)} live={catalogLive} /> : <div className="mode-topbar-title">{modeLabel}</div>}</div>
          <div className="topbar-right">
            {localChatActive ? <a className="puter-user-pays local-mode-pill" href="https://webllm.mlc.ai/docs/" target="_blank" rel="noreferrer"><Cpu /> On-device · no credits</a> : <a className="puter-user-pays" href="https://docs.puter.com/user-pays-model/" target="_blank" rel="noreferrer"><span className="status-dot" /> User-pays</a>}
            {user ? <div className="account-menu"><button className="account-avatar" type="button" onClick={() => setAccountOpen(value => !value)} aria-label="Open Puter account menu">{(user.username ?? user.email ?? 'P').slice(0, 1).toUpperCase()}<ChevronDown /></button>{accountOpen && <div className="account-popover"><span>Signed in to Puter</span><strong>{user.username ?? user.email ?? 'Puter user'}</strong><button type="button" disabled={authBusy} onClick={signOut}><LogOut /> Sign out</button></div>}</div> : <button className="sign-in-button" type="button" disabled={authBusy} onClick={signIn}><UserRound />{authBusy ? 'Connecting…' : 'Sign in'}</button>}
          </div>
        </header>
        <div className="studio-content">
          {mode === 'chat' ? <ChatPanel key={activeId ?? 'new-chat'} conversation={activeConversation} sending={sending} isLocal={isLocal} supportsVision={Boolean(getLocalModel(selectedModel)?.vision)} localProgress={localProgress} onSend={sendMessage} onStop={() => abortController.current?.abort()} onSpeak={speakResponse} onOpenAudio={() => setMode('image')} /> : <CapabilityPanel key={mode} mode={mode} onToast={notify} />}
        </div>
      </section>
      {toast && <div className="studio-toast" role="status"><Sparkles /><span>{toast}</span><button type="button" onClick={() => setToast('')} aria-label="Dismiss notification"><X /></button></div>}
    </div>
  )
}
