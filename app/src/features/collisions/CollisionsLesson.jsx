import { useEffect, useId, useState } from 'react'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import TopicLesson from '../learning/TopicLesson'
import { SearchTable } from '../search/SearchExplorer'
import { COLLISION_PRACTICE_CASES, COLLISIONS_TOPIC } from './collisionsData'
import {
  createCollisionTrace,
  MAX_COLLISION_KEYS,
  MAX_COLLISION_SLOTS,
  parseCollisionInputs,
} from './collisionsLogic'

function BucketDiagram({ buckets, activeIndex = null }) {
  return (
    <ol
      className="hash-topic-stats"
      style={{ listStyle: 'none', padding: 0 }}
      aria-label="Separate-chaining buckets by zero-based index"
    >
      {buckets.map((bucket, index) => (
        <li className="hash-topic-stat" key={index} data-active={activeIndex === index}>
          <span>
            Bucket {index}{activeIndex === index ? ' · current bucket' : ''}
          </span>
          <strong>{bucket.length ? bucket.join(' → ') : 'Empty'}</strong>
        </li>
      ))}
    </ol>
  )
}

function CompletedComparison({ keys, capacity }) {
  const probing = createCollisionTrace(keys, capacity, 'probing')
  const chaining = createCollisionTrace(keys, capacity, 'chaining')
  return (
    <section className="hash-topic-panel" aria-label="Completed collision-resolution comparison">
      <h3>The same keys, two storage methods.</h3>
      <p>Both methods use key mod {capacity}. Compare where each distinct entry is kept.</p>
      <div className="hash-topic-comparison">
        <div>
          <h4>Linear probing</h4>
          <SearchTable table={probing.table} />
          <p>Each slot holds one entry. An occupied home can lead to another final slot.</p>
        </div>
        <div>
          <h4>Separate chaining</h4>
          <BucketDiagram buckets={chaining.buckets} />
          <p>Each home leads to a bucket that can hold several distinct entries.</p>
        </div>
      </div>
    </section>
  )
}

function CollisionsExplorer({ preferences = {}, active = true }) {
  const instanceId = useId()
  const [keysText, setKeysText] = useState('12, 22, 32')
  const [sizeText, setSizeText] = useState('10')
  const [method, setMethod] = useState('probing')
  const [trace, setTrace] = useState(() => createCollisionTrace([12, 22, 32], 10))
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const current = trace.steps[step]
  const finished = step === trace.steps.length - 1

  useEffect(() => {
    if (!active || !playing || finished || preferences.reduceMotion) return
    const timer = window.setTimeout(() => setStep((previous) => previous + 1), 1100)
    return () => window.clearTimeout(timer)
  }, [active, playing, finished, step, preferences.reduceMotion])

  function applyInputs(event) {
    event.preventDefault()
    const parsed = parseCollisionInputs(keysText, Number(sizeText))
    if (parsed.error) {
      setError(parsed.error)
      return
    }
    setTrace(createCollisionTrace(parsed.keys, Number(sizeText), method))
    setStep(0)
    setPlaying(false)
    setError('')
  }

  function moveTo(nextStep) {
    setPlaying(false)
    setStep(nextStep)
  }

  return (
    <section aria-label="Compare collision-resolution methods">
      <span className="eyebrow">WORKED EXAMPLE</span>
      <h2>Preserve both entries.</h2>
      <p>
        Keep the same keys and change the method to compare storage. Change the capacity from
        10 to 7 to see the home slots change.
      </p>
      <form className="hash-topic-form" onSubmit={applyInputs}>
        <label htmlFor={`${instanceId}-keys`}>
          Keys in insertion order
          <input
            id={`${instanceId}-keys`}
            value={keysText}
            onChange={(event) => {
              setKeysText(event.target.value)
              setError('')
            }}
            aria-describedby={`${instanceId}-limits${error ? ` ${instanceId}-error` : ''}`}
            aria-invalid={Boolean(error)}
          />
        </label>
        <label htmlFor={`${instanceId}-size`}>
          Number of slots
          <input
            id={`${instanceId}-size`}
            type="number"
            min="1"
            max={MAX_COLLISION_SLOTS}
            step="1"
            value={sizeText}
            onChange={(event) => {
              setSizeText(event.target.value)
              setError('')
            }}
          />
        </label>
        <label htmlFor={`${instanceId}-method`}>
          Resolution method
          <select
            id={`${instanceId}-method`}
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option value="probing">Linear probing</option>
            <option value="chaining">Separate chaining</option>
          </select>
        </label>
        <button type="submit" className="primary-button">Build walkthrough</button>
      </form>
      <p id={`${instanceId}-limits`} className="hash-topic-note">
        Use 1–{MAX_COLLISION_KEYS} comma-separated keys from 0 to 1,000,000 and
        1–{MAX_COLLISION_SLOTS} slots. Applying inputs starts a fresh walkthrough.
        Repeated keys show duplicate handling.
      </p>
      {error && (
        <p id={`${instanceId}-error`} className="hash-topic-error" role="alert">{error}</p>
      )}
      <div className="hash-topic-demo">
        <h3>{trace.method === 'probing' ? 'Linear probing' : 'Separate chaining'} · {trace.capacity} slots</h3>
        <p>Insert keys {trace.keys.join(' → ')} in that order.</p>
        {current.key !== undefined && (
          <p className="hash-topic-equation">
            {current.key} mod {trace.capacity} = {current.home} · home {current.home}
          </p>
        )}
        {trace.method === 'probing'
          ? <SearchTable
              table={current.table}
              currentIndex={current.index}
              matchIndex={current.type === 'insert' ? current.index : null}
              collision={current.type === 'collision'}
            />
          : <BucketDiagram buckets={current.buckets} activeIndex={current.index} />}
        <div className="hash-topic-step" aria-live="polite" aria-atomic="true">
          <h4>{current.title}</h4>
          <p>{current.text}</p>
        </div>
        <div className="hash-topic-controls" aria-label="Collision walkthrough controls">
          <button
            type="button"
            className="secondary-button"
            disabled={step === 0}
            onClick={() => moveTo(0)}
          >Replay</button>
          <button
            type="button"
            className="secondary-button"
            disabled={step === 0}
            onClick={() => moveTo(step - 1)}
          >← Previous</button>
          <button
            type="button"
            className="primary-button"
            disabled={finished || preferences.reduceMotion}
            onClick={() => setPlaying(!playing)}
          >{playing && !finished ? 'Pause' : 'Play'}</button>
          <button
            type="button"
            className="secondary-button"
            disabled={finished}
            onClick={() => moveTo(step + 1)}
          >Next →</button>
          <span>Step {step + 1} of {trace.steps.length}</span>
        </div>
        {preferences.reduceMotion && (
          <p className="hash-topic-note">
            Use Previous and Next to control the walkthrough with reduced motion enabled.
          </p>
        )}
      </div>
      {finished && <>
        <section className="hash-topic-panel" aria-label="Insertion outcomes">
          <h3>Home and final positions</h3>
          <ul>
            {trace.placements.map((placement, index) => {
              const positionType = trace.method === 'chaining' ? 'bucket' : 'slot'
              let outcome = 'table full, entry was not added'
              if (placement.status === 'stored') outcome = `stored at ${positionType} ${placement.index}`
              if (placement.status === 'duplicate') outcome = `duplicate, existing ${positionType} ${placement.index}`
              return (
                <li key={index}>
                  Key {placement.key} · home {placement.home} · {outcome}
                </li>
              )
            })}
          </ul>
        </section>
        <CompletedComparison keys={trace.keys} capacity={trace.capacity} />
      </>}
      <p className="hash-topic-note">
        Module 4 follows linear probing in more detail. A new capacity can separate one pair,
        while other pairs may still collide.
      </p>
    </section>
  )
}

function CollisionsPractice() {
  const [caseIndex, setCaseIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const exercise = COLLISION_PRACTICE_CASES[caseIndex]
  const answered = selected !== null
  const correct = selected === exercise.correctAnswer
  const preview = exercise.method === 'homes'
    ? null
    : createCollisionTrace(exercise.keys, exercise.capacity, exercise.method)

  function choose(index) {
    if (correct) return
    setSelected(index)
    if (index !== exercise.correctAnswer) setMistakes((previous) => previous + 1)
  }

  function nextCase() {
    setCaseIndex((previous) => (previous + 1) % COLLISION_PRACTICE_CASES.length)
    setSelected(null)
    setMistakes(0)
  }

  return (
    <section aria-label="Guided collision practice">
      <span className="eyebrow">PREDICT THE NEXT DECISION</span>
      <h2>Recognise the collision. Choose a safe action.</h2>
      <p>
        Example {caseIndex + 1} of {COLLISION_PRACTICE_CASES.length} · {exercise.capacity} slots ·
        keys {exercise.keys.join(', ')}.
      </p>
      {preview && (exercise.method === 'probing'
        ? <SearchTable table={preview.table} />
        : <BucketDiagram buckets={preview.buckets} />)}
      <h3>{exercise.question}</h3>
      <div className="hash-topic-options" role="group" aria-label="Choose your prediction">
        {exercise.options.map((option, index) => (
          <button
            type="button"
            key={option}
            className="secondary-button"
            aria-pressed={selected === index}
            disabled={correct}
            onClick={() => choose(index)}
          >{option}</button>
        ))}
      </div>
      {answered && (
        <div role="status">
          <FeedbackPanel
            correct={correct}
            message={correct
              ? 'Correct. Keep the distinct entries accessible.'
              : 'Use the hash result and the storage method.'}
            explanation={correct
              ? exercise.explanation
              : 'Calculate the home slot, then follow the chosen collision-resolution rule.'}
          />
        </div>
      )}
      {mistakes > 0 && !correct && (
        <ScaffoldingPanel
          title="Work through this example"
          hints={exercise.hints.slice(0, Math.min(mistakes, exercise.hints.length))}
        />
      )}
      {correct && (
        <button type="button" className="primary-button" onClick={nextCase}>
          Try another example →
        </button>
      )}
      <p className="hash-topic-note">
        Each new example begins with fewer hints. The knowledge check records your
        understanding after this practice.
      </p>
    </section>
  )
}

export default function CollisionsLesson({ completed = false, onComplete, preferences = {} }) {
  return (
    <TopicLesson
      topic={COLLISIONS_TOPIC}
      Explorer={CollisionsExplorer}
      Practice={CollisionsPractice}
      completed={completed}
      onComplete={onComplete}
      preferences={preferences}
    />
  )
}
