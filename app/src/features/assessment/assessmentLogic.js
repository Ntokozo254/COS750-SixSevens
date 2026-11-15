import { ASSESSMENT_TOPICS } from '../learning/topicRegistry.js'
import { SEARCH_CONCEPT_GUIDANCE, SEARCH_QUESTION_SETS } from '../search/searchQuestions.js'

// The course-wide assessment: a fresh mix of questions from every module's
// knowledge check, two per learning objective (LO1–LO6). It is formative and
// untimed; the result shows which modules to revisit before the lecture.

export const QUESTIONS_PER_MODULE = 2
export const PASS_MARK = 80
export const BEST_SCORE_KEY = 'hashlab-assessment-best'

// Module 1 has no knowledge check of its own, so its questions live here.
// Based on the Introduction to Hashing lesson cards.
const INTRO_CONCEPTS = {
  'why-hashing': {
    title: 'Why hash tables are fast',
    hints: ['A hash function turns the key straight into an array index.', 'Jumping to a known index takes the same time however many keys are stored.'],
  },
  'array-costs': {
    title: 'What arrays do well and badly',
    hints: ['Reading index i of an array is O(1).', 'Finding a value in an unsorted array means checking elements one by one: O(n).'],
  },
  buckets: {
    title: 'A hash table is an array of slots',
    hints: ['Underneath, a hash table is a fixed-size array.', 'Each position is called a slot or bucket.'],
  },
}

const INTRO_QUESTIONS = [
  {
    id: 'lo1-why-hashing-a',
    concept: 'why-hashing',
    question: 'Why are hash tables generally efficient for searching?',
    options: [
      'They always sort the stored keys',
      "They use a hash function to calculate a key's position",
      'They check every element in the table',
      'They store every key in a linked list',
    ],
    correctAnswer: 1,
    explanation: 'A hash function calculates the position where a key should be stored, allowing efficient average-case access.',
  },
  {
    id: 'lo1-array-costs-a',
    concept: 'array-costs',
    question: 'An unsorted array holds 1,000 student numbers. Roughly how many elements might you check to find one number?',
    options: ['Exactly 1', 'About 10', 'Up to all 1,000', 'None: arrays find values instantly'],
    correctAnswer: 2,
    explanation: 'Without knowing the index, you check elements one at a time. In the worst case that is all n elements: O(n).',
  },
  {
    id: 'lo1-buckets-a',
    concept: 'buckets',
    question: 'At its lowest level, what is a hash table built on?',
    options: ['A sorted linked list', 'A fixed-size array of slots', 'A binary search tree', 'A stack of keys'],
    correctAnswer: 1,
    explanation: 'A hash table is an array of slots (buckets). Arrays give O(1) access to any index, which the hash function exploits.',
  },
  {
    id: 'lo1-why-hashing-b',
    concept: 'why-hashing',
    question: 'With a good hash function and a table that is not too full, what is the average time to insert, search or delete?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 0,
    explanation: 'The hash function jumps to (or near) the right slot, so these operations take constant time on average.',
  },
]

const FALLBACK_GUIDANCE = { title: 'Review this idea', hints: ['Revisit the module and try its knowledge check again.'] }

// Every module's bank, in module order, with its LO and concept guidance.
export const MODULE_BANKS = [
  { moduleId: 1, questions: INTRO_QUESTIONS, concepts: INTRO_CONCEPTS },
  ...ASSESSMENT_TOPICS.map((topic) => ({
    moduleId: topic.id,
    questions: topic.questionSets.flat(),
    concepts: topic.concepts ?? {},
  })),
  { moduleId: 5, questions: SEARCH_QUESTION_SETS.flat(), concepts: SEARCH_CONCEPT_GUIDANCE },
].sort((a, b) => a.moduleId - b.moduleId)

function shuffle(items, random) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Picks `count` questions, preferring different concepts.
function pick(questions, count, random) {
  const chosen = []
  const concepts = new Set()
  const shuffled = shuffle(questions, random)
  for (const question of shuffled) {
    if (chosen.length === count) break
    if (!concepts.has(question.concept)) {
      chosen.push(question)
      concepts.add(question.concept)
    }
  }
  for (const question of shuffled) {
    if (chosen.length === count) break
    if (!chosen.includes(question)) chosen.push(question)
  }
  return chosen
}

// A new paper: two questions per module, in module order (simple to harder).
// `avoid` holds question ids from the last attempt, so a retry feels fresh.
export function buildAssessment({ random = Math.random, avoid = [] } = {}) {
  const skip = new Set(avoid)
  return MODULE_BANKS.flatMap(({ moduleId, questions, concepts }) => {
    const fresh = questions.filter((question) => !skip.has(question.id))
    const pool = fresh.length >= QUESTIONS_PER_MODULE ? fresh : questions
    return pick(pool, QUESTIONS_PER_MODULE, random).map((question) => ({
      ...question,
      moduleId,
      objective: `LO${moduleId}`,
      guidance: concepts[question.concept] ?? FALLBACK_GUIDANCE,
    }))
  })
}

export function markAssessment(questions, answers) {
  const byModule = MODULE_BANKS.map(({ moduleId }) => {
    const items = questions
      .map((question, index) => ({ question, answer: answers[index] }))
      .filter(({ question }) => question.moduleId === moduleId)
    const missed = items.filter(({ question, answer }) => answer !== question.correctAnswer)
    return {
      moduleId,
      total: items.length,
      correct: items.length - missed.length,
      // One hint card per missed concept.
      review: [...new Map(missed.map(({ question }) => [question.concept, question.guidance])).values()],
    }
  }).filter((row) => row.total > 0)

  const correct = byModule.reduce((sum, row) => sum + row.correct, 0)
  const total = questions.length
  const score = total ? Math.round((correct / total) * 100) : 0
  return { correct, total, score, passed: score >= PASS_MARK, byModule }
}

export function readBestScore(storage = globalThis.localStorage) {
  try {
    const value = Number(storage?.getItem(BEST_SCORE_KEY))
    return Number.isFinite(value) && value >= 0 && value <= 100 && storage.getItem(BEST_SCORE_KEY) !== null ? value : null
  } catch {
    return null
  }
}

export function saveBestScore(score, storage = globalThis.localStorage) {
  const best = readBestScore(storage)
  if (best !== null && best >= score) return best
  try {
    storage?.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // The result still shows without storage.
  }
  return score
}
