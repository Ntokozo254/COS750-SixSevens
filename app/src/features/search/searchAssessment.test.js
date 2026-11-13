import test from 'node:test'
import assert from 'node:assert/strict'
import { createSearchTrace } from '../../logic/searching.js'
import {
  markSearchAttempt,
  SEARCH_CONCEPT_GUIDANCE,
  SEARCH_QUESTION_SETS,
} from './searchQuestions.js'

test('all three assessment sets cover the five LO5 concepts with unique question IDs', () => {
  const allIds = []
  const concepts = Object.keys(SEARCH_CONCEPT_GUIDANCE).sort()

  assert.equal(SEARCH_QUESTION_SETS.length, 3)
  for (const questions of SEARCH_QUESTION_SETS) {
    assert.equal(questions.length, 5)
    assert.deepEqual(questions.map((question) => question.concept).sort(), concepts)

    for (const question of questions) {
      assert.equal(question.objective, 'LO5')
      assert.equal(question.options.length, 4)
      assert.ok(Number.isInteger(question.correctAnswer))
      assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.options.length)
      assert.ok(question.explanation.length > 0)
      assert.ok(
        ['learn', 'explore', 'practice'].includes(SEARCH_CONCEPT_GUIDANCE[question.concept].review),
      )
      allIds.push(question.id)
    }
  }

  assert.equal(new Set(allIds).size, 15)
})

test('every authored search scenario and selected answer match the executable search trace', () => {
  const scenarios = SEARCH_QUESTION_SETS.flat().filter((question) => question.scenario)
  assert.equal(scenarios.length, 12)

  for (const question of scenarios) {
    const { table, key, visited, reason, answerValue } = question.scenario
    const original = structuredClone(table)
    const trace = createSearchTrace(table, key)
    const inspected = trace.steps.at(-1).checkedIndices

    assert.deepEqual(inspected, visited, question.id)
    assert.equal(trace.checks, visited.length, question.id)
    assert.equal(trace.reason, reason, question.id)
    assert.equal(trace.found, reason === 'found', question.id)
    assert.equal(trace.index, reason === 'found' ? visited.at(-1) : -1, question.id)
    assert.equal(question.options[question.correctAnswer], answerValue, question.id)
    assert.deepEqual(table, original, question.id)
  }
})

test('a crowded-table example establishes capacity as the worst-case inspection bound', () => {
  for (const capacity of [1, 4, 10]) {
    const table = Array.from({ length: capacity }, (_, index) => index)
    const absent = createSearchTrace(table, capacity * 2)
    assert.equal(absent.found, false)
    assert.equal(absent.checks, capacity)
    assert.equal(absent.reason, 'exhausted')
  }
})

test('marking requires four correct answers and identifies the missed concept', () => {
  for (const questions of SEARCH_QUESTION_SETS) {
    const correctAnswers = questions.map((question) => question.correctAnswer)
    const perfect = markSearchAttempt(questions, correctAnswers)
    assert.deepEqual(perfect, {
      total: 5,
      correct: 5,
      score: 100,
      passed: true,
      missedConcepts: [],
    })

    const oneMiss = [...correctAnswers]
    oneMiss[2] = (oneMiss[2] + 1) % questions[2].options.length
    assert.deepEqual(markSearchAttempt(questions, oneMiss), {
      total: 5,
      correct: 4,
      score: 80,
      passed: true,
      missedConcepts: ['skip-tombstone'],
    })

    const twoMisses = [...oneMiss]
    twoMisses[3] = (twoMisses[3] + 1) % questions[3].options.length
    assert.deepEqual(markSearchAttempt(questions, twoMisses), {
      total: 5,
      correct: 3,
      score: 60,
      passed: false,
      missedConcepts: ['skip-tombstone', 'full-exhaustion'],
    })
    assert.deepEqual(
      correctAnswers,
      questions.map((question) => question.correctAnswer),
    )
  }
})

test('marking rejects incomplete attempts and invalid selections', () => {
  const questions = SEARCH_QUESTION_SETS[0]
  for (const answers of [
    null,
    [],
    [0],
    [0, 0, 0, 0],
    Array(5),
    [null, 0, 0, 0, 0],
    [4, 0, 0, 0, 0],
    [0.5, 0, 0, 0, 0],
  ]) {
    assert.throws(() => markSearchAttempt(questions, answers), TypeError)
  }
  assert.throws(() => markSearchAttempt([], []), TypeError)
})
