// Run with: node --test src/features/probing
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SEARCH_EXAMPLES } from '../search/searchExamples.js'
import { buildInsertTrace, placeKey, PRACTICE, TRACE_EXAMPLES } from './probingLogic.js'
import { markProbingAttempt, PROBING_CONCEPTS, PROBING_QUESTION_SETS } from './probingQuestions.js'

const tableFrom = (size, entries) => {
  const table = Array(size).fill(null)
  for (const [slot, key] of Object.entries(entries)) table[Number(slot)] = key
  return table
}

test('the first trace example builds the exact table Module 5 searches', () => {
  const { keys, size } = TRACE_EXAMPLES[0]
  const frames = buildInsertTrace(keys, size)
  assert.deepEqual(frames.at(-1).table, SEARCH_EXAMPLES[0].table)
})

test('a collision frame is followed by a check of the next slot, wrapping to 0', () => {
  const frames = buildInsertTrace([6, 13], 7)
  const collision = frames.find((frame) => frame.phase === 'collision')
  const next = frames[frames.indexOf(collision) + 1]
  assert.equal(collision.slot, 6)
  assert.equal(next.phase, 'check')
  assert.equal(next.slot, 0)
  assert.match(collision.message, /wrap around to slot 0/)
})

test('a full table produces a full frame and leaves the table unchanged', () => {
  const frames = buildInsertTrace([5, 10, 15, 20], 3)
  const full = frames.find((frame) => frame.phase === 'full')
  assert.ok(full)
  assert.equal(full.key, 20)
  assert.equal(full.checks, 3)
  assert.deepEqual(frames.at(-1).table, [15, 10, 5])
})

test('every frame highlights a real pseudocode line or none', () => {
  const lines = new Set(['hash', 'empty', 'store', 'next', 'full', null])
  for (const example of TRACE_EXAMPLES) {
    for (const frame of buildInsertTrace(example.keys, example.size)) {
      assert.ok(lines.has(frame.line), `${example.id}: unexpected line ${frame.line}`)
    }
  }
})

test('placeKey reports the probe path and does not change the table it is given', () => {
  const table = tableFrom(10, { 2: 12, 3: 22 })
  const before = [...table]
  const result = placeKey(table, 32)
  assert.deepEqual(result.path, [2, 3, 4])
  assert.equal(result.slot, 4)
  assert.deepEqual(table, before)
})

test('the practice keys include a collision, a longer probe and a wrap-around', () => {
  let table = Array(PRACTICE.size).fill(null)
  const placements = PRACTICE.keys.map((key) => {
    const result = placeKey(table, key)
    table = result.table
    return result
  })
  assert.deepEqual(placements.map((p) => p.slot), [5, 6, 7, 8, 9, 0])
  assert.ok(placements.some((p) => p.path.length >= 3))
  assert.ok(placements.some((p) => p.slot < p.home))
})

test('every question with a scenario matches the real algorithm', () => {
  for (const set of PROBING_QUESTION_SETS) {
    for (const question of set) {
      assert.ok(PROBING_CONCEPTS[question.concept], `${question.id}: unknown concept`)
      assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.options.length)
      if (!question.scenario) continue
      const { size, entries, key, expect, value } = question.scenario
      const result = placeKey(tableFrom(size, entries), key)
      const actual = { home: result.home, slot: result.slot, checks: result.path.length }[expect]
      assert.equal(actual, value, `${question.id}: scenario gives ${actual}`)
      assert.match(question.options[question.correctAnswer], new RegExp(`\\b${value}\\b`), question.id)
    }
  }
})

test('each set covers all five concepts once', () => {
  for (const set of PROBING_QUESTION_SETS) {
    assert.deepEqual(new Set(set.map((q) => q.concept)), new Set(Object.keys(PROBING_CONCEPTS)))
  }
})

test('marking uses the 80% mastery target', () => {
  const set = PROBING_QUESTION_SETS[0]
  const right = set.map((q) => q.correctAnswer)
  assert.equal(markProbingAttempt(set, right).passed, true)
  const fourRight = [...right]
  fourRight[0] = (right[0] + 1) % set[0].options.length
  const four = markProbingAttempt(set, fourRight)
  assert.equal(four.score, 80)
  assert.equal(four.passed, true)
  assert.deepEqual(four.missedConcepts, ['home'])
  const threeRight = [...fourRight]
  threeRight[1] = (right[1] + 1) % set[1].options.length
  assert.equal(markProbingAttempt(set, threeRight).passed, false)
})
