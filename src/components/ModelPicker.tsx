import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Cpu, RefreshCw, Search, Sparkles, X } from 'lucide-react'
import type { PuterModel } from '../types'
import { formatContext, formatModelCost, formatModelName, formatProvider, isFreeModel } from '../lib/utils'

interface ModelPickerProps {
  models: PuterModel[]
  selectedModel: string
  onSelect: (id: string) => void
  loading: boolean
  error: string | null
  onRetry: () => void
  live: boolean
}

function formatVram(value: unknown) {
  if (typeof value !== 'number') return null
  return value >= 1024 ? `${Number((value / 1024).toFixed(1))} GB GPU` : `${Math.round(value)} MB GPU`
}

export default function ModelPicker({ models, selectedModel, onSelect, loading, error, onRetry, live }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [freeOnly, setFreeOnly] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const selected = models.find(model => model.id === selectedModel) ?? models[0]
  const providers = useMemo(() => [...new Set(models.map(model => model.provider))].sort((a, b) => a === 'local' ? -1 : b === 'local' ? 1 : a.localeCompare(b)), [models])
  const localCount = models.filter(model => model.provider === 'local').length
  const hostedCount = models.length - localCount
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return models.filter(model => {
      if (provider !== 'all' && model.provider !== provider) return false
      if (freeOnly && !isFreeModel(model)) return false
      if (query && !`${model.id} ${model.name ?? ''} ${model.provider}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [models, provider, freeOnly, search])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const onPointer = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  return (
    <div className="model-picker" ref={root}>
      <button className="model-trigger" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-haspopup="dialog">
        <span className={`model-trigger-icon ${selected?.provider === 'local' ? 'is-local' : ''}`}>{selected?.provider === 'local' ? <Cpu /> : <Sparkles />}</span>
        <span>{selected ? formatModelName(selected) : selectedModel}</span>
        <ChevronDown className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <div className="model-popover" role="dialog" aria-label="Choose an AI model">
          <div className="model-popover-head">
            <div><strong>Choose a model</strong><span>{localCount} on-device · {live ? `${hostedCount} live hosted models` : 'hosted catalog unavailable'}</span></div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close model picker"><X /></button>
          </div>
          <label className="model-search"><Search /><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search models" /></label>
          <div className="model-filters">
            <select value={provider} onChange={event => setProvider(event.target.value)} aria-label="Filter by provider">
              <option value="all">All providers</option>
              {providers.map(item => <option key={item} value={item}>{formatProvider(item)}</option>)}
            </select>
            <label className="free-filter"><input type="checkbox" checked={freeOnly} onChange={event => setFreeOnly(event.target.checked)} /> Free / local</label>
          </div>
          {error && <div className="catalog-warning"><span>{error}</span><button type="button" onClick={onRetry}><RefreshCw /> Retry</button></div>}
          {loading && <div className="catalog-loading"><RefreshCw className="spin" /> Updating hosted catalog; local models are ready.</div>}
          <div className="model-list" role="listbox">
            {filtered.length === 0 ? (
              <div className="model-list-empty">No models match these filters.</div>
            ) : filtered.slice(0, 60).map(model => {
              const cost = formatModelCost(model)
              const context = formatContext(model.context)
              const vram = model.provider === 'local' ? formatVram(model.vramMB) : null
              return (
                <button className={`model-option ${model.id === selectedModel ? 'selected' : ''} ${model.provider === 'local' ? 'is-local' : ''}`} type="button" role="option" aria-selected={model.id === selectedModel} key={`${model.provider}:${model.id}`} onClick={() => { onSelect(model.id); setOpen(false) }}>
                  <span className="provider-dot">{model.provider === 'local' ? <Cpu /> : formatProvider(model.provider).slice(0, 1)}</span>
                  <span className="model-option-copy">
                    <span className="model-option-name">{formatModelName(model)}{model.provider === 'local' ? <em>Local</em> : isFreeModel(model) && <em>Free</em>}</span>
                    <span className="model-option-id">{model.id.replace(/^local:/, '')}</span>
                    <span className="model-option-meta">{formatProvider(model.provider)}{context ? ` · ${context}` : ''}{vram ? ` · ${vram}` : ''}{cost ? ` · ${cost}` : ''}</span>
                  </span>
                  {model.id === selectedModel && <Check className="model-check" />}
                </button>
              )
            })}
          </div>
          <div className="model-popover-foot">Showing {Math.min(filtered.length, 60)} of {filtered.length} matching models. On-device models have no per-message credits; hosted availability and pricing come from Puter.</div>
        </div>
      )}
    </div>
  )
}
