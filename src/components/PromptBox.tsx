import { useState } from 'react'
import { ArrowRight, Check, Copy } from 'lucide-react'
import { agentLinks, BUILD_PROMPT } from '../data'
import { copyText } from '../lib/utils'

export default function PromptBox() {
  const [copied, setCopied] = useState(false)

  const copyPrompt = async () => {
    await copyText(BUILD_PROMPT)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="gs-prompt">
      <div className="gs-code">
        <div className="gs-prompt-label">
          <ArrowRight aria-hidden="true" />
          <span className="gs-prompt-label-text"><span>Give this</span><span>to your AI</span></span>
        </div>
        <code>{BUILD_PROMPT}</code>
        <button className={`gs-copy ${copied ? 'copied' : ''}`} type="button" onClick={copyPrompt} aria-label="Copy AI builder prompt">
          {copied ? <Check /> : <Copy />}
        </button>
      </div>
      <p className="gs-note">Copy this prompt into your AI coding agent, or open it in one below.</p>
      <div className="works-with">
        <span className="works-with-label">Try in</span>
        <div className="works-with-logos">
          {agentLinks.map(agent => (
            <a key={agent.name} href={agent.href} target={agent.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" title={`Try in ${agent.name}`}>
              {agent.name}
            </a>
          ))}
        </div>
      </div>
      <p className="cta-guide-note">Coding manually? <a href="https://docs.puter.com/getting-started/" target="_blank" rel="noreferrer">see the guide</a></p>
    </div>
  )
}
