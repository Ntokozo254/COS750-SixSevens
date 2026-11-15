import { PRACTICE_CHALLENGES, PRACTICE_STAGES } from './practiceChallenges.js'

export const MAX_SOURCE_LENGTH = 20_000
const VERSION = 1

export function sameValue(actual, expected) {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Number.isFinite(actual) && (Number.isInteger(expected) ? actual === expected : Math.abs(actual - expected) < 1e-10)
  }
  if (actual === expected) return true
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length && expected.every((value, index) => Object.hasOwn(actual, index) && sameValue(actual[index], value))
  }
  if (expected && actual && typeof expected === 'object' && typeof actual === 'object' && !Array.isArray(actual)) {
    const keys = Object.keys(expected)
    return Object.keys(actual).length === keys.length && keys.every(key => Object.hasOwn(actual, key) && sameValue(actual[key], expected[key]))
  }
  return false
}

export function gradeResults(challenge, runs) {
  if (!Array.isArray(runs) || runs.length !== challenge.tests.length) return null
  const cases = challenge.tests.map((test, index) => ({
    name: test.name,
    input: test.input,
    expected: test.expected,
    explanation: test.explanation,
    actual: runs[index]?.ok ? runs[index].value : undefined,
    error: runs[index]?.ok ? null : runs[index]?.error ?? 'The code did not return a result.',
    passed: runs[index]?.ok === true && sameValue(runs[index].value, test.expected),
  }))
  return { cases, correct: cases.filter(test => test.passed).length, total: cases.length, passed: cases.every(test => test.passed) }
}

function signature(challenge) {
  return JSON.stringify({ id: challenge.id, version: challenge.version, tests: challenge.tests.map(test => ({ name: test.name, input: test.input, expected: test.expected })) })
}

export function createPracticeReceipt(challenge, source, runs, submittedAt = new Date().toISOString()) {
  const grade = gradeResults(challenge, runs)
  if (!grade?.passed || typeof source !== 'string' || !source.trim() || source.length > MAX_SOURCE_LENGTH || !Number.isFinite(Date.parse(submittedAt))) return null
  return { version: VERSION, challengeId: challenge.id, signature: signature(challenge), source, outputs: structuredClone(runs.map(run => run.value)), submittedAt: new Date(submittedAt).toISOString() }
}

export function validatePracticeReceipt(challenge, receipt) {
  if (!receipt || receipt.version !== VERSION || receipt.challengeId !== challenge.id || receipt.signature !== signature(challenge) || !Array.isArray(receipt.outputs)) return null
  return createPracticeReceipt(challenge, receipt.source, receipt.outputs.map(value => ({ ok: true, value })), receipt.submittedAt)
}

export function emptyPracticeState() {
  return { version: VERSION, drafts: {}, receipts: {} }
}

export function sanitizePracticeState(saved) {
  const state = emptyPracticeState()
  if (!saved || saved.version !== VERSION) return state
  for (const challenge of PRACTICE_CHALLENGES) {
    const draft = saved.drafts?.[challenge.id]
    if (typeof draft === 'string' && draft.length <= MAX_SOURCE_LENGTH) state.drafts[challenge.id] = draft
    const receipt = validatePracticeReceipt(challenge, saved.receipts?.[challenge.id])
    if (receipt) state.receipts[challenge.id] = receipt
  }
  return state
}

export function practiceStorageKey(learnerId = 'local') {
  return `hashlab-practice-v1:${String(learnerId).slice(0, 128)}`
}

export function readPracticeState(learnerId, getStorage = () => globalThis.localStorage) {
  try { return sanitizePracticeState(JSON.parse(getStorage()?.getItem(practiceStorageKey(learnerId)) ?? 'null')) }
  catch { return emptyPracticeState() }
}

export function writePracticeState(learnerId, state, getStorage = () => globalThis.localStorage) {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(practiceStorageKey(learnerId), JSON.stringify(sanitizePracticeState(state)))
    return true
  } catch { return false }
}

export function stageStatus(stageId, receipts) {
  const index = PRACTICE_STAGES.findIndex(stage => stage.id === stageId)
  if (index === -1) return 'locked'
  const complete = stage => stage.challengeIds.every(id => Boolean(validatePracticeReceipt(PRACTICE_CHALLENGES.find(challenge => challenge.id === id), receipts[id])))
  if (!PRACTICE_STAGES.slice(0, index).every(complete)) return 'locked'
  return complete(PRACTICE_STAGES[index]) ? 'complete' : 'open'
}

export function nextChallengeId(currentId, receipts) {
  const next = PRACTICE_CHALLENGES.find(challenge => challenge.id !== currentId && !receipts[challenge.id] && stageStatus(challenge.stageId, receipts) !== 'locked')
  return next?.id ?? currentId
}
