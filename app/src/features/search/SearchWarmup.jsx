import { useId, useState } from 'react'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'

const checks = [
  {
    id: 'home',
    question: 'A table has 10 slots and uses key mod 10. What is the home slot for key 32?',
    options: [3, 2, 10],
    answer: 2,
    explanation: '32 = 3 × 10 + 2. The remainder is 2, so the home slot is index 2.',
    hints: [
      'Modulo asks for the remainder. Remove complete groups of 10 from 32 and consider what is left.',
      'Three groups use 30. The remaining 32 − 30 = 2 gives the home slot.',
    ],
  },
  {
    id: 'wrap',
    question: 'Linear probing reaches slot 9 in a 10-slot table. Which slot comes next?',
    options: [10, 0, 8],
    answer: 0,
    explanation:
      'The indices run from 0 to 9. After slot 9, (9 + 1) mod 10 = 0, so probing wraps to slot 0.',
    hints: [
      'A 10-slot table has indices 0 through 9. At the end, continue from the first slot.',
      'Apply the next-slot rule. (9 + 1) mod 10 = 10 mod 10 = 0.',
    ],
  },
]

export default function SearchWarmup() {
  const instanceId = useId()
  const [responses, setResponses] = useState({
    home: { selectedAnswer: null, mistakes: 0 },
    wrap: { selectedAnswer: null, mistakes: 0 },
  })

  function chooseAnswer(check, answer) {
    setResponses((previous) => ({
      ...previous,
      [check.id]: {
        selectedAnswer: answer,
        mistakes: previous[check.id].mistakes + (answer === check.answer ? 0 : 1),
      },
    }))
  }

  return (
    <section className="hash-search-warmup" aria-labelledby={`${instanceId}-title`}>
      <div className="hash-search-warmup-intro">
        <span className="eyebrow">QUICK REFRESHER</span>
        <h3 id={`${instanceId}-title`}>Two rules before you start.</h3>
        <p>
          A slot is one position in the table. Its index is its position number, beginning at 0.
          Modulo gives the remainder after division. For example, 23 mod 10 = 3.
        </p>
        <p>
          Try these optional checks. You can change your answer and practise as often as you like.
        </p>
      </div>

      {checks.map((check) => {
        const response = responses[check.id]
        const answered = response.selectedAnswer !== null
        const correct = response.selectedAnswer === check.answer
        const questionId = `${instanceId}-${check.id}`

        return (
          <div className="hash-search-warmup-check" key={check.id}>
            <h4 id={questionId}>{check.question}</h4>
            <div className="hash-search-warmup-options" role="group" aria-labelledby={questionId}>
              {check.options.map((option) => (
                <button
                  className="secondary-button"
                  type="button"
                  key={option}
                  aria-pressed={response.selectedAnswer === option}
                  onClick={() => chooseAnswer(check, option)}
                >
                  Slot {option}
                </button>
              ))}
            </div>
            {answered && (
              <div className="hash-search-warmup-feedback" role="status" aria-live="polite">
                <FeedbackPanel
                  correct={correct}
                  message={
                    correct
                      ? 'Correct. You can use this rule in the search.'
                      : 'Use the refresher, then choose another answer.'
                  }
                  explanation={correct ? check.explanation : undefined}
                />
                {!correct && (
                  <ScaffoldingPanel
                    title={
                      check.id === 'home' ? 'Work out the remainder' : 'Follow the next-slot rule'
                    }
                    hints={check.hints.slice(0, Math.min(response.mistakes, check.hints.length))}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
