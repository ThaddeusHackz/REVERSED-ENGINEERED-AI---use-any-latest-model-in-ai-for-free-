import { useState, type ReactNode } from 'react'
import {
  AudioLines, Check, CircleAlert, Copy, Download, FileAudio, FileImage,
  FileText, FlaskConical, Image as ImageIcon, LoaderCircle, ScanText,
  Sparkles, UploadCloud, Video, WandSparkles,
} from 'lucide-react'
import { imageModels, videoModels } from '../data'
import { changeVoice, generateImage, generateSpeech, generateVideo, readImage, transcribeSpeech } from '../lib/puter'
import { copyText, downloadText, getErrorMessage } from '../lib/utils'
import type { StudioMode } from '../types'

interface CapabilityPanelProps {
  mode: Exclude<StudioMode, 'chat'>
  onToast: (message: string) => void
}

function PanelHeader({ icon, eyebrow, title, description }: { icon: ReactNode; eyebrow: string; title: string; description: string }) {
  return <div className="capability-header"><div className="capability-icon">{icon}</div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
}

function TestModeToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="test-mode-toggle">
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
      <span className="toggle-track"><span /></span>
      <FlaskConical />
      <span><strong>Test mode</strong><small>{checked ? 'Sample output · no credits used' : 'Live generation · account usage applies'}</small></span>
    </label>
  )
}

function ErrorNotice({ children }: { children: string }) {
  return <div className="error-notice" role="alert"><CircleAlert /><span>{children}</span></div>
}

function FilePicker({ file, onChange, accept, label }: { file?: File; onChange: (file?: File) => void; accept: string; label: string }) {
  return (
    <label className={`file-picker ${file ? 'has-file' : ''}`}>
      <input type="file" accept={accept} onChange={event => onChange(event.target.files?.[0])} />
      {file ? <Check /> : <UploadCloud />}
      <span><strong>{file ? file.name : label}</strong><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · click to replace` : 'Click to browse your device'}</small></span>
    </label>
  )
}

function EmptyResult({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="empty-result"><div>{icon}</div><strong>{title}</strong><p>{text}</p></div>
}

function DownloadLink({ url, label }: { url: string; label: string }) {
  return <a className="result-download" href={url} target="_blank" rel="noreferrer" download><Download /> {label}</a>
}

function ImagePanel({ onToast }: Pick<CapabilityPanelProps, 'onToast'>) {
  const [prompt, setPrompt] = useState('A serene futuristic garden at sunrise, soft volumetric light, ultra detailed')
  const [model, setModel] = useState(imageModels[0].id)
  const [ratio, setRatio] = useState('1:1')
  const [testMode, setTestMode] = useState(true)
  const [reference, setReference] = useState<File>()
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!prompt.trim() || busy) return
    setBusy(true); setError('')
    try {
      const url = await generateImage(prompt.trim(), { model, aspect_ratio: ratio, test_mode: testMode, ...(reference ? { input_image: reference } : {}) })
      if (!url) throw new Error('Puter did not return an image URL.')
      setResult(url)
      onToast(testMode ? 'Sample image created without using credits.' : 'Your image is ready.')
    } catch (reason) { setError(getErrorMessage(reason)) } finally { setBusy(false) }
  }

  return (
    <div className="capability-wrap">
      <PanelHeader icon={<ImageIcon />} eyebrow="Text to image" title="Imagine anything." description="Generate and edit images with GPT Image, Gemini, FLUX, Grok, Seedream, and more—all through one API." />
      <div className="creation-grid">
        <div className="creation-form">
          <label className="field"><span>Describe your image</span><textarea rows={5} value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="A watercolor painting of…" /></label>
          <div className="field-row"><label className="field"><span>Model</span><select value={model} onChange={event => setModel(event.target.value)}>{imageModels.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="field"><span>Aspect ratio</span><select value={ratio} onChange={event => setRatio(event.target.value)}><option>1:1</option><option>16:9</option><option>9:16</option><option>4:3</option><option>3:4</option></select></label></div>
          <FilePicker file={reference} onChange={setReference} accept="image/png,image/jpeg,image/webp,image/gif" label="Add a reference image (optional)" />
          <TestModeToggle checked={testMode} onChange={setTestMode} />
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <button className="primary-action" type="button" disabled={!prompt.trim() || busy} onClick={generate}>{busy ? <LoaderCircle className="spin" /> : <WandSparkles />}{busy ? 'Creating…' : testMode ? 'Create sample image' : 'Generate image'}</button>
        </div>
        <div className="creation-result">
          {result ? <><img src={result} alt={prompt} /><div className="result-caption"><span>{testMode ? 'Sample result' : 'Generated result'}</span><DownloadLink url={result} label="Open / download" /></div></> : <EmptyResult icon={<FileImage />} title="Your canvas is ready" text="Describe an image and your result will appear here." />}
        </div>
      </div>
    </div>
  )
}

function VideoPanel({ onToast }: Pick<CapabilityPanelProps, 'onToast'>) {
  const [prompt, setPrompt] = useState('A drone shot sweeping over bioluminescent waves at night')
  const [model, setModel] = useState(videoModels[0].id)
  const [seconds, setSeconds] = useState('5')
  const [size, setSize] = useState('1280x720')
  const [audio, setAudio] = useState(true)
  const [testMode, setTestMode] = useState(true)
  const [reference, setReference] = useState<File>()
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!prompt.trim() || busy) return
    setBusy(true); setError('')
    try {
      const url = await generateVideo(prompt.trim(), { model, seconds: Number(seconds), size, generate_audio: audio, test_mode: testMode, ...(reference ? { input_reference: reference } : {}) })
      if (!url) throw new Error('Puter did not return a video URL.')
      setResult(url)
      onToast(testMode ? 'Sample video created without using credits.' : 'Your video is ready.')
    } catch (reason) { setError(getErrorMessage(reason)) } finally { setBusy(false) }
  }

  return (
    <div className="capability-wrap">
      <PanelHeader icon={<Video />} eyebrow="Text to video" title="Set your ideas in motion." description="Create short clips with Wan, Veo, Kling, and Seedance. Add a starting frame or generate entirely from text." />
      <div className="creation-grid">
        <div className="creation-form">
          <label className="field"><span>Describe the scene and motion</span><textarea rows={5} value={prompt} onChange={event => setPrompt(event.target.value)} /></label>
          <label className="field"><span>Model</span><select value={model} onChange={event => setModel(event.target.value)}>{videoModels.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <div className="field-row"><label className="field"><span>Duration</span><select value={seconds} onChange={event => setSeconds(event.target.value)}><option value="4">4 seconds</option><option value="5">5 seconds</option><option value="6">6 seconds</option><option value="8">8 seconds</option><option value="10">10 seconds</option></select></label><label className="field"><span>Size</span><select value={size} onChange={event => setSize(event.target.value)}><option value="1280x720">1280 × 720</option><option value="720x1280">720 × 1280</option><option value="1024x1024">1024 × 1024</option></select></label></div>
          <FilePicker file={reference} onChange={setReference} accept="image/png,image/jpeg,image/webp" label="Add a first frame (optional)" />
          <label className="simple-check"><input type="checkbox" checked={audio} onChange={event => setAudio(event.target.checked)} /> Generate audio when the model supports it</label>
          <TestModeToggle checked={testMode} onChange={setTestMode} />
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <button className="primary-action" type="button" disabled={!prompt.trim() || busy} onClick={generate}>{busy ? <LoaderCircle className="spin" /> : <Video />}{busy ? 'Rendering…' : testMode ? 'Create sample video' : 'Generate video'}</button>
        </div>
        <div className="creation-result">
          {result ? <><video src={result} controls playsInline /><div className="result-caption"><span>{testMode ? 'Sample result' : 'Generated result'}</span><DownloadLink url={result} label="Open / download" /></div></> : <EmptyResult icon={<Video />} title="Your preview is ready" text="Video generation can take a few minutes. You can try test mode instantly." />}
        </div>
      </div>
    </div>
  )
}

const voiceOptions: Record<string, string[]> = {
  openai: ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'],
  'aws-polly': ['Joanna', 'Matthew', 'Amy', 'Brian', 'Emma'],
  elevenlabs: ['21m00Tcm4TlvDq8ikWAM'],
  gemini: ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede'],
  xai: ['eve', 'ara', 'rex', 'sal', 'leo'],
}

function AudioResult({ url, label }: { url: string; label: string }) {
  return <div className="audio-result"><div className="audio-result-title"><AudioLines /><strong>{label}</strong></div><audio src={url} controls /><DownloadLink url={url} label="Open / download" /></div>
}

function AudioPanel({ onToast }: Pick<CapabilityPanelProps, 'onToast'>) {
  const [tab, setTab] = useState<'tts' | 'stt' | 'voice'>('tts')
  const [testMode, setTestMode] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [text, setText] = useState('Hello! Puter gives your app access to powerful AI voices through one simple API.')
  const [provider, setProvider] = useState('openai')
  const [voice, setVoice] = useState('alloy')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioFile, setAudioFile] = useState<File>()
  const [sttProvider, setSttProvider] = useState('openai')
  const [transcript, setTranscript] = useState('')
  const [targetVoice, setTargetVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [copied, setCopied] = useState(false)

  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError('')
    try { await action() } catch (reason) { setError(getErrorMessage(reason)) } finally { setBusy(false) }
  }
  const switchTab = (next: typeof tab) => { setTab(next); setError(''); setAudioUrl(''); setTranscript('') }

  return (
    <div className="capability-wrap">
      <PanelHeader icon={<AudioLines />} eyebrow="Speech and voice" title="Give your app a voice." description="Synthesize natural speech, transcribe recordings, or transform an existing voice with Puter’s audio APIs." />
      <div className="capability-tabs" role="tablist"><button className={tab === 'tts' ? 'active' : ''} type="button" onClick={() => switchTab('tts')}>Text to speech</button><button className={tab === 'stt' ? 'active' : ''} type="button" onClick={() => switchTab('stt')}>Speech to text</button><button className={tab === 'voice' ? 'active' : ''} type="button" onClick={() => switchTab('voice')}>Voice changer</button></div>
      <div className="audio-workspace">
        {tab === 'tts' && <>
          <label className="field"><span>Text to speak</span><textarea rows={6} maxLength={3000} value={text} onChange={event => setText(event.target.value)} /><small>{text.length} / 3,000 characters</small></label>
          <div className="field-row"><label className="field"><span>Provider</span><select value={provider} onChange={event => { const next = event.target.value; setProvider(next); setVoice(voiceOptions[next][0]) }}><option value="openai">OpenAI</option><option value="aws-polly">AWS Polly</option><option value="elevenlabs">ElevenLabs</option><option value="gemini">Gemini</option><option value="xai">xAI</option></select></label><label className="field"><span>Voice</span><select value={voice} onChange={event => setVoice(event.target.value)}>{voiceOptions[provider].map(item => <option key={item}>{item}</option>)}</select></label></div>
          <TestModeToggle checked={testMode} onChange={setTestMode} />
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <button className="primary-action" type="button" disabled={!text.trim() || busy} onClick={() => run(async () => { const url = await generateSpeech(text.trim(), { provider, voice, test_mode: testMode }); if (!url) throw new Error('Puter did not return audio.'); setAudioUrl(url); onToast(testMode ? 'Sample speech is ready.' : 'Speech generated.') })}>{busy ? <LoaderCircle className="spin" /> : <AudioLines />}{busy ? 'Synthesizing…' : 'Generate speech'}</button>
          {audioUrl && <AudioResult url={audioUrl} label="Generated speech" />}
        </>}
        {tab === 'stt' && <>
          <FilePicker file={audioFile} onChange={setAudioFile} accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac" label="Choose an audio recording" />
          <label className="field"><span>Transcription provider</span><select value={sttProvider} onChange={event => setSttProvider(event.target.value)}><option value="openai">OpenAI</option><option value="xai">xAI · speaker diarization available</option><option value="gemini">Gemini · timestamps available</option></select></label>
          <TestModeToggle checked={testMode} onChange={setTestMode} />
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <button className="primary-action" type="button" disabled={!audioFile || busy} onClick={() => run(async () => { if (!audioFile) return; const value = await transcribeSpeech(audioFile, { provider: sttProvider, response_format: 'text', test_mode: testMode }); setTranscript(value); onToast('Transcription complete.') })}>{busy ? <LoaderCircle className="spin" /> : <FileAudio />}{busy ? 'Transcribing…' : 'Transcribe audio'}</button>
          {transcript && <div className="text-result"><div><strong>Transcript</strong><button type="button" onClick={() => { void copyText(transcript); setCopied(true); window.setTimeout(() => setCopied(false), 1400) }}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy'}</button></div><p>{transcript}</p></div>}
        </>}
        {tab === 'voice' && <>
          <FilePicker file={audioFile} onChange={setAudioFile} accept="audio/*,.mp3,.wav,.m4a,.ogg" label="Choose a voice recording" />
          <label className="field"><span>ElevenLabs target voice ID</span><input value={targetVoice} onChange={event => setTargetVoice(event.target.value)} /><small>Use a voice ID from your available ElevenLabs voices.</small></label>
          <TestModeToggle checked={testMode} onChange={setTestMode} />
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <button className="primary-action" type="button" disabled={!audioFile || !targetVoice.trim() || busy} onClick={() => run(async () => { if (!audioFile) return; const url = await changeVoice(audioFile, { voice: targetVoice.trim(), model: 'eleven_multilingual_sts_v2', output_format: 'mp3_44100_128', test_mode: testMode }); if (!url) throw new Error('Puter did not return audio.'); setAudioUrl(url); onToast('Voice conversion complete.') })}>{busy ? <LoaderCircle className="spin" /> : <Sparkles />}{busy ? 'Converting…' : 'Convert voice'}</button>
          {audioUrl && <AudioResult url={audioUrl} label="Converted voice" />}
        </>}
      </div>
    </div>
  )
}

function OcrPanel({ onToast }: Pick<CapabilityPanelProps, 'onToast'>) {
  const [file, setFile] = useState<File>()
  const [model, setModel] = useState('aws-textract')
  const [testMode, setTestMode] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const extract = async () => {
    if (!file || busy) return
    setBusy(true); setError('')
    try {
      const value = await readImage(file, { model, testMode })
      setResult(value)
      onToast('Text extracted successfully.')
    } catch (reason) { setError(getErrorMessage(reason)) } finally { setBusy(false) }
  }

  return (
    <div className="capability-wrap">
      <PanelHeader icon={<ScanText />} eyebrow="Vision and OCR" title="Turn documents into text." description="Extract printed text, handwriting, tables, and Markdown from images, PDFs, and documents with AWS Textract or Mistral OCR." />
      <div className="ocr-grid">
        <div className="creation-form">
          <FilePicker file={file} onChange={setFile} accept="image/*,.pdf,.docx,.pptx,.xlsx,.epub,.rtf,.tiff" label="Choose an image or document" />
          <label className="field"><span>OCR engine</span><select value={model} onChange={event => setModel(event.target.value)}><option value="aws-textract">AWS Textract · plain text</option><option value="mistral-ocr-latest">Mistral OCR · Markdown and documents</option></select></label>
          <TestModeToggle checked={testMode} onChange={setTestMode} />
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <button className="primary-action" type="button" disabled={!file || busy} onClick={extract}>{busy ? <LoaderCircle className="spin" /> : <ScanText />}{busy ? 'Reading document…' : 'Extract text'}</button>
          <div className="format-note"><FileText /><p><strong>Input limits</strong>Textract accepts single-page documents up to 10 MB. Mistral supports larger files and more document formats.</p></div>
        </div>
        <div className="ocr-result">
          {result ? <><div className="text-result"><div><strong>Extracted text</strong><button type="button" onClick={() => { void copyText(result); setCopied(true); window.setTimeout(() => setCopied(false), 1400) }}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy'}</button></div><p>{result}</p></div><button className="secondary-action" type="button" onClick={() => downloadText('puter-ocr-result.txt', result)}><Download /> Download .txt</button></> : <EmptyResult icon={<FileText />} title="No text yet" text="Upload a document and the extracted text will appear here." />}
        </div>
      </div>
    </div>
  )
}

export default function CapabilityPanel({ mode, onToast }: CapabilityPanelProps) {
  if (mode === 'image') return <ImagePanel onToast={onToast} />
  if (mode === 'video') return <VideoPanel onToast={onToast} />
  if (mode === 'audio') return <AudioPanel onToast={onToast} />
  return <OcrPanel onToast={onToast} />
}
