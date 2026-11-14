import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Square, Volume2 } from 'lucide-react'

function readableText() {
  const content = document.querySelector('.page-content')
  if (!content) return ''

  const excluded = '[hidden], [inert], [aria-hidden="true"], [role="status"], [role="alert"], nav, button, form, label, .sr-only, .hash-search-sr-only'

  return Array.from(content.querySelectorAll('h1, h2, h3, h4, p, li'))
    .filter((element) => {
      if (element.closest(excluded) || !element.getClientRects().length) return false
      if (window.getComputedStyle(element).visibility === 'hidden') return false
      // Read nested paragraphs/list items once rather than repeating their parent.
      return !element.matches('li') || !element.querySelector('h1, h2, h3, h4, p, li')
    })
    .map((element) => element.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text) => /[.!?:;]$/.test(text) ? text : `${text}.`)
    .join(' ')
}

function speechChunks(text) {
  const chunks = []
  let current = ''

  for (const word of text.split(/\s+/)) {
    if (current && current.length + word.length + 1 > 1200) {
      chunks.push(current)
      current = ''
    }
    current += `${current ? ' ' : ''}${word}`
    if (current.length >= 600 && /[.!?]$/.test(word)) {
      chunks.push(current)
      current = ''
    }
  }
  if (current) chunks.push(current)
  return chunks
}

export default function ReadAloud({ preferences, page, activeModule }) {
  const { speechEnabled, speechRate, speechVoice } = preferences
  const supported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance === 'function'
  const context = JSON.stringify([page, activeModule?.id, speechEnabled, speechRate, speechVoice])
  const [playback, setPlayback] = useState({ context, status: 'idle', message: '' })
  const generation = useRef(0)
  const utterance = useRef(null)
  // Invalidate old playback even when the student later returns to this page.
  if (playback.context !== context) {
    setPlayback({ context, status: 'idle', message: '' })
  }
  const status = playback.context === context ? playback.status : 'idle'
  const message = playback.context === context && playback.message
    ? playback.message
    : 'Ready to read this page.'
  const active = status === 'speaking' || status === 'paused'

  useEffect(() => {
    if (!supported) return
    const synthesis = window.speechSynthesis

    return () => {
      generation.current += 1
      if (utterance.current) {
        utterance.current.onend = null
        utterance.current.onerror = null
        utterance.current = null
        synthesis.cancel()
      }
    }
  }, [context, supported])

  function stop() {
    generation.current += 1
    if (utterance.current) {
      utterance.current.onend = null
      utterance.current.onerror = null
      utterance.current = null
    }
    window.speechSynthesis.cancel()
    setPlayback({ context, status: 'idle', message: 'Reading stopped.' })
  }

  function readPage() {
    const chunks = speechChunks(readableText())
    if (!chunks.length) {
      setPlayback({ context, status: 'idle', message: 'There is no reading text on this page yet.' })
      return
    }

    const synthesis = window.speechSynthesis
    const run = ++generation.current
    if (utterance.current) {
      utterance.current.onend = null
      utterance.current.onerror = null
      utterance.current = null
    }
    synthesis.cancel()
    // Some browsers retain their paused state after cancelling an utterance.
    synthesis.resume()
    const voice = synthesis.getVoices().find((item) => item.voiceURI === speechVoice || item.name === speechVoice)

    function speakChunk(index) {
      if (run !== generation.current) return
      if (index === chunks.length) {
        utterance.current = null
        setPlayback({ context, status: 'finished', message: 'Finished reading this page.' })
        return
      }

      const next = new window.SpeechSynthesisUtterance(chunks[index])
      next.rate = speechRate
      if (voice) next.voice = voice
      next.lang = voice?.lang || document.documentElement.lang || 'en'
      next.onend = () => speakChunk(index + 1)
      next.onerror = () => {
        if (run !== generation.current) return
        utterance.current = null
        setPlayback({
          context,
          status: 'error',
          message: 'Unable to read this page. Try again or choose a different voice in Settings.',
        })
      }
      utterance.current = next
      try {
        synthesis.speak(next)
      } catch {
        next.onerror()
      }
    }

    setPlayback({ context, status: 'speaking', message: 'Reading this page.' })
    speakChunk(0)
  }

  function togglePause() {
    if (status === 'paused') {
      window.speechSynthesis.resume()
      setPlayback({ context, status: 'speaking', message: 'Reading this page.' })
    } else {
      window.speechSynthesis.pause()
      setPlayback({ context, status: 'paused', message: 'Reading paused.' })
    }
  }

  if (!speechEnabled) return null

  if (!supported) {
    return (
      <section className="read-aloud read-aloud-unavailable" aria-label="Read aloud">
        <Volume2 size={18} aria-hidden="true" />
        <p>Your browser does not support read aloud. You can still read all lesson content on screen.</p>
      </section>
    )
  }

  return (
    <section className="read-aloud" aria-label="Read aloud">
      <div className="read-aloud-copy">
        <Volume2 size={18} aria-hidden="true" />
        <div>
          <strong>Read aloud</strong>
          <p className="read-aloud-status" role="status">{message}</p>
        </div>
      </div>
      <div className="read-aloud-controls">
        <button type="button" className="secondary-button" onClick={readPage} disabled={active}>
          <Play size={14} aria-hidden="true" />
          Read page
        </button>
        <button type="button" className="secondary-button" onClick={togglePause} disabled={!active}>
          {status === 'paused' ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {status === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="secondary-button" onClick={stop} disabled={!active}>
          <Square size={14} aria-hidden="true" />
          Stop
        </button>
      </div>
    </section>
  )
}
