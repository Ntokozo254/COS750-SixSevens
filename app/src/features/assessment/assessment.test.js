import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MODULE_BANKS,
  QUESTIONS_PER_MODULE,
  buildAssessment,
  markAssessment,
  readBestScore,
  saveBestScore,
} from './assessmentLogic.js'

// A repeatable "random" for tests.
const seeded = (seed = 7) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const memoryStorage = () => {
  const values = {}
  return { getItem: (k) => (k in values ? values[k] : null), setItem: (k, v) => (values[k] = v) }
}

test('every module 1–6 has a bank of valid questions', () => {
  assert.deepEqual(MODULE_BANKS.map((bank) => bank.moduleId), [1, 2, 3, 4, 5, 6])
  for (const { moduleId, questions } of MODULE_BANKS) {
    assert.ok(questions.length >= QUESTIONS_PER_MODULE * 2, `module ${moduleId} needs enough for a fresh retry`)
    for (const q of questions) {
      assert.ok(q.id && q.question && q.explanation, q.id)
      assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length, q.id)
    }
  }
  const ids = MODULE_BANKS.flatMap((bank) => bank.questions.map((q) => q.id))
  assert.equal(new Set(ids).size, ids.length, 'question ids are unique')
})

test('a paper has two questions per objective, in order, with different concepts', () => {
  const paper = buildAssessment({ random: seeded() })
  assert.equal(paper.length, 12)
  assert.deepEqual(paper.map((q) => q.objective), ['LO1', 'LO1', 'LO2', 'LO2', 'LO3', 'LO3', 'LO4', 'LO4', 'LO5', 'LO5', 'LO6', 'LO6'])
  for (let i = 0; i < paper.length; i += 2) assert.notEqual(paper[i].concept, paper[i + 1].concept)
  assert.ok(paper.every((q) => q.guidance?.title && q.guidance.hints.length))
})

test('a retry avoids the previous questions', () => {
  const first = buildAssessment({ random: seeded(1) })
  const second = buildAssessment({ random: seeded(2), avoid: first.map((q) => q.id) })
  const reused = second.filter((q) => first.some((p) => p.id === q.id))
  assert.equal(reused.length, 0)
})

test('marking gives a score, a pass flag and what to review per module', () => {
  const paper = buildAssessment({ random: seeded() })
  const allRight = markAssessment(paper, paper.map((q) => q.correctAnswer))
  assert.deepEqual([allRight.correct, allRight.total, allRight.score, allRight.passed], [12, 12, 100, true])
  assert.ok(allRight.byModule.every((row) => row.review.length === 0))

  const answers = paper.map((q) => q.correctAnswer)
  answers[0] = (answers[0] + 1) % paper[0].options.length // miss one LO1
  answers[2] = (answers[2] + 1) % paper[2].options.length // miss one LO2
  answers[3] = (answers[3] + 1) % paper[3].options.length // and the other LO2
  const result = markAssessment(paper, answers)
  assert.deepEqual([result.correct, result.score, result.passed], [9, 75, false])
  assert.deepEqual(result.byModule.map((row) => row.correct), [1, 0, 2, 2, 2, 2])
  assert.equal(result.byModule[1].review.length, 2)
})

test('the best score is remembered and only goes up', () => {
  const storage = memoryStorage()
  assert.equal(readBestScore(storage), null)
  assert.equal(saveBestScore(58, storage), 58)
  assert.equal(saveBestScore(42, storage), 58)
  assert.equal(saveBestScore(83, storage), 83)
  assert.equal(readBestScore(storage), 83)
})
