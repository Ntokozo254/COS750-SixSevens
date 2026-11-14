import QuizVisual from "./QuizVisual"

const QUESTIONS = [
  {
    prompt: "m = 10 and slot 3 holds 33. Which new key collides with it?",
    answer: "43",
    options: {
      43: "Right. 43 mod 10 = 3, the same slot as 33.",
      34: "34 mod 10 = 4. Different slot, so no collision.",
      30: "30 mod 10 = 0. It shares a digit with 33, but it goes to slot 0.",
    },
    labels: { 43: "43", 34: "34", 30: "30" },
  },
  {
    prompt: "m = 7. Do keys 15 and 22 collide?",
    answer: "yes",
    options: {
      yes: "Right. 15 mod 7 = 1 and 22 mod 7 = 1, so both want slot 1.",
      no: "Work out both: 15 = 2 × 7 + 1 and 22 = 3 × 7 + 1. Same remainder, same slot.",
    },
    labels: { yes: "Yes", no: "No" },
  },
  {
    prompt: "What is a collision?",
    answer: "same",
    options: {
      same: "Right. Two different keys hash to the same slot.",
      twice: "Inserting the same key twice is a duplicate, not a collision. A collision needs two different keys.",
      full: "A table can have collisions while it is mostly empty. You saw one after only 4 keys.",
    },
    labels: {
      same: "Two different keys get the same home slot",
      twice: "The same key is inserted twice",
      full: "The table has run out of space",
    },
  },
  {
    prompt: "Can a good hash function get rid of collisions completely?",
    answer: "no",
    options: {
      no: "Right. There are far more possible keys than slots, so some keys must share. We plan for collisions instead.",
      prime: "A prime size spreads keys out and reduces collisions, but it cannot remove them.",
      small: "Even small keys collide: 11 keys in 10 slots must share at least one slot.",
    },
    labels: {
      no: "No, there are more possible keys than slots",
      prime: "Yes, if the table size is prime",
      small: "Yes, if the keys are small numbers",
    },
  },
]

export default function CollisionQuizVisual() {
  return (
    <QuizVisual
      questions={QUESTIONS}
      passMark={3}
      passText="You can spot a collision and explain why they cannot be avoided. Module 4 shows how to handle them."
      retryText={'Nearly there. Go back to "Spot the collision", practise a few keys, then try again.'}
    />
  )
}
