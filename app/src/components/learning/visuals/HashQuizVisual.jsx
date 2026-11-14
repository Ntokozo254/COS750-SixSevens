import { useState } from "react"
import Button from "./Button"

// Short formative check. Each wrong option carries feedback aimed at the
// misconception that usually leads to it.
const QUESTIONS = [
  {
    prompt: "h(k) = k mod 10. Which slot does key 58 go to?",
    answer: "8",
    options: {
      5: "5 is the quotient (58 ÷ 10 = 5). The slot is the remainder.",
      8: "Right. 58 ÷ 10 = 5 remainder 8, so slot 8.",
      58: "The table only has slots 0 to 9. The key has to be squeezed into that range.",
    },
  },
  {
    prompt: "The table has 7 slots: h(k) = k mod 7. Where does key 23 go?",
    answer: "2",
    options: {
      3: "That is the last digit, which only works for mod 10. Divide by 7 instead.",
      2: "Right. 23 = 3 × 7 + 2, so the remainder is 2.",
      7: "There is no slot 7 in a 7-slot table. Slots run from 0 to 6.",
    },
  },
  {
    prompt: "Which property must every hash function have?",
    answer: "same",
    options: {
      same: "Right. If the same key gave different slots, you could never find it again.",
      unique: "No hash function can promise that. With more possible keys than slots, collisions are unavoidable.",
      random: "If the slot were random, a search would not know where to look.",
    },
    labels: {
      same: "The same key always gives the same slot",
      unique: "Different keys always give different slots",
      random: "The slot is picked at random each time",
    },
  },
  {
    prompt: "You store keys 100, 200, 300 and 400 with m = 10. What goes wrong?",
    answer: "pile",
    options: {
      pile: "Right. They all hash to slot 0. A prime m, like 7 or 11, would spread them out.",
      full: "There is plenty of space. The trouble is that all four want the same slot.",
      fine: "Check each one: 100, 200, 300 and 400 all leave remainder 0.",
    },
    labels: {
      pile: "They all land in the same slot",
      full: "The table runs out of space",
      fine: "Nothing, they spread out evenly",
    },
  },
]

export default function HashQuizVisual() {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)

  const done = index >= QUESTIONS.length

  if (done) {
    const passed = score >= 3
    return (
      <div className="grid gap-3 rounded-xl bg-blue-700/40 p-4 text-center">
        <p className="font-heading text-2xl font-extrabold text-white">
          {score} / {QUESTIONS.length}
        </p>
        <p className="text-sm text-blue-100">
          {passed
            ? "You can work out a home slot and spot a weak table size. You're ready for collisions."
            : "Nearly there. Go back to the \"Try it yourself\" card, test a few keys, then try again."}
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
