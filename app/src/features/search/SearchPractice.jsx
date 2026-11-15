import { useState } from 'react'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import { createSearchTrace } from '../../logic/searching'
import { SEARCH_EXAMPLES } from './searchExamples'

function slotLabel(slot) {
  if (slot === null || slot === undefined) return null
  if (typeof slot === 'object') return slot.tombstone ? 'Deleted' : slot.key
  return slot
}

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'}`

// Guided practice: the table itself is the answer pad. Click the slots in the
// order the search checks them. A correct click is recorded immediately and the
// next slot is expected straight away; a wrong click shows feedback and hints.
export default function SearchPractice({ onContinue }) {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [position, setPosition] = useState(0) // correct inspections made so far
  const [wrong, setWrong] = useState(null) // slot of the last wrong pick
  const [mistakes, setMistakes] = useState(0) // wrong picks for the current decision
  const example = SEARCH_EXAMPLES[exampleIndex]
  const m = example.table.length
  const trace = createSearchTrace(example.table, example.key)
  const inspections = trace.steps.filter((item) =>
    ['collision', 'deleted', 'empty', 'found'].includes(item.type),
  )
  const done = position === inspections.length
  const current = done ? null : inspections[position]
  const inspected = inspections.slice(0, position)
  const order = new Map(inspected.map((item, i) => [item.index, i + 1]))
  const foundIndex = done && trace.found ? trace.index : null

  const hints = current
    ? [
        position === 0
          ? `Use h(key) = key mod m. Here the key is ${example.key} and m is ${m}.`
          : `The previous slot was ${inspections[position - 1].index}. Linear probing checks (index + 1) mod m.`,
        `The next slot to inspect is ${current.index}.`,
      ]
    : []

  function chooseSlot(index) {
    if (done) return
    if (index === current.index) {
      setPosition(position + 1)
      setWrong(null)
      setMistakes(0)
    } else {
      setWrong(index)
      setMistakes(mistakes + 1)
    }
  }

  function nextExample() {
    setExampleIndex((exampleIndex + 1) % SEARCH_EXAMPLES.length)
    setPosition(0)
    setWrong(null)
    setMistakes(0)
  }

  return (
    <section className="hash-search-practice" aria-label="Guided search practice">
      <div className="hash-search-section-heading">
        <div>
          <span className="eyebrow">GUIDED PRACTICE</span>
          <h2>You choose the next slot.</h2>
        </div>
        <span className="pill pill-blue">{example.label}</span>
      </div>
      <p>
        Search for <strong>{example.key}</strong> in this {m}-slot table. Click the slots in the
        order the search checks them, starting with the home slot.
      </p>

      <div className="hash-search-practice-prompt">
        <strong>
          {done
            ? 'Search complete'
            : position === 0
              ? `Which slot does the search check first? (${example.key} mod ${m})`
              : `Slot ${inspections[position - 1].index} did not end the search. Which slot is next?`}
        </strong>
      </div>

      <div
        className="hash-search-pick-table"
        style={{ '--search-columns': Math.min(m, 5) }}
        role="group"
        aria-label="Hash table. Click the next slot the search checks."
      >
        {example.table.map((slot, index) => {
          const value = slotLabel(slot)
          const step = order.get(index)
          const state =
            index === foundIndex
              ? 'found'
              : step !== undefined
                ? 'visited'
                : index === wrong
                  ? 'wrong'
                  : ''
          return (
            <button
              key={index}
              type="button"
              className={`hash-search-pick${state ? ` hash-search-pick--${state}` : ''}`}
              disabled={done || step !== undefined}
              onClick={() => chooseSlot(index)}
              aria-label={`Slot ${index}, ${
                value === null ? 'empty' : value === 'Deleted' ? 'deleted marker' : `key ${value}`
              }${step !== undefined ? `, inspected ${ordinal(step)}` : ''}`}
            >
              <span className="hash-search-pick-index">[{index}]</span>
              <span className="hash-search-pick-value">{value ?? '—'}</span>
              {step !== undefined && <span className="hash-search-pick-order">{step}</span>}
            </button>
          )
        })}
      </div>

      <div aria-live="polite">
        {wrong !== null && !done && (
          <FeedbackPanel
            correct={false}
            message={`Not slot ${wrong}.`}
            explanation={
              position === 0
                ? 'The search starts at the home slot: key mod m. The key’s value can differ from its slot index.'
                : 'Linear probing moves exactly one slot along, wrapping to slot 0 after the last slot.'
            }
          />
        )}
      </div>
      {mistakes > 0 && !done && (
        <ScaffoldingPanel
          title="Work through the next decision"
          hints={hints.slice(0, Math.min(mistakes, hints.length))}
        />
      )}

      {inspected.length > 0 && (
        <ol className="hash-search-practice-log" aria-label="Your search so far">
          {inspected.map((item, i) => (
            <li key={i}>
              <span>{item.index}</span>
              <p>{item.message}</p>
            </li>
          ))}
        </ol>
      )}

      {done && (
        <div className="hash-search-practice-done" role="status">
          <strong>
            {trace.found
              ? `Found key ${example.key} at slot ${trace.index}.`
              : `Key ${example.key} is absent.`}
          </strong>
          <p>
            {trace.checks} {trace.checks === 1 ? 'slot was' : 'slots were'} inspected.{' '}
            {trace.reason === 'empty'
              ? 'A never-used empty slot ends the search.'
              : trace.reason === 'exhausted'
                ? 'One complete circuit proves that the key is absent.'
                : 'The matching key ends the search.'}
          </p>
          <div className="hash-search-actions">
            <button type="button" className="secondary-button" onClick={nextExample}>
              Try another example
            </button>
            <button type="button" className="primary-button" onClick={onContinue}>
              Check my understanding →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
