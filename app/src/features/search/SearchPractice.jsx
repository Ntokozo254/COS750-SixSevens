import { useState } from 'react'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import { createSearchTrace } from '../../logic/searching'
import { SearchTable } from './SearchExplorer'
import { SEARCH_EXAMPLES } from './searchExamples'

export default function SearchPractice({ onContinue }) {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [position, setPosition] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const example = SEARCH_EXAMPLES[exampleIndex]
  const trace = createSearchTrace(example.table, example.key)
  const inspections = trace.steps.filter((item) =>
    ['collision', 'deleted', 'empty', 'found'].includes(item.type),
  )
  const current = inspections[position]
  const done = feedback === true && position === inspections.length - 1
  const visited = inspections
    .slice(0, position + (feedback === true ? 1 : 0))
    .map((item) => item.index)
  const hints = [
    position === 0
      ? `Use h(key) = key mod m. Here the key is ${example.key} and m is ${example.table.length}.`
      : `The previous slot was ${inspections[position - 1].index}. Linear probing checks (index + 1) mod m.`,
    `The next slot to inspect is ${current.index}. Read its contents, then decide whether to continue or stop.`,
  ]

  function chooseSlot(index) {
    if (feedback === true) return
    setSelected(index)
    const correct = index === current.index
    setFeedback(correct)
    if (!correct) setMistakes((previous) => previous + 1)
  }

  function nextDecision() {
    setPosition(position + 1)
    setSelected(null)
    setFeedback(null)
    setMistakes(0)
  }

  function nextExample() {
    setExampleIndex((exampleIndex + 1) % SEARCH_EXAMPLES.length)
    setPosition(0)
    setSelected(null)
    setFeedback(null)
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
        Search for <strong>{example.key}</strong> in this {example.table.length}-slot table. Choose
        each slot in the order the algorithm inspects it.
      </p>
      <SearchTable
        table={example.table}
        currentIndex={selected}
        matchIndex={feedback === true && current.type === 'found' ? current.index : null}
      />
      <div className="hash-search-practice-prompt">
        <strong>
          {done
            ? 'Search complete'
            : `Which slot should be inspected ${position === 0 ? 'first' : 'next'}?`}
        </strong>
        <p>
          {visited.length
            ? `Already inspected: ${visited.join(' → ')}.`
            : `Start with ${example.key} mod ${example.table.length}.`}
        </p>
      </div>
      <div className="hash-search-slot-choices" aria-label="Choose the next slot">
        {example.table.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`secondary-button${selected === index ? ' hash-search-choice-selected' : ''}`}
            aria-pressed={selected === index}
            disabled={feedback === true}
            onClick={() => chooseSlot(index)}
          >
            Slot {index}
          </button>
        ))}
      </div>
      {feedback !== null && (
        <div role="status">
          <FeedbackPanel
            correct={feedback}
            message={
              feedback
                ? `Correct. Inspect slot ${current.index}.`
                : 'Try the hash calculation or the next-slot rule.'
            }
            explanation={
              feedback
                ? current.message
                : 'Follow the probe sequence in order. The key’s numeric value can differ from its slot index.'
            }
          />
        </div>
      )}
      {mistakes > 0 && feedback !== true && (
        <ScaffoldingPanel
          title="Work through the next decision"
          hints={hints.slice(0, Math.min(mistakes, hints.length))}
        />
      )}
      {feedback === true && !done && (
        <button type="button" className="primary-button" onClick={nextDecision}>
          Next decision →
        </button>
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
