import test from 'node:test'
import assert from 'node:assert/strict'
import { SEARCH_QUESTION_SETS } from '../features/search/searchQuestions.js'
import { createSearchCompletionEvidence } from '../features/search/searchMastery.js'
import {
  createEmptyProgress,
  sanitizeProgress,
  readProgress,
  PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_STORAGE_KEY,
} from './progress.js'

const allowedIds = [1, 2, 3, 4, 5, 6]
const evidence = () => {
  const questions = SEARCH_QUESTION_SETS[0]
  const answers = questions.map((question) => question.correctAnswer)
  answers[0] = (answers[0] + 1) % questions[0].options.length
  return createSearchCompletionEvidence(questions, answers, '2026-11-13T10:00:00.000Z')
}
const storageWith = (values) => ({ getItem: (key) => values[key] ?? null })

test('migrates legacy arrays while removing unverified module5 and preserving other known modules', () => {
  assert.deepEqual(sanitizeProgress([1, 5], allowedIds), {
    version: 2,
    completed: [1],
    searchAssessment: null,
  })
  assert.deepEqual(
    sanitizeProgress([1, 1, 2, 5, 6, 99, '3', 2.5], new Set(allowedIds)).completed,
    [1, 2, 6],
  )
})

test('restores module5 only when its completion flag and a passing current receipt both exist', () => {
  const receipt = evidence()
  const saved = { version: 2, completed: [1, 5, 6], searchAssessment: receipt }
  assert.deepEqual(sanitizeProgress(saved, allowedIds), saved)
  assert.deepEqual(sanitizeProgress({ ...saved, searchAssessment: null }, allowedIds), {
    version: 2,
    completed: [1, 6],
    searchAssessment: null,
  })
  assert.deepEqual(sanitizeProgress({ ...saved, completed: [1, 6] }, allowedIds), {
    version: 2,
    completed: [1, 6],
    searchAssessment: null,
  })
  assert.deepEqual(sanitizeProgress(saved, [1, 6]).completed, [1, 6])
})

test('invalid or stale receipt metadata drops module5 and retains other completed IDs', () => {
  const receipt = evidence()
  const invalid = [
    null,
    {},
    [],
    { ...receipt, assessmentVersion: 0 },
    { ...receipt, questionIds: [...receipt.questionIds].reverse() },
    { ...receipt, answers: [null, null, null, null, null] },
    {
      ...receipt,
      answers: SEARCH_QUESTION_SETS[0].map(
        (question) => (question.correctAnswer + 1) % question.options.length,
      ),
      passed: true,
      score: 100,
    },
  ]
  for (const searchAssessment of invalid) {
    assert.deepEqual(
      sanitizeProgress({ version: 2, completed: [2, 5, 3], searchAssessment }, allowedIds),
      {
        version: 2,
        completed: [2, 3],
        searchAssessment: null,
      },
    )
  }
})

test('handles malformed records without creating completion or sharing mutable arrays', () => {
  for (const saved of [null, undefined, true, 'passed', 5, {}, { version: 1, completed: [5] }]) {
    assert.deepEqual(sanitizeProgress(saved, allowedIds), createEmptyProgress())
  }
  for (const completed of [null, undefined, '5', 5, {}]) {
    assert.deepEqual(
      sanitizeProgress({ version: 2, completed, searchAssessment: evidence() }, allowedIds),
      createEmptyProgress(),
    )
  }
  const saved = { version: 2, completed: [5], searchAssessment: evidence() }
  const restored = sanitizeProgress(saved, allowedIds)
  restored.completed.push(1)
  restored.searchAssessment.answers[0] = 99
  assert.deepEqual(saved.completed, [5])
  assert.notEqual(saved.searchAssessment.answers[0], 99)
  const first = createEmptyProgress()
  first.completed.push(1)
  assert.deepEqual(createEmptyProgress().completed, [])
})

test('reads the authoritative v2 record and preserves mastery across JSON reloads', () => {
  const saved = { version: 2, completed: [1, 5], searchAssessment: evidence() }
  const storage = storageWith({
    [PROGRESS_STORAGE_KEY]: JSON.stringify(saved),
    [LEGACY_PROGRESS_STORAGE_KEY]: JSON.stringify([2, 5]),
  })
  const restored = readProgress(allowedIds, () => storage)
  assert.deepEqual(restored, saved)
  assert.deepEqual(sanitizeProgress(JSON.parse(JSON.stringify(restored)), allowedIds), saved)
  assert.equal(PROGRESS_STORAGE_KEY, 'hashlab-progress-v2')
  assert.equal(LEGACY_PROGRESS_STORAGE_KEY, 'hashlab-completed-modules')
})

test('falls back to migrated legacy progress when v2 is missing or malformed', () => {
  for (const current of [
    null,
    undefined,
    '',
    '{bad JSON',
    'null',
    '{}',
    '{"version":2,"completed":null}',
  ]) {
    const storage = storageWith({
      [PROGRESS_STORAGE_KEY]: current,
      [LEGACY_PROGRESS_STORAGE_KEY]: JSON.stringify([1, 5, 6]),
    })
    assert.deepEqual(
      readProgress(allowedIds, () => storage),
      {
        version: 2,
        completed: [1, 6],
        searchAssessment: null,
      },
    )
  }
})

test('clearing authoritative evidence cannot revive a legacy unchecked completion flag', () => {
  const legacyOnly = storageWith({ [LEGACY_PROGRESS_STORAGE_KEY]: '[5]' })
  assert.deepEqual(
    readProgress(allowedIds, () => legacyOnly),
    createEmptyProgress(),
  )
  assert.deepEqual(
    readProgress(allowedIds, () => storageWith({})),
    createEmptyProgress(),
  )
  const invalidCurrent = storageWith({
    [PROGRESS_STORAGE_KEY]: JSON.stringify({ version: 2, completed: [5], searchAssessment: null }),
    [LEGACY_PROGRESS_STORAGE_KEY]: '[1,5]',
  })
  assert.deepEqual(
    readProgress(allowedIds, () => invalidCurrent),
    createEmptyProgress(),
  )
})

test('returns safe empty progress for blocked storage and malformed legacy data', () => {
  assert.deepEqual(
    readProgress(allowedIds, () => null),
    createEmptyProgress(),
  )
  assert.deepEqual(
    readProgress(allowedIds, () => {
      throw new Error('Storage denied')
    }),
    createEmptyProgress(),
  )
  assert.deepEqual(
    readProgress(allowedIds, () => ({
      getItem() {
        throw new Error('Read denied')
      },
    })),
    createEmptyProgress(),
  )
  for (const legacy of ['{bad JSON', '{}', 'null', '5']) {
    assert.deepEqual(
      readProgress(allowedIds, () => storageWith({ [LEGACY_PROGRESS_STORAGE_KEY]: legacy })),
      createEmptyProgress(),
    )
  }
})
