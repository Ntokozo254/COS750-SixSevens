import test from 'node:test'
import assert from 'node:assert/strict'
import { PRACTICE_CHALLENGES, PRACTICE_STAGES } from './practiceChallenges.js'
import {
  createPracticeReceipt, emptyPracticeState, gradeResults, nextChallengeId,
  practiceStorageKey, readPracticeState, sanitizePracticeState, sameValue,
  stageStatus, validatePracticeReceipt, writePracticeState,
} from './practiceLogic.js'

const runsFor = challenge => challenge.tests.map(test => ({ ok: true, value: structuredClone(test.expected) }))
const proof = challenge => createPracticeReceipt(challenge, challenge.solution, runsFor(challenge), '2026-11-15T01:00:00.000Z')

test('grading needs every canonical output, preserving array order, zero, null and return types', () => {
  for (const challenge of PRACTICE_CHALLENGES) {
    const runs = runsFor(challenge)
    assert.equal(gradeResults(challenge, runs).passed, true)
    assert.equal(gradeResults(challenge, runs.slice(1)), null)
    runs[0] = { ok: false, type: 'timeout', error: 'The run timed out.' }
    const failed = gradeResults(challenge, runs)
    assert.equal(failed.passed, false)
    assert.equal(failed.correct, challenge.tests.length - 1)
    assert.equal(failed.cases[0].error, 'The run timed out.')
  }
  assert.equal(sameValue([0, null, 2], [0, null, 2]), true)
  assert.equal(sameValue([0, 2, null], [0, null, 2]), false)
  assert.equal(sameValue('0', 0), false)
  assert.equal(sameValue(3.00000000005, 3), false)
  assert.equal(sameValue(undefined, null), false)
  const sparse = Array(2)
  sparse[1] = 1
  assert.equal(sameValue(sparse, [null, 1]), false)
  assert.equal(sameValue({ found: true, extra: 1 }, { found: true }), false)
})

test('completion receipts regrade all outputs and bind the result to source and current test contract', () => {
  for (const challenge of PRACTICE_CHALLENGES) {
    const receipt = proof(challenge)
    assert.deepEqual(validatePracticeReceipt(challenge, receipt), receipt)
    assert.equal(validatePracticeReceipt(challenge, { passed: true, score: 100 }), null)
    assert.equal(validatePracticeReceipt(challenge, { ...receipt, outputs: [] }), null)
    assert.equal(validatePracticeReceipt(challenge, { ...receipt, source: '' }), null)
    assert.equal(validatePracticeReceipt({ ...challenge, version: 2 }, receipt), null)
    assert.equal(validatePracticeReceipt({ ...challenge, tests: challenge.tests.slice().reverse() }, receipt), null)
    const other = PRACTICE_CHALLENGES.find(item => item.id !== challenge.id)
    assert.equal(validatePracticeReceipt(other, receipt), null)
    receipt.outputs[0] = { wrong: true }
    receipt.passed = true
    assert.equal(validatePracticeReceipt(challenge, receipt), null)
  }
})

test('both problems must pass in every earlier stage before the next stage opens', () => {
  const receipts = {}
  assert.equal(stageStatus(PRACTICE_STAGES[0].id, receipts), 'open')
  assert.equal(stageStatus(PRACTICE_STAGES[1].id, receipts), 'locked')
  for (let index = 0; index < PRACTICE_STAGES.length; index++) {
    const stage = PRACTICE_STAGES[index]
    for (let problem = 0; problem < stage.challengeIds.length; problem++) {
      const challenge = PRACTICE_CHALLENGES.find(item => item.id === stage.challengeIds[problem])
      receipts[challenge.id] = proof(challenge)
      assert.equal(stageStatus(stage.id, receipts), problem === stage.challengeIds.length - 1 ? 'complete' : 'open')
      if (problem === 0 && PRACTICE_STAGES[index + 1]) assert.equal(stageStatus(PRACTICE_STAGES[index + 1].id, receipts), 'locked')
    }
    if (PRACTICE_STAGES[index + 1]) assert.equal(stageStatus(PRACTICE_STAGES[index + 1].id, receipts), 'open')
  }
  receipts[PRACTICE_STAGES[0].challengeIds[0]].outputs = []
  assert.equal(stageStatus(PRACTICE_STAGES.at(-1).id, receipts), 'locked')
  assert.equal(stageStatus('unknown', receipts), 'locked')
})

test('next problem skips accepted work and never sends the learner into a locked stage', () => {
  const [first, second] = PRACTICE_CHALLENGES
  assert.equal(nextChallengeId(first.id, {}), second.id)
  const receipts = { [first.id]: proof(first) }
  assert.equal(nextChallengeId(first.id, receipts), second.id)
  receipts[second.id] = proof(second)
  assert.equal(nextChallengeId(second.id, receipts), PRACTICE_STAGES[1].challengeIds[0])
})

test('restoration keeps independent valid results, ignores fabricated badges, and owns its arrays', () => {
  const receipts = Object.fromEntries(PRACTICE_CHALLENGES.map(challenge => [challenge.id, proof(challenge)]))
  const saved = { version: 1, drafts: { [PRACTICE_CHALLENGES[0].id]: 'function solve(input) { return 0; }', unknown: 'bad' }, receipts, completed: ['unknown'] }
  const restored = sanitizePracticeState(JSON.parse(JSON.stringify(saved)))
  assert.equal(Object.keys(restored.receipts).length, 8)
  assert.equal(restored.drafts.unknown, undefined)
  const first = PRACTICE_CHALLENGES[0]
  restored.receipts[first.id].outputs[0] = 'bad'
  assert.notEqual(saved.receipts[first.id].outputs[0], 'bad')
  const cleaned = sanitizePracticeState(restored)
  assert.equal(Object.keys(cleaned.receipts).length, 7)
  assert.deepEqual(sanitizePracticeState({ version: 1, completed: PRACTICE_CHALLENGES.map(item => item.id) }), emptyPracticeState())
})

test('saved code and accepted checks are separated by learner and leave lesson progress untouched', () => {
  const values = new Map([['hashlab-progress-v2', 'lesson-progress']])
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  const first = PRACTICE_CHALLENGES[0]
  const state = { version: 1, drafts: { [first.id]: first.solution }, receipts: { [first.id]: proof(first) } }
  assert.equal(writePracticeState('student-a', state, () => storage), true)
  assert.deepEqual(readPracticeState('student-a', () => storage), state)
  assert.deepEqual(readPracticeState('student-b', () => storage), emptyPracticeState())
  assert.equal(values.get('hashlab-progress-v2'), 'lesson-progress')
  assert.ok(values.has(practiceStorageKey('student-a')))
})

test('malformed and blocked storage recover without preventing session practice', () => {
  for (const content of ['{bad', 'null', '[]', '{"version":99}']) assert.deepEqual(readPracticeState('a', () => ({ getItem: () => content })), emptyPracticeState())
  const blocked = () => { throw new Error('Blocked storage') }
  assert.deepEqual(readPracticeState('a', blocked), emptyPracticeState())
  assert.equal(writePracticeState('a', emptyPracticeState(), blocked), false)
  assert.equal(writePracticeState('a', emptyPracticeState(), () => null), false)
})
