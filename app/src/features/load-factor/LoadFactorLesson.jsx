import { useId, useState } from 'react'
import TopicLesson from '../learning/TopicLesson'
import { SearchTable } from '../search/SearchExplorer'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import { LOAD_FACTOR_PRACTICE, LOAD_FACTOR_TOPIC } from './loadFactorData.js'
import {
  createComparisonTables,
  getTableStats,
  measureInsertion,
  measureSearch,
  rehashTable,
} from './loadFactorLogic.js'

function ComparisonTable({ title, table, query }) {
  const stats = getTableStats(table)
  const search = measureSearch(table, query)
  const insertion = measureInsertion(table, query)

  return (
    <section className="hash-topic-card" aria-label={title}>
      <h3>{title}</h3>
      <SearchTable
        table={table}
        currentIndex={search.path.at(-1)}
        matchIndex={search.found ? search.index : null}
      />
      <dl className="hash-topic-stats">
        <div className="hash-topic-metric">
          <dt>Load factor</dt>
          <dd>{stats.entries} / {stats.capacity} = {stats.loadFactor.toFixed(2)}</dd>
        </div>
        <div className="hash-topic-metric">
          <dt>Longest occupied cluster</dt>
          <dd>{stats.longestCluster} {stats.longestCluster === 1 ? 'slot' : 'slots'}</dd>
        </div>
        <div className="hash-topic-metric">
          <dt>Search for {query}</dt>
          <dd>{search.probes} {search.probes === 1 ? 'probe' : 'probes'} · {search.found ? `found at ${search.index}` : 'absent'}</dd>
        </div>
        <div className="hash-topic-metric">
          <dt>Try inserting {query}</dt>
          <dd>
            {insertion.probes} {insertion.probes === 1 ? 'probe' : 'probes'} ·{' '}
            {insertion.inserted
              ? `would insert at ${insertion.index}`
              : insertion.reason === 'duplicate'
                ? 'key already stored'
                : 'table full'}
          </dd>
        </div>
      </dl>
      <p className="hash-topic-note">Search path {search.path.join(' → ')}.</p>
      <p className="hash-topic-note">Insertion is measured on a copy of this table.</p>
    </section>
  )
}

function LoadFactorExplorer() {
  const instanceId = useId()
  const [entries, setEntries] = useState(5)
  const [keyInput, setKeyInput] = useState('100')
  const [query, setQuery] = useState(100)
  const [error, setError] = useState('')
  const [showRehash, setShowRehash] = useState(false)
  const tables = createComparisonTables(entries, 10)
  const resized = rehashTable(tables.clustered, 20)
  const resizedStats = getTableStats(resized)
  const resizedSearch = measureSearch(resized, query)

  function measureKey(event) {
    event.preventDefault()
    const key = Number(keyInput)
    if (!/^\d+$/.test(keyInput.trim()) || !Number.isSafeInteger(key) || key > 1_000_000) {
      setError('Enter a whole-number key from 0 to 1,000,000.')
      return
    }
    setQuery(key)
    setError('')
  }

  return (
    <div className="hash-topic-explorer">
      <h2>Same occupancy. Different probe paths.</h2>
      <p>
        Both tables have ten slots and the same number of entries. The spread example begins with
        home slots across the table. The clustered example uses keys sharing home slot zero.
        Change the occupancy or key, then compare the measured paths.
      </p>
      <div className="hash-topic-controls">
        <label htmlFor={`${instanceId}-entries`}>
          Entries in each table
          <input
            id={`${instanceId}-entries`}
            type="range"
            min={0}
            max={10}
            step={1}
            value={entries}
            onChange={(event) => setEntries(Number(event.target.value))}
          />
          <output htmlFor={`${instanceId}-entries`}>
            {entries} {entries === 1 ? 'entry' : 'entries'} / 10 slots · α = {(entries / 10).toFixed(2)}
          </output>
        </label>
        <div className="hash-topic-actions" aria-label="Occupancy presets">
          {[0, 3, 5, 8, 10].map((count) => (
            <button
              className="secondary-button"
              key={count}
              type="button"
              aria-pressed={entries === count}
              onClick={() => setEntries(count)}
            >
              {count === 0 ? 'Empty' : count === 10 ? 'Full' : `${count * 10}% occupied`}
            </button>
          ))}
        </div>
        <form onSubmit={measureKey}>
          <label htmlFor={`${instanceId}-query`}>Key to search for or try inserting</label>
          <div className="hash-topic-input-row">
            <input
              id={`${instanceId}-query`}
              inputMode="numeric"
              value={keyInput}
              onChange={(event) => {
                setKeyInput(event.target.value)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${instanceId}-error` : undefined}
            />
            <button className="primary-button" type="submit">Measure probes</button>
          </div>
          {error && <p className="hash-topic-form-error" id={`${instanceId}-error`} role="alert">{error}</p>}
        </form>
      </div>

      <div className="hash-topic-columns" aria-live="polite">
        <ComparisonTable title="Spread home slots" table={tables.spread} query={query} />
        <ComparisonTable title="Shared home slot" table={tables.clustered} query={query} />
      </div>
      <p className="hash-topic-note">
        These probe counts measure key {query} in the displayed tables. Count every inspected slot,
        including the matching or empty stopping position. A full scan stops after ten inspections.
      </p>

      <section className="hash-topic-rehash">
        <h3>Grow the table and rehash its keys</h3>
        <p>
          A larger capacity changes each key mod m calculation. Reinsert the current clustered
          example into twenty slots and examine its new layout.
        </p>
        <button
          className="secondary-button"
          type="button"
          aria-expanded={showRehash}
          aria-controls={`${instanceId}-rehash`}
          onClick={() => setShowRehash((previous) => !previous)}
        >
          {showRehash ? 'Hide rehashed table' : 'Rehash into 20 slots'}
        </button>
        {showRehash && (
          <div id={`${instanceId}-rehash`}>
            <SearchTable table={resized} />
            <p>
              The same {entries} {entries === 1 ? 'entry is' : 'entries are'} now stored in a table with 20 slots. α = {entries} / 20 ={' '}
              {resizedStats.loadFactor.toFixed(2)}. The longest cluster has{' '}
              {resizedStats.longestCluster} {resizedStats.longestCluster === 1 ? 'slot' : 'slots'}. Searching for {query} inspects{' '}
              {resizedSearch.probes} {resizedSearch.probes === 1 ? 'slot' : 'slots'} and {resizedSearch.found ? 'finds the key' : 'reports it absent'}.
            </p>
            {entries > 1 && (
              <p className="hash-topic-note">
                Key 10 previously hashed to slot 0 and occupied slot 1 after a collision. With
                capacity 20, its home slot is 10 and it is reinserted there.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function LoadFactorPractice() {
  const instanceId = useId()
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const [hintCount, setHintCount] = useState(0)
  const task = LOAD_FACTOR_PRACTICE[round]
  const correct = selected === task.correctAnswer

  function checkAnswer() {
    if (selected === null || checked) return
    setChecked(true)
    if (!correct) setHintCount((count) => Math.min(count + 1, task.hints.length))
  }

  function nextExample() {
    setRound((previous) => (previous + 1) % LOAD_FACTOR_PRACTICE.length)
    setSelected(null)
    setChecked(false)
    setHintCount(0)
  }

  return (
    <section className="hash-topic-practice" aria-labelledby={`${instanceId}-title`}>
      <h2 id={`${instanceId}-title`}>Calculate, predict, then check.</h2>
      <p>Use the table to explain your answer. You can request hints or try another example at any time.</p>
      <SearchTable table={task.table} />
      <h3 id={`${instanceId}-question`}>{task.question}</h3>
      <div className="hash-topic-options" role="group" aria-labelledby={`${instanceId}-question`}>
        {task.options.map((option, index) => (
          <button
            key={option}
            className="secondary-button"
            type="button"
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index)
              setChecked(false)
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="hash-topic-actions">
        <button
          className="primary-button"
          type="button"
          disabled={selected === null || checked}
          onClick={checkAnswer}
        >
          Check my reasoning
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={hintCount === task.hints.length}
          onClick={() => setHintCount((count) => Math.min(count + 1, task.hints.length))}
        >
          Show a hint
        </button>
        <button className="secondary-button" type="button" onClick={nextExample}>Another example</button>
      </div>
      {checked && (
        <div role="status" aria-live="polite">
          <FeedbackPanel
            correct={correct}
            message={correct ? 'Correct. Follow the same reasoning on a fresh example.' : 'Use the table and hint, then try another answer.'}
            explanation={correct ? task.explanation : task.hints[0]}
          />
        </div>
      )}
      {hintCount > 0 && (
        <ScaffoldingPanel title="Work through the next step" hints={task.hints.slice(0, hintCount)} />
      )}
    </section>
  )
}

export default function LoadFactorLesson({ completed, onComplete, preferences }) {
  return (
    <TopicLesson
      topic={LOAD_FACTOR_TOPIC}
      Explorer={LoadFactorExplorer}
      Practice={LoadFactorPractice}
      completed={completed}
      onComplete={onComplete}
      preferences={preferences}
    />
  )
}
