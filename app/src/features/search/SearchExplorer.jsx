import { useCallback, useEffect, useId, useRef, useState } from 'react'
import HashTable from '../../components/visualiser/HashTable'
import { createSearchTrace } from '../../logic/searching'
import { SEARCH_EXAMPLES, SEARCH_PSEUDOCODE } from './searchExamples'

function displaySlot(slot) {
  if (slot === null || slot === undefined) return null
  if (typeof slot === 'object') return slot.tombstone ? 'Deleted' : slot.key
  return slot
}

export function SearchTable({ table, currentIndex = null, matchIndex = null, collision = false }) {
  const display = table.map(displaySlot)
  return (
    <div className="hash-search-table" style={{ '--search-columns': Math.min(table.length, 5) }}>
      <div aria-hidden="true">
        <HashTable
          table={display}
          currentIndex={currentIndex}
          highlightedIndex={matchIndex}
          collisionIndex={collision ? currentIndex : null}
        />
      </div>
      <ol className="hash-search-sr-only" aria-label="Hash table, with zero-based slot indices">
        {display.map((value, index) => (
          <li key={index}>
            Slot {index},{' '}
            {value === null ? 'empty' : value === 'Deleted' ? 'deleted marker' : `key ${value}`}
            {index === matchIndex
              ? ', matching key'
              : index === currentIndex
                ? ', current slot'
                : ''}
            .
          </li>
        ))}
      </ol>
      <div className="hash-search-legend">
        <span>Index above · key below</span>
        <span>
          <i />
          Current
        </span>
        <span>
          <i className="hash-search-match-key" />
          Match
        </span>
        <span>Deleted = keep searching</span>
      </div>
    </div>
  )
}

export default function SearchExplorer({ onTraced }) {
  const instanceId = useId()
  const [exampleId, setExampleId] = useState('found')
  const example = SEARCH_EXAMPLES.find((item) => item.id === exampleId)
  const [keyInput, setKeyInput] = useState(String(example.key))
  const [trace, setTrace] = useState(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [delay, setDelay] = useState(1100)
  const [error, setError] = useState('')
  const reported = useRef(false)
  const current = trace?.steps[step]
  const finished = trace && step === trace.steps.length - 1

  const moveToStep = useCallback(
    (nextStep) => {
      if (!trace || nextStep < 0 || nextStep >= trace.steps.length) return
      setStep(nextStep)
      if (nextStep === trace.steps.length - 1) {
        setPlaying(false)
        if (!reported.current) {
          reported.current = true
          onTraced?.()
        }
      }
    },
    [trace, onTraced],
  )

  useEffect(() => {
    if (!playing || !trace || finished) return
    const timer = window.setTimeout(() => moveToStep(step + 1), delay)
    return () => window.clearTimeout(timer)
  }, [playing, trace, finished, step, delay, moveToStep])

  function changeExample(id) {
    const next = SEARCH_EXAMPLES.find((item) => item.id === id)
    setExampleId(id)
    setKeyInput(String(next.key))
    setTrace(null)
    setStep(0)
    setPlaying(false)
    setError('')
    reported.current = false
  }

  function startSearch(event) {
    event.preventDefault()
    if (!/^\d+$/.test(keyInput.trim()) || Number(keyInput) > 1_000_000) {
      setError('Enter a whole-number key from 0 to 1,000,000.')
      return
    }
    setTrace({ ...createSearchTrace(example.table, Number(keyInput)), target: Number(keyInput) })
    setStep(0)
    setPlaying(false)
    setError('')
    reported.current = false
  }

  return (
    <div className="hash-search-explorer">
      <div className="hash-search-explorer-inputs">
        <label htmlFor={`${instanceId}-example`}>
          Worked example
          <select
            id={`${instanceId}-example`}
            value={exampleId}
            onChange={(event) => changeExample(event.target.value)}
          >
            {SEARCH_EXAMPLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={startSearch}>
          <label htmlFor={`${instanceId}-key`}>Key to find</label>
          <div className="hash-search-input-action">
            <input
              id={`${instanceId}-key`}
              inputMode="numeric"
              value={keyInput}
              onChange={(event) => {
                setKeyInput(event.target.value)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${instanceId}-error` : undefined}
            />
            <button type="submit" className="primary-button">
              Trace search
            </button>
          </div>
          {error && (
            <p className="hash-search-error" role="alert" id={`${instanceId}-error`}>
              {error}
            </p>
          )}
        </form>
      </div>
      <p className="hash-search-example-purpose">{example.purpose}</p>
      <div className="hash-search-workspace">
        <div className="hash-search-canvas">
          <div className="hash-search-calculation">
            <span>Hash function</span>
            <strong>
              {trace
                ? `${trace.target} mod ${example.table.length} = ${trace.homeIndex}`
                : 'h(key) = key mod m'}
            </strong>
            <span>m = {example.table.length} slots</span>
          </div>
          <SearchTable
            table={current?.table ?? example.table}
            currentIndex={current?.index}
            matchIndex={current?.matchIndex}
            collision={current?.type === 'collision'}
          />
          <div className="hash-search-transport" aria-label="Search playback controls">
            <button
              type="button"
              className="secondary-button"
              aria-label="Replay search"
              disabled={!trace}
              onClick={() => {
                setPlaying(false)
                setStep(0)
              }}
            >
              ↺ Replay
            </button>
            <button
              type="button"
              className="secondary-button"
              aria-label="Previous search step"
              disabled={!trace || step === 0}
              onClick={() => {
                setPlaying(false)
                moveToStep(step - 1)
              }}
            >
              ←
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!trace || Boolean(finished)}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              className="secondary-button"
              aria-label="Next search step"
              disabled={!trace || Boolean(finished)}
              onClick={() => {
                setPlaying(false)
                moveToStep(step + 1)
              }}
            >
              →
            </button>
            <label className="hash-search-pace">
              Pace
              <select value={delay} onChange={(event) => setDelay(Number(event.target.value))}>
                <option value={1800}>Slow</option>
                <option value={1100}>Normal</option>
                <option value={550}>Fast</option>
              </select>
            </label>
          </div>
          <div className="hash-search-trace-summary">
            <span>
              {trace
                ? `Step ${step + 1} of ${trace.steps.length}`
                : 'Start a trace to see each decision'}
            </span>
            <span>{current?.checks ?? 0} slots inspected</span>
          </div>
        </div>
        <div className="hash-search-step-panel">
          <div aria-live="polite" aria-atomic="true">
            <h3>{current?.title ?? 'Begin at the home slot'}</h3>
            <p>
              {current?.message ??
                'Calculate key mod table size, then inspect that slot. A different key or a deleted marker means the search continues.'}
            </p>
          </div>
          <ol
            className="hash-search-code"
            aria-label="Search pseudocode with current line highlighted"
          >
            {SEARCH_PSEUDOCODE.map((line, index) => (
              <li key={line} aria-current={current?.line === index + 1 ? 'step' : undefined}>
                <code>{line}</code>
              </li>
            ))}
          </ol>
          {finished && (
            <div
              className={`hash-search-result ${trace.found ? 'hash-search-result--found' : ''}`}
              role="status"
            >
              <strong>{trace.found ? `Found at slot ${trace.index}` : 'Key absent'}</strong>
              <p>{trace.message}</p>
            </div>
          )}
        </div>
      </div>
      <p className="hash-search-note">
        Changing the example or tracing another key starts a fresh walkthrough. Replay lets you
        inspect the same recorded search again.
      </p>
    </div>
  )
}
