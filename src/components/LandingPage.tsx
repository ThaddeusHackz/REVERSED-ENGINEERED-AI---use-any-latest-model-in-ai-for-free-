import { useEffect, useState } from 'react'
import {
  ArrowRight, Check, ChevronDown, CircleDollarSign, Cloud,
  Copy, Database, KeyRound, Layers3, Menu, Network,
  ShieldCheck, Sparkles, X, Zap,
} from 'lucide-react'
import { providers } from '../data'
import { copyText } from '../lib/utils'
import PromptBox from './PromptBox'
import PuterMark from './PuterMark'

interface LandingPageProps {
  onOpenStudio: () => void
}

const featureLinks = [
  { icon: Sparkles, title: 'AI Gateway', desc: '500+ models, one API', href: '#features' },
  { icon: ShieldCheck, title: 'Auth', desc: 'Secure user accounts', href: 'https://developer.puter.com/auth/' },
  { icon: Database, title: 'Database', desc: 'Serverless key-value data', href: 'https://developer.puter.com/key-value-database/' },
  { icon: Cloud, title: 'Storage', desc: 'Simple cloud file storage', href: 'https://developer.puter.com/object-storage/' },
  { icon: Zap, title: 'Workers', desc: 'Backend logic on demand', href: 'https://developer.puter.com/serverless-workers/' },
  { icon: Network, title: 'Networking', desc: 'Connect your application', href: 'https://developer.puter.com/networking/' },
]

function Brand() {
  return <span className="brand"><PuterMark size={31} /><span>Puter<span className="brand-dot">.</span></span></span>
}

function Navigation({ onOpenStudio }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    if (!promptOpen) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setPromptOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [promptOpen])

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        <div className="nav-container">
          <a href="/" className="brand-link" aria-label="Puter developer home"><Brand /></a>
          <div className={`nav-menu ${menuOpen ? 'is-open' : ''}`}>
            <div className="nav-features-dropdown">
              <button className="nav-link nav-dropdown-button" type="button">Features <ChevronDown className="features-chevron" /></button>
              <div className="features-mega-menu">
                <div className="features-mega-columns">
                  {featureLinks.map(({ icon: Icon, title, desc, href }) => (
                    <a className="mega-link" href={href} key={title}>
                      <Icon className="mega-link-icon" />
                      <span className="mega-link-text"><span className="mega-link-title">{title}</span><span className="mega-link-desc">{desc}</span></span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <a className="nav-link" href="https://developer.puter.com/tutorials/" target="_blank" rel="noreferrer">Tutorials</a>
            <a className="nav-link" href="https://docs.puter.com/" target="_blank" rel="noreferrer">Docs</a>
            <a className="nav-link" href="https://developer.puter.com/showcase/" target="_blank" rel="noreferrer">Showcase</a>
          </div>
          <div className="nav-actions">
            <button className="nav-builder" type="button" onClick={onOpenStudio}>AI Studio</button>
            <button className="nav-cta" type="button" onClick={() => setPromptOpen(true)}>Start Building</button>
            <button className="navbar-toggler" type="button" onClick={() => setMenuOpen(open => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
      {promptOpen && (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setPromptOpen(false)}>
          <section className="gs-modal" role="dialog" aria-modal="true" aria-labelledby="prompt-modal-title">
            <div className="gs-modal-body">
              <button className="gs-modal-close" type="button" autoFocus onClick={() => setPromptOpen(false)} aria-label="Close dialog"><X /></button>
              <h2 className="gs-modal-title" id="prompt-modal-title">Ship a Full-Stack App with One Prompt</h2>
              <p className="gs-modal-sub">Copy this prompt into your AI coding agent, or open it in one below.</p>
              <PromptBox />
            </div>
          </section>
        </div>
      )}
    </>
  )
}

const heroProviderRows = [
  ['Mistral', 'xAI', 'Z.ai', 'Microsoft', 'Alibaba', 'Perplexity', 'Cohere', 'ByteDance', 'OpenRouter'],
  ['OpenAI', 'Claude', 'Gemini', 'Grok', 'DeepSeek'],
]

function ProviderMarquee() {
  return (
    <div className="provider-marquee" aria-label="Supported AI providers">
      {heroProviderRows.map((providersRow, rowIndex) => {
        const repeated = [...providersRow, ...providersRow]
        return <div className={`provider-track ${rowIndex ? 'provider-track-reverse' : ''}`} key={providersRow.join('-')}>{repeated.map((provider, index) => <span className="provider-word" key={`${provider}-${index}`}>{provider}</span>)}</div>
      })}
    </div>
  )
}

type Provider = (typeof providers)[number]

function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <a className="provider-card" href={provider.href} target="_blank" rel="noreferrer" title={provider.name}>
      <span className="provider-avatar" style={{ color: provider.color }}><span>{provider.short}</span>{provider.image && <img src={provider.image} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} />}</span>
      <span>{provider.name}</span>
    </a>
  )
}

function ProviderWallRow({ items, reverse = false }: { items: Provider[]; reverse?: boolean }) {
  const repeated = [...items, ...items]
  return (
    <div className="provider-wall-row">
      <div className={`provider-wall-track ${reverse ? 'reverse' : ''}`}>
        {repeated.map((provider, index) => <ProviderCard provider={provider} key={`${provider.name}-${index}`} />)}
      </div>
    </div>
  )
}

function CodeBlock({ code, language = 'html' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await copyText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="code-wrapper">
      <div className="code-buttons"><span>{language}</span><button className="code-button" type="button" onClick={copy} aria-label="Copy code">{copied ? <Check /> : <Copy />}</button></div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className={`faq-question ${open ? 'active' : ''}`} type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>{question}</button>
      <div className={`faq-answer ${open ? 'active' : ''}`}>{children}</div>
    </div>
  )
}

export default function LandingPage({ onOpenStudio }: LandingPageProps) {
  return (
    <div className="landing-page">
      <Navigation onOpenStudio={onOpenStudio} />
      <main>
        <section className="hero">
          <div className="site-container hero-content">
            <div className="hero-icon"><PuterMark size={40} /></div>
            <h1 className="hero-title">AI Gateway for AI-Generated Apps</h1>
            <p className="hero-lead">One API for 500+ AI models, with a syntax that AI coding agents use correctly.</p>
            <p className="hero-subtitle">No API keys, no servers, no cost to you.<br />Start building in seconds.</p>
            <div className="hero-buttons">
              <button className="cta" type="button" onClick={onOpenStudio}>Add AI to Your App <ArrowRight /></button>
              <a className="demo border" href="https://developer.puter.com/tutorials/?category=ai" target="_blank" rel="noreferrer">See Tutorials</a>
            </div>
            <ProviderMarquee />
          </div>
        </section>

        <section className="bento-boxes" id="features">
          <div className="site-container">
            <div className="bento-grid">
              <article className="bento-box cloud-storage">
                <h3><Sparkles />AI Integration</h3>
                <p>Access 500+ models, including GPT, Claude, Gemini, Grok, DeepSeek, Nano Banana, GPT Image, and FLUX, through a single API.</p>
                <ul><li>Switch models by changing one parameter</li><li>Always access the latest models</li><li>No vendor lock-in</li></ul>
              </article>
              <article className="bento-box"><h3><KeyRound />No API Keys Required</h3><p>Skip the sign-ups, key management, and credential juggling. Just add Puter.js and start building immediately.</p></article>
              <article className="bento-box"><h3><CircleDollarSign />User-Pays Model</h3><p><a href="https://docs.puter.com/user-pays-model/" target="_blank" rel="noreferrer">Your users cover their own AI costs</a>, so you can ship AI features without worrying about billing, rate limits, or runaway API expenses.</p></article>
              <article className="bento-box"><h3><Cloud />No Servers to Manage</h3><p>Works entirely client-side. No servers to provision, no infrastructure to maintain. True serverless AI from your frontend code.</p></article>
              <article className="bento-box"><h3><Layers3 />Multiple AI Capabilities</h3><p>Chat, <a href="https://developer.puter.com/image-generation/" target="_blank" rel="noreferrer">image generation</a>, vision analysis, <a href="https://developer.puter.com/text-to-speech/" target="_blank" rel="noreferrer">text-to-speech</a>, <a href="https://developer.puter.com/speech-to-text/" target="_blank" rel="noreferrer">speech-to-text</a>, <a href="https://developer.puter.com/voice-changer/" target="_blank" rel="noreferrer">voice changing</a>, <a href="https://developer.puter.com/ocr/" target="_blank" rel="noreferrer">OCR</a>, and <a href="https://developer.puter.com/video-generation/" target="_blank" rel="noreferrer">text-to-video</a>, all from the same library.</p></article>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <div className="site-container">
            <div className="section-heading"><h2>How It Works</h2></div>
            <div className="timeline">
              <div className="timeline-item"><div className="timeline-content"><h3><span className="timeline-step">1</span> Include Puter.js</h3><p>Add the Puter.js script tag to your HTML, or install it with npm:</p><CodeBlock code={'<script src="https://js.puter.com/v2/"></script>'} /><CodeBlock language="shell" code="npm install @heyputer/puter.js" /></div></div>
              <div className="timeline-item"><div className="timeline-content"><h3><span className="timeline-step">2</span> Use AI in your code!</h3><p>You can now use AI APIs directly from your frontend code. Here’s an example:</p><CodeBlock language="javascript" code={'puter.ai.chat("Explain AI like I\'m five!");'} /><p>View the <a href="https://docs.puter.com/AI/" target="_blank" rel="noreferrer">AI documentation</a> for a full list of available features.</p></div></div>
              <div className="timeline-item"><div className="timeline-content"><h3><span className="timeline-step">✓</span> That’s it!</h3><p>No need to set up servers or infrastructure. No API keys, configuration, or rate-limiting. Everything is handled by Puter.js!</p><div className="timeline-links"><a href="https://developer.puter.com/tutorials/?category=ai" target="_blank" rel="noreferrer">Browse Tutorials</a><a href="https://docs.puter.com/AI/" target="_blank" rel="noreferrer">Read the Docs</a><button type="button" onClick={onOpenStudio}>Try the Playground</button></div></div></div>
            </div>
          </div>
        </section>

        <section className="provider-section">
          <div className="site-container">
            <div className="section-heading"><h2>Access 500+ Models From Leading AI Providers</h2><p>One API, endless possibilities. Choose from the best AI providers, all in one place.</p></div>
            <div className="provider-wall" aria-label="AI provider directory">
              <ProviderWallRow items={providers.slice(0, 14)} />
              <ProviderWallRow items={providers.slice(14)} reverse />
            </div>
            <div className="models-link-row"><a href="https://developer.puter.com/ai/models/" target="_blank" rel="noreferrer">See all AI models <ArrowRight /></a></div>
          </div>
        </section>

        <section className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <FaqItem question="What is Puter.js?"><p><a href="https://docs.puter.com/" target="_blank" rel="noreferrer">Puter.js</a> is a JavaScript library that allows you to add AI and other cloud services directly to your frontend code.</p></FaqItem>
          <FaqItem question="How do I add AI to my app with Puter.js?"><p>Simply add the library using either a script tag or the npm package, then call the AI using <code>puter.ai.chat()</code>. No servers to manage. All services are available directly from the client side without any configuration or setup.</p></FaqItem>
          <FaqItem question="How much does it cost?"><p>With the <a href="https://docs.puter.com/user-pays-model/" target="_blank" rel="noreferrer">User-Pays model</a>, users cover their own AI usage costs through their Puter account, so you can build and ship AI features without worrying about API bills or infrastructure.</p></FaqItem>
        </section>

        <section className="cta-section">
          <div className="site-container">
            <h2>Ship a Full-Stack App with One Prompt</h2>
            <PromptBox />
          </div>
        </section>
      </main>

      <footer>
        <div className="site-container footer-columns">
          <div className="footer-brand"><div className="footer-logo"><PuterMark size={33} color="#ffffff" /><span>Puter.</span></div><p id="footer-copyright">The Backend for AI-Generated Apps.<br />© {new Date().getFullYear()} Puter Technologies Inc.</p><a className="footer-credit" href="https://github.com/HeyPuter/puter" target="_blank" rel="noreferrer">Open source on GitHub</a></div>
          <div className="footer-links">
            <div className="footer-column"><h4>Product</h4><a href="#features">AI Gateway</a><a href="https://developer.puter.com/auth/">Auth</a><a href="https://developer.puter.com/object-storage/">Storage</a><a href="https://developer.puter.com/key-value-database/">Database</a></div>
            <div className="footer-column"><h4>Resources</h4><a href="https://docs.puter.com/">Documentation</a><a href="https://developer.puter.com/tutorials/">Tutorials</a><a href="https://developer.puter.com/showcase/">Showcase</a><a href="https://developer.puter.com/ai/models/">AI Models</a></div>
            <div className="footer-column"><h4>Build</h4><button type="button" onClick={onOpenStudio}>AI Studio</button><a href="https://docs.puter.com/playground/ai-chatgpt/">Playground</a><a href="https://github.com/HeyPuter/puter">GitHub</a><a href="https://puter.com/">Puter.com</a></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
