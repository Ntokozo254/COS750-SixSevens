import { useState } from "react"
import Button from "./Button"

// Generic short formative check. Each question has an answer key, an options map
// (option -> feedback aimed at the misconception behind it) and optional labels.
export default function QuizVisual({ questions: QUESTIONS, passMark, passText, retryText }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)

  const done = index >= QUESTIONS.length

  if (done) {
    const passed = score >= passMark
    return (
      <div className="grid gap-3 rounded-xl bg-blue-700/40 p-4 text-center">
        <p className="font-heading text-2xl font-extrabold text-white">
          {score} / {QUESTIONS.length}
        </p>
        <p className="text-sm text-blue-100">
          {passed ? passText : retryText}
        </p>
        <div data-no-swipe className="flex justify-center">
          <Button
            onClick={() => {
              setIndex(0)
              setPicked(null)
              setScore(0)
            }}
            className="bg-white text-blue-700 hover:bg-blue-50"
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[index]
  const answered = picked !== null
  const correct = picked === q.answer

  function choose(option) {
    if (answered) return
    setPicked(option)
    if (option === q.answer) setScore((s) => s + 1)
  }

  return (
    <div data-no-swipe className="grid gap-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
        Question {index + 1} of {QUESTIONS.length}
      </p>
      <p className="font-semibold text-white">{q.prompt}</p>

      <div className="grid gap-2">
        {Object.keys(q.options).map((option) => {
          const isPicked = option === picked
          const isAnswer = option === q.answer
          let tone = "bg-blue-700/40 text-white hover:bg-blue-700/60"
          if (answered && isAnswer) tone = "bg-emerald-400/25 text-white ring-2 ring-emerald-400"
          else if (answered && isPicked) tone = "bg-red-400/20 text-white ring-2 ring-red-400"
          else if (answered) tone = "bg-blue-700/20 text-blue-200"
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => choose(option)}
              className={`rounded-lg border-0 px-3 py-2 text-left text-sm font-semibold transition-colors ${tone}`}
            >
              {q.labels?.[option] ?? `Slot ${option}`}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="min-h-12">
        {answered && (
          <p
            className={`rounded-lg p-3 text-sm ring-1 ${
              correct ? "bg-emerald-400/15 text-emerald-100 ring-emerald-400/60" : "bg-red-400/15 text-red-100 ring-red-400/60"
            }`}
          >
            {q.options[picked]}
            {!correct && (
              <strong className="mt-1 block text-white">
                Answer: {q.labels?.[q.answer] ?? `slot ${q.answer}`}
              </strong>
            )}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!answered}
          onClick={() => {
            setIndex((i) => i + 1)
            setPicked(null)
          }}
          className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {index === QUESTIONS.length - 1 ? "See result" : "Next question"}
        </Button>
      </div>
    </div>
  )
}
