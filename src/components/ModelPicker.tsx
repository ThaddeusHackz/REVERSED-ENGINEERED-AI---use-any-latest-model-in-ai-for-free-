import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, RefreshCw, Search, Sparkles, X } from 'lucide-react'
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

export default function ModelPicker({ models, selectedModel, onSelect, loading, error, onRetry, live }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [freeOnly, setFreeOnly] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const selected = models.find(model => model.id === selectedModel) ?? models[0]
  const providers = useMemo(() => [...new Set(models.map(model => model.provider))].sort(), [models])
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
        <span className="model-trigger-icon"><Sparkles /></span>
        <span>{selected ? formatModelName(selected) : selectedModel}</span>
        <ChevronDown className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <div className="model-popover" role="dialog" aria-label="Choose an AI model">
          <div className="model-popover-head">
            <div><strong>Choose a model</strong><span>{live ? `${models.length} live models from Puter` : 'Popular models · live catalog unavailable'}</span></div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close model picker"><X /></button>
          </div>
          <label className="model-search"><Search /><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search models" /></label>
          <div className="model-filters">
            <select value={provider} onChange={event => setProvider(event.target.value)} aria-label="Filter by provider">
              <option value="all">All providers</option>
              {providers.map(item => <option key={item} value={item}>{formatProvider(item)}</option>)}
            </select>
            <label className="free-filter"><input type="checkbox" checked={freeOnly} onChange={event => setFreeOnly(event.target.checked)} /> Free variants</label>
          </div>
          {error && <div className="catalog-warning"><span>{error}</span><button type="button" onClick={onRetry}><RefreshCw /> Retry</button></div>}
          <div className="model-list" role="listbox">
            {loading ? (
              <div className="model-list-empty"><RefreshCw className="spin" /> Loading Puter’s live catalog…</div>
            ) : filtered.length === 0 ? (
              <div className="model-list-empty">No models match these filters.</div>
            ) : filtered.slice(0, 60).map(model => {
              const cost = formatModelCost(model)
              const context = formatContext(model.context)
              return (
                <button className={`model-option ${model.id === selectedModel ? 'selected' : ''}`} type="button" role="option" aria-selected={model.id === selectedModel} key={`${model.provider}:${model.id}`} onClick={() => { onSelect(model.id); setOpen(false) }}>
                  <span className="provider-dot">{formatProvider(model.provider).slice(0, 1)}</span>
                  <span className="model-option-copy">
                    <span className="model-option-name">{formatModelName(model)}{isFreeModel(model) && <em>Free</em>}</span>
                    <span className="model-option-id">{model.id}</span>
                    <span className="model-option-meta">{formatProvider(model.provider)}{context ? ` · ${context}` : ''}{cost ? ` · ${cost}` : ''}</span>
                  </span>
                  {model.id === selectedModel && <Check className="model-check" />}
                </button>
              )
            })}
          </div>
          <div className="model-popover-foot">Showing {Math.min(filtered.length, 60)} of {filtered.length} matching models. Availability and pricing come from your Puter account.</div>
        </div>
      )}
    </div>
  )
}
