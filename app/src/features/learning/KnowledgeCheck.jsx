import { useEffect, useId, useRef, useState } from 'react'
import QuizQuestion from '../../components/assessment/QuizQuestion'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import { markSearchAttempt } from '../search/searchQuestions'
import { createCompletionEvidence } from './assessmentEvidence'

export default function KnowledgeCheck({
  topic,
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
  const questions = topic.questionSets[round]
  const question = questions[questionIndex]
  const submitted = answers.length > questionIndex
  const correct = submitted && answers[questionIndex] === question.correctAnswer
  const guidance = topic.concepts[question.concept]
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
        const evidence = createCompletionEvidence(
          topic.questionSets,
          questions,
          nextAnswers,
          undefined,
          topic.id === 5 ? undefined : topic.id,
        )
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
    setRound((previous) => (previous + 1) % topic.questionSets.length)
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
  }

  const reviewTabs = result
    ? [...new Set(result.missedConcepts.map((concept) => topic.concepts[concept].review))]
    : []
  const reviewLabels = {
    learn: 'Review the lesson',
    explore: 'Explore a worked example',
    practice: 'Try guided practice',
  }

  return (
    <section
      data-module-id={topic.id}
      className="hash-search-assessment"
      aria-labelledby={`${instanceId}-title`}
    >
      <div className="hash-search-assessment-intro">
        <span className="eyebrow">LO{topic.id} KNOWLEDGE CHECK</span>
        <h2 id={`${instanceId}-title`}>{topic.assessmentTitle ?? 'Check your understanding'}</h2>
        <p>
          Check each of the five answers for feedback, then continue. Aim for at least 4 correct
          answers.
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
                  : 'Review this decision.'
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
              You have reached the 80% target for LO{topic.id}.{' '}
              {topic.masteryMessage ?? 'Explain one decision from this lesson in your own words.'}
            </p>
          ) : (
            <p>
              {result.score < 60
                ? 'Start with the complete example below, then replay the steps before trying another set.'
                : 'You are close to the target. Review the missed steps below, then try another set.'}
            </p>
          )}
          {result.score < 60 && (
            <ScaffoldingPanel title="Review a complete worked example" hints={topic.refresher} />
          )}
          {result.missedConcepts.length > 0 && (
            <ScaffoldingPanel
              title="Focus your next practice"
              hints={result.missedConcepts.map(
                (concept) =>
                  `${topic.concepts[concept].title}. ${topic.concepts[concept].hints[0]}`,
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
    </section>
  )
}
