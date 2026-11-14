import QuizVisual from "./QuizVisual"

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
  return (
    <QuizVisual
      questions={QUESTIONS}
      passMark={3}
      passText="You can work out a home slot and spot a weak table size. You're ready for collisions."
      retryText={'Nearly there. Go back to the "Try it yourself" card, test a few keys, then try again.'}
    />
  )
}
