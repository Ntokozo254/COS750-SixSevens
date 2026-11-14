import { useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Callout, InkButton, Stage } from './ProbingUi'
import { markProbingAttempt, PROBING_CONCEPTS, PROBING_QUESTION_SETS } from './probingQuestions'

const REFRESHER = [
  'Work out the home slot: key mod m. For 32 in a 10-slot table that is slot 2.',
  'If the slot is empty, store the key there and stop.',
  'If it is taken, that is a collision: move to (index + 1) mod m and check again.',
  'After the last slot comes slot 0. After m checks with no empty slot, the table is full.',
]

const REVIEW_LABELS = {
  learn: 'Review the rule',
  trace: 'Watch it insert again',
  practice: 'Practise placing keys',
}

function optionClass({ selected, submitted, isCorrect }) {
  if (submitted && isCorrect) return 'bg-emerald-400/20 text-white ring-2 ring-emerald-400'
  if (submitted && selected) return 'bg-red-400/20 text-white ring-2 ring-red-400'
  if (selected) return 'bg-white text-blue-700 ring-2 ring-white'
  return 'bg-white/5 text-blue-50 ring-1 ring-white/15 hover:bg-white/10'
}

export default function ProbingCheck({ completed = false, onComplete, onReview }) {
  const titleId = useId()
  const headingRef = useRef(null)
  const reported = useRef(false)
  const moved = useRef(false)
  const [round, setRound] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [best, setBest] = useState(0)
  const [reflection, setReflection] = useState('')

  const questions = PROBING_QUESTION_SETS[round]
  const question = questions[questionIndex]
  const submitted = answers.length > questionIndex
  const correct = submitted && answers[questionIndex] === question.correctAnswer
  const result = answers.length === questions.length ? markProbingAttempt(questions, answers) : null

  // Move focus to the new question for keyboard and screen-reader users (not on first load).
  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: false })
  }, [questionIndex, round])

  function checkAnswer() {
    if (submitted || selected === null) return
    const next = [...answers, selected]
    setAnswers(next)
    if (next.length === questions.length) {
      const marked = markProbingAttempt(questions, next)
      setAttempts((count) => count + 1)
      setBest((score) => Math.max(score, marked.score))
      if (marked.passed && !completed && !reported.current) {
        reported.current = true
        onComplete?.()
      }
    }
  }

  function nextQuestion() {
    moved.current = true
    setQuestionIndex((index) => index + 1)
    setSelected(null)
  }

  function retry() {
    moved.current = true
    setRound((value) => (value + 1) % PROBING_QUESTION_SETS.length)
    setQuestionIndex(0)
    setSelected(null)
    setAnswers([])
  }

  const reviewTabs = result
    ? [...new Set(result.missedConcepts.map((concept) => PROBING_CONCEPTS[concept].review))]
    : []

  return (
    <Stage eyebrow="Step 4 of 4 · Knowledge check" title="Can you insert with linear probing?" titleId={titleId}>
      <p className="text-sm leading-relaxed text-blue-100">
        Five questions, one for each idea in this module. Check each answer for feedback. Aim for at least 4 out of 5.
      </p>
      <p className="text-[11px] text-blue-200">
        {attempts > 0
          ? `${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} · best score ${best}% this visit`
          : 'Untimed · unlimited attempts · nothing here counts towards your mark'}
      </p>

      <div className="grid gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 @lg:p-4">
        <h4
          ref={headingRef}
          tabIndex={-1}
          className="text-[11px] font-bold uppercase tracking-widest text-blue-200 outline-none"
        >
          Question {questionIndex + 1} of {questions.length}
        </h4>
        <p className="text-base font-bold leading-snug text-white" id={`${titleId}-q`}>
          {question.question}
        </p>
        <div className="grid gap-2" role="radiogroup" aria-labelledby={`${titleId}-q`}>
          {question.options.map((option, index) => {
            const isSelected = (submitted ? answers[questionIndex] : selected) === index
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={submitted}
                onClick={() => setSelected(index)}
                className={`flex items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow disabled:cursor-default ${optionClass(
                  { selected: isSelected, submitted, isCorrect: index === question.correctAnswer },
                )}`}
              >
                <span
                  className={`grid size-6 flex-none place-items-center rounded-md text-[11px] font-extrabold ${
                    isSelected && !submitted ? 'bg-sky-950 text-white' : 'bg-white/15 text-current'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {submitted && index === question.correctAnswer && <CheckCircle2 size={17} aria-label="correct answer" />}
                {submitted && isSelected && index !== question.correctAnswer && (
                  <XCircle size={17} aria-label="your answer" />
                )}
              </button>
            )
          })}
        </div>

        {!submitted && (
          <div>
            <InkButton variant="go" disabled={selected === null} onClick={checkAnswer}>
              Check answer
            </InkButton>
          </div>
        )}

        <div aria-live="polite" className="grid gap-2">
          {submitted && (
            <>
              <Callout tone={correct ? 'good' : 'bad'} title={correct ? 'Correct.' : 'Not quite.'}>
                {question.explanation}
              </Callout>
              {!correct && (
                <Callout tone="warn" title={PROBING_CONCEPTS[question.concept].title}>
                  {PROBING_CONCEPTS[question.concept].hint}
                </Callout>
              )}
            </>
          )}
        </div>

        {submitted && questionIndex < questions.length - 1 && (
          <div>
            <InkButton variant="go" onClick={nextQuestion}>
              Next question →
            </InkButton>
          </div>
        )}
      </div>

      {result && (
        <div className="grid gap-3" role="status">
          <Callout
            tone={result.passed ? 'good' : result.score < 60 ? 'bad' : 'warn'}
            title={`${result.correct} out of ${result.total} · ${result.score}%`}
          >
            {result.passed
              ? 'You reached the 80% target for LO4, so this module is now marked complete. Next, use the same probe path to search for keys in Module 5.'
              : result.score < 60
                ? 'Let us rebuild it step by step. Read the refresher below, watch an insert again, then try another set.'
                : 'Close. Review the idea you missed, then try another set.'}
          </Callout>

          {result.score < 60 && (
            <Callout tone="info" title="Refresher: the insert rule">
              <ol className="m-0 grid gap-1 pl-5">
                {REFRESHER.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </Callout>
          )}

          {result.missedConcepts.length > 0 && (
            <Callout tone="warn" title="Focus your next practice">
              <ul className="m-0 grid gap-1 pl-5">
                {result.missedConcepts.map((concept) => (
                  <li key={concept}>
                    <strong className="text-white">{PROBING_CONCEPTS[concept].title}.</strong>{' '}
                    {PROBING_CONCEPTS[concept].hint}
                  </li>
                ))}
              </ul>
            </Callout>
          )}

          <div className="flex flex-wrap gap-2">
            {onReview &&
              [...new Set([...(result.score < 60 ? ['learn', 'trace'] : []), ...reviewTabs])].map((tab) => (
                <InkButton key={tab} variant="off" onClick={() => onReview(tab)}>
                  {REVIEW_LABELS[tab]}
                </InkButton>
              ))}
            <InkButton variant="go" onClick={retry}>
              Try another set
            </InkButton>
          </div>
        </div>
      )}

      <div className="grid gap-2 rounded-xl bg-blue-950/40 p-3 ring-1 ring-white/10">
        <p className="font-bold text-white">Take it to the lecture</p>
        <p className="text-sm leading-relaxed text-blue-100">
          Linear probing keeps collided keys next to each other. What do you think happens to insert and search times
          as the table fills up? Write one question to ask in the lecture. Module 6 explores this.
        </p>
        <label htmlFor={`${titleId}-reflection`} className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
          Your question (optional, not graded)
        </label>
        <textarea
          id={`${titleId}-reflection`}
          rows={3}
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          className="w-full resize-y rounded-lg border-0 bg-white/10 p-2 text-sm text-white placeholder:text-blue-200/70 focus-visible:outline-2 focus-visible:outline-yellow"
          placeholder="e.g. Why do long runs of full slots make collisions more likely?"
        />
      </div>
    </Stage>
  )
}
