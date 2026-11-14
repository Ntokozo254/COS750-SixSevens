import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  readPreferencesState,
  sanitizePreferences,
  writePreferences,
} from './preferences.js'

const storageWith = (value) => ({ getItem: () => value })

test('restores every supported preference without copying unexpected fields', () => {
  const saved = {
    displayName: 'Sam Student',
    studentNumber: 'u12345678',
    readingSize: 'extra-large',
    highContrast: true,
    reduceMotion: true,
    speechEnabled: true,
    speechRate: 1.25,
    speechVoice: 'English voice',
    preferredMode: 'multimodal',
    studyGoal: 30,
  }
  assert.deepEqual(sanitizePreferences({ ...saved, completed: [1, 5], admin: true }), saved)
  assert.deepEqual(readPreferences(() => storageWith(JSON.stringify(saved))), saved)
  assert.equal(PREFERENCES_STORAGE_KEY, 'hashlab.preferences.v1')
})

test('invalid records and inherited values cannot enable preferences', () => {
  for (const value of [undefined, null, 'large', 2, true, [], ['highContrast']]) {
    assert.deepEqual(sanitizePreferences(value), DEFAULT_PREFERENCES)
  }
  const inherited = Object.create({ highContrast: true, speechEnabled: true, displayName: 'Hidden' })
  inherited.readingSize = 'large'
  assert.deepEqual(sanitizePreferences(inherited), { ...DEFAULT_PREFERENCES, readingSize: 'large' })
  assert.deepEqual(
    sanitizePreferences({ highContrast: 'true', reduceMotion: 1, speechEnabled: {}, speechRate: '1.25' }),
    DEFAULT_PREFERENCES,
  )
  assert.deepEqual(
    sanitizePreferences({ readingSize: 'huge', preferredMode: 'unrecognised' }),
    DEFAULT_PREFERENCES,
  )
})

test('profile strings and voice identifiers have bounded lengths while ordinary typing retains spaces', () => {
  const restored = sanitizePreferences({
    displayName: 'A'.repeat(80),
    studentNumber: '1'.repeat(40),
    speechVoice: 'v'.repeat(250),
  })
  assert.equal(restored.displayName.length, 60)
  assert.equal(restored.studentNumber.length, 20)
  assert.equal(restored.speechVoice.length, 200)
  assert.equal(sanitizePreferences({ displayName: 'Sam ' }).displayName, 'Sam ')
  assert.equal(sanitizePreferences({ displayName: 'Sam\nStudent\u0000' }).displayName, 'SamStudent')
  assert.equal(sanitizePreferences({ displayName: 123 }).displayName, '')
})

test('speech pace and study goals accept valid bounds and reject unsafe or unsupported values', () => {
  for (const rate of [0.75, 1, 1.25, 1.5]) {
    assert.equal(sanitizePreferences({ speechRate: rate }).speechRate, rate)
  }
  for (const rate of [0, -1, 0.74, 1.51, Infinity, NaN, '1.25', null]) {
    assert.equal(sanitizePreferences({ speechRate: rate }).speechRate, 1)
  }
  for (const goal of [5, 15, 30, 60]) {
    assert.equal(sanitizePreferences({ studyGoal: goal }).studyGoal, goal)
  }
  for (const goal of [0, 4, 6, 61, 65, 7.5, Infinity, '30', null]) {
    assert.equal(sanitizePreferences({ studyGoal: goal }).studyGoal, 15)
  }
})

test('missing or malformed JSON recovers defaults without reporting working storage as blocked', () => {
  for (const value of [undefined, null, '', '{broken', 'null', '[]', 'true', '"profile"']) {
    assert.deepEqual(readPreferencesState(() => storageWith(value)), {
      preferences: { ...DEFAULT_PREFERENCES },
      storageAvailable: true,
    })
  }
  const first = readPreferences(() => storageWith(null))
  first.displayName = 'Changed'
  assert.equal(readPreferences(() => storageWith(null)).displayName, '')
  assert.equal(DEFAULT_PREFERENCES.displayName, '')
})

test('blocked or unavailable storage preserves usable defaults and reports availability', () => {
  for (const getStorage of [
    () => null,
    () => { throw new Error('Access denied') },
    () => ({ getItem() { throw new Error('Read denied') } }),
  ]) {
    assert.deepEqual(readPreferences(getStorage), DEFAULT_PREFERENCES)
    assert.deepEqual(readPreferencesState(getStorage), {
      preferences: { ...DEFAULT_PREFERENCES },
      storageAvailable: false,
    })
  }
})

test('writes only the preference key, round-trips all settings, and leaves progress untouched', () => {
  const values = new Map([['hashlab-progress-v2', '{"completed":[1]}']])
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  const preferences = { ...DEFAULT_PREFERENCES, displayName: 'Sam', highContrast: true, studyGoal: 45 }
  assert.equal(writePreferences({ ...preferences, unexpected: 'ignore' }, () => storage), true)
  assert.deepEqual(readPreferences(() => storage), preferences)
  assert.equal(values.get('hashlab-progress-v2'), '{"completed":[1]}')
  assert.equal(values.size, 2)
})

test('failed persistence does not mutate current preferences or throw into the interface', () => {
  const preferences = { ...DEFAULT_PREFERENCES, displayName: 'Session learner' }
  for (const getStorage of [
    () => null,
    () => { throw new Error('Access denied') },
    () => ({ setItem() { throw new Error('Quota exceeded') } }),
  ]) {
    assert.equal(writePreferences(preferences, getStorage), false)
    assert.equal(preferences.displayName, 'Session learner')
  }
})
