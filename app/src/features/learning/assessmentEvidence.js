import { markSearchAttempt } from '../search/searchQuestions.js'

const ASSESSMENT_VERSION = 1
const QUESTION_COUNT = 5

function hasFiveEntries(value) {
  if (!Array.isArray(value) || value.length !== QUESTION_COUNT) return false
  for (let index = 0; index < QUESTION_COUNT; index += 1) {
    if (!Object.hasOwn(value, index)) return false
  }
  return true
}

function normalizeDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  )
    return null

  const timestamp = new Date(value)
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp.getTime()) || !Number.isFinite(date.getTime())) return null
  if (date.toISOString().slice(0, 10) !== value.slice(0, 10)) return null
  return timestamp.toISOString()
}

function createEvidence(questionSets, questionIds, answers, completedAt, moduleId) {
  if (!hasFiveEntries(questionIds) || !hasFiveEntries(answers)) return null
  const questions = questionSets.find((set) =>
    set.every((question, index) => question.id === questionIds[index]),
  )
  const date = normalizeDate(completedAt)
  if (!questions || !date) return null

  try {
    const result = markSearchAttempt(questions, answers)
    if (!result.passed) return null
  } catch {
    return null
  }

  return {
    assessmentVersion: ASSESSMENT_VERSION,
    questionIds: [...questionIds],
    answers: [...answers],
    completedAt: date,
    ...(moduleId === undefined ? {} : { moduleId }),
  }
}

export function createCompletionEvidence(
  questionSets,
  questions,
  answers,
  completedAt = new Date().toISOString(),
  moduleId,
) {
  if (!hasFiveEntries(questions)) return null
  const questionIds = questions.map((question) => question?.id)
  return createEvidence(questionSets, questionIds, answers, completedAt, moduleId)
}

export function validateCompletionEvidence(questionSets, receipt, moduleId) {
  if (
    !receipt ||
    typeof receipt !== 'object' ||
    Array.isArray(receipt) ||
    receipt.assessmentVersion !== ASSESSMENT_VERSION ||
    (moduleId !== undefined && receipt.moduleId !== moduleId)
  )
    return null
  return createEvidence(
    questionSets,
    receipt.questionIds,
    receipt.answers,
    receipt.completedAt,
    moduleId,
  )
}
