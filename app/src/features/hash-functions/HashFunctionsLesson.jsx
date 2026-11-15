import { useId, useState } from 'react'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import TopicLesson from '../learning/TopicLesson'
import { SearchTable } from '../search/SearchExplorer'
import { HASH_FUNCTIONS_TOPIC, HASH_PRACTICE_CASES } from './hashFunctionsData'
import { calculateHashExample } from './hashFunctionsLogic'

function HashFunctionsExplorer() {
  const instanceId = useId()
  const [keyInput, setKeyInput] = useState('23')
  const [sizeInput, setSizeInput] = useState('10')
  const [example, setExample] = useState(() => calculateHashExample(23, 10))
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const current = example.steps[step]
  const anotherKey = example.key >= example.tableSize
    ? example.key - example.tableSize
    : example.key + example.tableSize

  function startExample(event) {
    event.preventDefault()
    if (!/^\d+$/.test(keyInput.trim()) || !/^\d+$/.test(sizeInput.trim())) {
      setError('Enter a whole-number key from 0 to 1,000,000 and a table size from 1 to 20.')
      return
    }

    try {
      const nextExample = calculateHashExample(Number(keyInput), Number(sizeInput))
      setExample(nextExample)
      setStep(0)
      setError('')
    } catch (inputError) {
      setError(inputError.message)
    }
  }

  return (
    <section className="hash-topic-explorer" aria-labelledby={`${instanceId}-title`}>
      <h3 id={`${instanceId}-title`}>Calculate a starting position.</h3>
      <p>Choose a key and table size, then follow the calculation at your own pace.</p>
      <form className="hash-topic-controls" onSubmit={startExample}>
        <label htmlFor={`${instanceId}-key`}>
          Key, from 0 to 1,000,000
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
        </label>
        <label htmlFor={`${instanceId}-size`}>
          Table size, from 1 to 20
          <input
            id={`${instanceId}-size`}
            inputMode="numeric"
            value={sizeInput}
            onChange={(event) => {
              setSizeInput(event.target.value)
              setError('')
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${instanceId}-error` : undefined}
          />
        </label>
        <button className="primary-button" type="submit">Start calculation</button>
      </form>
      {error && <p className="hash-topic-error" id={`${instanceId}-error`} role="alert">{error}</p>}

      <div className="hash-topic-output hash-topic-demo">
        <div className="hash-topic-stage hash-topic-step" aria-live="polite" aria-atomic="true">
          <p className="hash-topic-note">Step {step + 1} of {example.steps.length}</p>
          <h3>{current.title}</h3>
          <p>{current.explanation}</p>
          <p className="hash-topic-formula">
            {step === 0 && `h(${example.key}) = ${example.key} mod ${example.tableSize}`}
            {step === 1 && `${example.key} = ${example.quotient} × ${example.tableSize} + ?`}
            {step >= 2 && `${example.key} = ${example.quotient} × ${example.tableSize} + ${example.remainder}`}
          </p>
          {step >= 2 && <p><strong>Home slot {example.homeIndex}.</strong> Its index is within 0 through {example.tableSize - 1}.</p>}
          {step === 3 && (
            <p>
              For comparison, {anotherKey} mod {example.tableSize} also gives {example.homeIndex}.
              Both keys share a home slot. Repeating either calculation gives its same result.
            </p>
          )}
        </div>
        <SearchTable
          table={Array(example.tableSize).fill(null)}
          currentIndex={step >= 2 ? example.homeIndex : null}
        />
        <p className="hash-topic-note">
          {step >= 2
            ? 'The table is empty. The highlighted position shows the calculated home slot.'
            : 'Advance to the remainder step to highlight the home slot in this empty table.'}
        </p>
        <div className="hash-topic-actions">
          <button className="secondary-button" type="button" disabled={step === 0} onClick={() => setStep((previous) => previous - 1)}>Previous step</button>
          <button className="secondary-button" type="button" onClick={() => setStep(0)}>Replay calculation</button>
          <button className="primary-button" type="button" disabled={step === example.steps.length - 1} onClick={() => setStep((previous) => previous + 1)}>Next step</button>
        </div>
      </div>
    </section>
  )
}

function HashFunctionsPractice() {
  const instanceId = useId()
  const [caseIndex, setCaseIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [error, setError] = useState('')
  const currentCase = HASH_PRACTICE_CASES[caseIndex]
  const example = calculateHashExample(currentCase.key, currentCase.tableSize)
  const hints = [
    `Remove complete groups of ${example.tableSize}. The remainder is smaller than ${example.tableSize}.`,
    `${example.quotient} complete groups use ${example.quotient} × ${example.tableSize} = ${example.quotient * example.tableSize}. Subtract that amount from ${example.key}.`,
    `${example.key} = ${example.quotient} × ${example.tableSize} + ${example.remainder}. The remainder, ${example.remainder}, is the home-slot index.`,
  ]

  function checkAnswer(event) {
    event.preventDefault()
    if (!/^[+-]?\d+$/.test(answer.trim()) || !Number.isSafeInteger(Number(answer))) {
      setError('Enter a whole-number slot index to check your calculation.')
      return
    }

    const correct = Number(answer) === example.homeIndex
    setFeedback(correct)
    setError('')
    if (!correct) setHintLevel((previous) => Math.min(previous + 1, hints.length))
  }

  function nextExample() {
    setCaseIndex((previous) => (previous + 1) % HASH_PRACTICE_CASES.length)
    setAnswer('')
    setFeedback(null)
    setHintLevel(0)
    setError('')
  }

  return (
    <section className="hash-topic-practice" aria-labelledby={`${instanceId}-title`}>
      <h3 id={`${instanceId}-title`}>You calculate the home slot.</h3>
      <p>
        The key is <strong>{example.key}</strong> and the table has <strong>{example.tableSize} slots</strong>.
        Use h(key) = key mod table size. Which index is the home slot?
      </p>
      <SearchTable
        table={Array(example.tableSize).fill(null)}
        currentIndex={feedback === true ? example.homeIndex : null}
      />
      <form className="hash-topic-controls" onSubmit={checkAnswer}>
        <label htmlFor={`${instanceId}-answer`}>
          Your home-slot index
          <input
            id={`${instanceId}-answer`}
            inputMode="numeric"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value)
              setFeedback(null)
              setError('')
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${instanceId}-error` : `${instanceId}-range`}
          />
        </label>
        <button className="primary-button" type="submit">Check home slot</button>
      </form>
      <p id={`${instanceId}-range`} className="hash-topic-note">This table has indices 0 through {example.tableSize - 1}. You can revise your answer as often as you like.</p>
      {error && <p className="hash-topic-error" id={`${instanceId}-error`} role="alert">{error}</p>}
      {feedback !== null && (
        <div role="status" aria-live="polite">
          <FeedbackPanel
            correct={feedback}
            message={feedback ? 'Correct. The remainder gives the home slot.' : 'Try the remainder calculation again.'}
            explanation={feedback
              ? `${example.key} = ${example.quotient} × ${example.tableSize} + ${example.remainder}. The highlighted index ${example.homeIndex} is the home slot.`
              : `The home slot must be within 0 through ${example.tableSize - 1}. Use the amount left after complete groups of ${example.tableSize}.`}
          />
        </div>
      )}
      {hintLevel > 0 && feedback !== true && <ScaffoldingPanel title="Build the calculation" hints={hints.slice(0, hintLevel)} />}
      <div className="hash-topic-actions">
        <button className="secondary-button" type="button" disabled={hintLevel === hints.length || feedback === true} onClick={() => setHintLevel((previous) => Math.min(previous + 1, hints.length))}>Show another hint</button>
        <button className="secondary-button" type="button" onClick={nextExample}>Try another example</button>
      </div>
    </section>
  )
}

export default function HashFunctionsLesson({ completed, onComplete, preferences }) {
  return (
    <TopicLesson
      topic={HASH_FUNCTIONS_TOPIC}
      Explorer={HashFunctionsExplorer}
      Practice={HashFunctionsPractice}
      completed={completed}
      onComplete={onComplete}
      preferences={preferences}
    />
  )
}
