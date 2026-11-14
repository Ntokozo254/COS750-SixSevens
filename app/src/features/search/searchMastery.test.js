import test from 'node:test'
import assert from 'node:assert/strict'
import { SEARCH_QUESTION_SETS } from './searchQuestions.js'
import {
  createSearchCompletionEvidence,
  validateSearchCompletionEvidence,
} from './searchMastery.js'

const timestamp = '2026-11-13T10:00:00.000Z'
const correctAnswers = (questions) => questions.map((question) => question.correctAnswer)
const wrongAnswers = (questions) =>
  questions.map((question) => (question.correctAnswer + 1) % question.options.length)
const passingReceipt = () =>
  createSearchCompletionEvidence(
    SEARCH_QUESTION_SETS[0],
    correctAnswers(SEARCH_QUESTION_SETS[0]),
    timestamp,
  )

test('creates normalized evidence for all three complete passing question sets', () => {
  for (const questions of SEARCH_QUESTION_SETS) {
    const answers = correctAnswers(questions)
    const receipt = createSearchCompletionEvidence(questions, answers, timestamp)
    assert.deepEqual(receipt, {
      assessmentVersion: 1,
      questionIds: questions.map((question) => question.id),
      answers,
      completedAt: timestamp,
    })
    assert.deepEqual(validateSearchCompletionEvidence(receipt), receipt)
  }
})

test('accepts exactly80% and rejects a fully checked failing attempt', () => {
  const questions = SEARCH_QUESTION_SETS[0]
  const answers = correctAnswers(questions)
  answers[0] = (answers[0] + 1) % questions[0].options.length
  assert.ok(createSearchCompletionEvidence(questions, answers, timestamp))
  answers[1] = (answers[1] + 1) % questions[1].options.length
  assert.equal(createSearchCompletionEvidence(questions, answers, timestamp), null)
  assert.equal(createSearchCompletionEvidence(questions, wrongAnswers(questions), timestamp), null)
})

test('rejects incomplete selections, sparse arrays, and invalid answer indices without throwing', () => {
  const questions = SEARCH_QUESTION_SETS[0]
  for (const answers of [
    null,
    [],
    [0, 0, 0, 0],
    Array(5),
    [0, 0, 0, 0, null],
    [0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0.5],
  ]) {
    assert.equal(createSearchCompletionEvidence(questions, answers, timestamp), null)
  }
  assert.equal(createSearchCompletionEvidence(Array(5), Array(5).fill(0), timestamp), null)
  assert.equal(createSearchCompletionEvidence(null, [], timestamp), null)
})

test('regrades the canonical bank instead of trusting supplied question answers', () => {
  const alteredQuestions = SEARCH_QUESTION_SETS[0].map((question) => ({
    ...question,
    correctAnswer: (question.correctAnswer + 1) % question.options.length,
  }))
  assert.equal(
    createSearchCompletionEvidence(alteredQuestions, correctAnswers(alteredQuestions), timestamp),
    null,
  )
})

test('rejects stale, unknown, mixed, reordered and duplicated question identifiers', () => {
  const receipt = passingReceipt()
  const alteredIds = [
    ['unknown', ...receipt.questionIds.slice(1)],
    [...receipt.questionIds].reverse(),
    Array(5).fill(receipt.questionIds[0]),
    [SEARCH_QUESTION_SETS[1][0].id, ...receipt.questionIds.slice(1)],
    Array(5),
  ]
  for (const questionIds of alteredIds) {
    assert.equal(validateSearchCompletionEvidence({ ...receipt, questionIds }), null)
  }
  for (const assessmentVersion of [undefined, 0, 2, '1']) {
    assert.equal(validateSearchCompletionEvidence({ ...receipt, assessmentVersion }), null)
  }
})

test('ignores fabricated passing metadata and verifies the submitted answers', () => {
  const receipt = passingReceipt()
  assert.equal(
    validateSearchCompletionEvidence({
      ...receipt,
      answers: wrongAnswers(SEARCH_QUESTION_SETS[0]),
      passed: true,
      score: 100,
    }),
    null,
  )
  assert.deepEqual(
    validateSearchCompletionEvidence({ ...receipt, passed: false, score: 0 }),
    receipt,
  )
})

test('normalizes ISO timestamps and rejects invalid calendar dates and receipt shapes', () => {
  const receipt = passingReceipt()
  assert.equal(
    validateSearchCompletionEvidence({ ...receipt, completedAt: '2026-11-13T12:00:00+02:00' })
      .completedAt,
    timestamp,
  )
  for (const completedAt of [
    'invalid',
    '2026',
    '2026-02-30T10:00:00.000Z',
    '2026-13-01T10:00:00.000Z',
    null,
    0,
  ]) {
    assert.equal(validateSearchCompletionEvidence({ ...receipt, completedAt }), null)
  }
  for (const value of [null, [], true, 'passed', { assessmentVersion: 1 }]) {
    assert.equal(validateSearchCompletionEvidence(value), null)
  }
  assert.ok(
    validateSearchCompletionEvidence(
      createSearchCompletionEvidence(
        SEARCH_QUESTION_SETS[0],
        correctAnswers(SEARCH_QUESTION_SETS[0]),
      ),
    ),
  )
})

test('created and restored evidence owns its question and answer arrays', () => {
  const questions = SEARCH_QUESTION_SETS[0]
  const answers = correctAnswers(questions)
  const receipt = createSearchCompletionEvidence(questions, answers, timestamp)
  answers[0] = 99
  assert.equal(receipt.answers[0], questions[0].correctAnswer)
  const restored = validateSearchCompletionEvidence(receipt)
  restored.answers[0] = 99
  restored.questionIds[0] = 'changed'
  assert.equal(receipt.answers[0], questions[0].correctAnswer)
  assert.equal(receipt.questionIds[0], questions[0].id)
})
