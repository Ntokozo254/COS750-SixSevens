import { useEffect, useId, useRef, useState } from 'react'
import QuizQuestion from '../../components/assessment/QuizQuestion'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import { markSearchAttempt, SEARCH_CONCEPT_GUIDANCE, SEARCH_QUESTION_SETS } from './searchQuestions'
import { createSearchCompletionEvidence } from './searchMastery'

const workedSearchHints = [
  'A 10-slot table holds 12, 22, and 32 at slots 2, 3, and 4. Slot 5 is truly empty.',
  'To find 32, calculate 32 mod 10 = 2. Inspect slots 2 and 3, then find the key at slot 4.',
  'To find 42, begin at slot 2 and follow the same path. Empty slot 5 ends the search with an absent result.',
  'Continue past a deleted marker. If every slot is occupied or deleted, finish after one complete traversal.',
]

export default function SearchAssessment({
  onComplete,
  completed = false,
  onReview,
  active = true,
}) {
  const instanceId = useId()
  const headingRef = useRef(null)
  const completionReported = useRef(false)
  const [round, setRound] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [confidence, setConfidence] = useState('')
  const [reflection, setReflection] = useState('')
  const questions = SEARCH_QUESTION_SETS[round]
  const question = questions[questionIndex]
  const submitted = answers.length > questionIndex
  const correct = submitted && answers[questionIndex] === question.correctAnswer
  const guidance = SEARCH_CONCEPT_GUIDANCE[question.concept]
  const result = answers.length === questions.length ? markSearchAttempt(questions, answers) : null

  useEffect(() => {
    if (active) headingRef.current?.focus({ preventScroll: true })
  }, [active, questionIndex, round])

  function checkAnswer() {
    if (submitted || selectedAnswer === null) return

    const nextAnswers = [...answers, selectedAnswer]
    setAnswers(nextAnswers)

    if (nextAnswers.length === questions.length) {
      const nextResult = markSearchAttempt(questions, nextAnswers)
      setAttempts((previous) => previous + 1)
      setBestScore((previous) => Math.max(previous, nextResult.score))

      if (nextResult.passed && !completed && !completionReported.current) {
        const evidence = createSearchCompletionEvidence(questions, nextAnswers)
        if (!evidence) return
        completionReported.current = true
        onComplete?.(evidence)
      }
    }
  }

  function nextQuestion() {
    setQuestionIndex((previous) => previous + 1)
    setSelectedAnswer(null)
  }

  function retry() {
    setRound((previous) => (previous + 1) % SEARCH_QUESTION_SETS.length)
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
  }

  const reviewTabs = result
    ? [...new Set(result.missedConcepts.map((concept) => SEARCH_CONCEPT_GUIDANCE[concept].review))]
    : []
  const reviewLabels = {
    learn: 'Review the lesson',
    explore: 'Replay a search',
    practice: 'Practise a stopping rule',
  }

  return (
    <section className="hash-search-assessment" aria-labelledby={`${instanceId}-title`}>
      <div className="hash-search-assessment-intro">
        <span className="eyebrow">LO5 KNOWLEDGE CHECK</span>
        <h2 id={`${instanceId}-title`}>Can you trace the search?</h2>
        <p>
          Five questions about probe order and stopping rules. Check each answer for feedback, then
          continue. Aim for at least 4 correct answers.
        </p>
        <p id={`${instanceId}-instructions`} className="hash-search-assessment-note">
          Choose an option, then select Check answer. Submitted answers stay fixed for this attempt.
          You can retry with another set of examples.
        </p>
        <p className="hash-search-assessment-note">
          {attempts > 0
            ? `${attempts} completed ${attempts === 1 ? 'attempt' : 'attempts'} · Best score ${bestScore}% this visit`
            : 'Untimed · Unlimited attempts · Attempt scores last for this visit'}
        </p>
      </div>

      <div className="hash-search-assessment-question">
        <h3 className="hash-search-assessment-position" tabIndex={-1} ref={headingRef}>
          Question {questionIndex + 1} of {questions.length}
        </h3>
        <fieldset disabled={submitted} aria-describedby={`${instanceId}-instructions`}>
          <legend className="hash-search-assessment-legend">Select one answer</legend>
          <QuizQuestion
            question={question.question}
            options={question.options}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={setSelectedAnswer}
            onSubmit={checkAnswer}
          />
        </fieldset>
        {selectedAnswer !== null && !submitted && (
          <p className="hash-search-assessment-selection" role="status">
            Selected {String.fromCharCode(65 + selectedAnswer)}. {question.options[selectedAnswer]}
          </p>
        )}
        {submitted && (
          <div className="hash-search-assessment-feedback" role="status" aria-live="polite">
            <FeedbackPanel
              correct={correct}
              message={
                correct
                  ? 'Correct. Follow that reasoning through the next example.'
                  : 'Review this search step.'
              }
              explanation={question.explanation}
            />
            {!correct && <ScaffoldingPanel title={guidance.title} hints={guidance.hints} />}
            {questionIndex < questions.length - 1 && (
              <button className="primary-button" type="button" onClick={nextQuestion}>
                Next question
              </button>
            )}
          </div>
        )}
      </div>

      {result && (
        <section
          className={`hash-search-assessment-result${result.passed ? ' hash-search-assessment-result--passed' : ''}`}
          aria-labelledby={`${instanceId}-result`}
          role="status"
        >
          <h3 id={`${instanceId}-result`}>
            {result.correct} out of {result.total} · {result.score}%
          </h3>
          {result.passed ? (
            <p>
              You have reached the 80% target for LO5. Explain why a deleted marker keeps the search
              going and a truly empty slot lets it stop.
            </p>
          ) : (
            <p>
              {result.score < 60
                ? 'Start with the complete example below, then replay the steps before trying another set.'
                : 'You are close to the target. Review the missed steps below, then try another set.'}
            </p>
          )}
          {result.score < 60 && (
            <ScaffoldingPanel title="Replay a complete search" hints={workedSearchHints} />
          )}
          {result.missedConcepts.length > 0 && (
            <ScaffoldingPanel
              title="Focus your next practice"
              hints={result.missedConcepts.map(
                (concept) =>
                  `${SEARCH_CONCEPT_GUIDANCE[concept].title}. ${SEARCH_CONCEPT_GUIDANCE[concept].hints[0]}`,
              )}
            />
          )}
          <div className="hash-search-assessment-actions">
            {onReview && result.score < 60 && !reviewTabs.includes('learn') && (
              <button className="secondary-button" type="button" onClick={() => onReview('learn')}>
                Review the lesson
              </button>
            )}
            {onReview &&
              reviewTabs.map((tab) => (
                <button
                  className="secondary-button"
                  type="button"
                  key={tab}
                  onClick={() => onReview(tab)}
                >
                  {reviewLabels[tab]}
                </button>
              ))}
            <button className="primary-button" type="button" onClick={retry}>
              Try another set
            </button>
          </div>
        </section>
      )}
      <section
        className="hash-search-reflection"
        aria-labelledby={`${instanceId}-reflection-title`}
      >
        <h3 id={`${instanceId}-reflection-title`}>Take the idea to your lecture.</h3>
        <p>
          Explain why a deleted marker keeps a search going while a never-used empty slot lets it
          stop. Identify one step you would like to discuss.
        </p>
        <label htmlFor={`${instanceId}-reflection`}>Your explanation or question</label>
        <textarea
          id={`${instanceId}-reflection`}
          rows={3}
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
        />
        <label htmlFor={`${instanceId}-confidence`}>
          How confident do you feel about tracing a search?
        </label>
        <select
          id={`${instanceId}-confidence`}
          value={confidence}
          onChange={(event) => setConfidence(event.target.value)}
        >
          <option value="">Choose when you are ready</option>
          <option value="support">I would like another worked example</option>
          <option value="guided">I can trace a search with hints</option>
          <option value="independent">I can trace and explain it independently</option>
        </select>
        <p className="hash-search-note">
          This reflection is optional and ungraded. Your notes and confidence choice stay available
          during this module visit.
        </p>
      </section>
    </section>
  )
}
