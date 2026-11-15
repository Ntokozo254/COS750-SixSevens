import test from 'node:test'
import assert from 'node:assert/strict'
import { createSearchTrace } from '../../logic/searching.js'
import {
  TOMBSTONE,
  checkKey,
  deleteTrace,
  emptyTable,
  insertTrace,
  loadFactor,
  searchTrace,
  summarise,
} from './visualiserLogic.js'

const insertAll = (size, keys) => keys.reduce((slots, key) => insertTrace(slots, key).slots, emptyTable(size))

test('insert stores a key in its home slot, or probes past collisions', () => {
  const slots = insertAll(10, [12, 22, 32])
  assert.deepEqual(slots.slice(2, 5), [12, 22, 32])
  const trace = insertTrace(slots, 42)
  assert.equal(trace.outcome.index, 5)
  assert.equal(trace.probes, 4)
  assert.deepEqual(trace.frames.map((f) => f.type), ['hash', 'collision', 'collision', 'collision', 'insert'])
})

test('insert wraps from the last slot to slot 0', () => {
  const slots = insertAll(5, [4, 9])
  assert.deepEqual(slots, [9, null, null, null, 4])
  assert.ok(insertTrace(insertAll(5, [4]), 9).frames.some((f) => f.type === 'wrap'))
})

test('duplicates are not stored twice and a full table is reported', () => {
  const slots = insertAll(5, [1, 2, 3, 4, 5])
  assert.equal(insertTrace(slots, 3).outcome.kind, 'duplicate')
  const full = insertTrace(slots, 10)
  assert.equal(full.outcome.kind, 'full')
  assert.deepEqual(full.slots, slots)
})

test('delete leaves a tombstone so keys further along stay findable', () => {
  const slots = insertAll(10, [12, 22, 32])
  const removed = deleteTrace(slots, 22)
  assert.equal(removed.outcome.kind, 'deleted')
  assert.equal(removed.slots[3], TOMBSTONE)
  const found = searchTrace(removed.slots, 32)
  assert.deepEqual([found.outcome.kind, found.outcome.index, found.probes], ['found', 4, 3])
})

test('insert reuses the first deleted slot once the key is known to be absent', () => {
  const slots = deleteTrace(insertAll(10, [12, 22, 32]), 22).slots
  const trace = insertTrace(slots, 42)
  assert.equal(trace.outcome.index, 3)
  // ...but never stores a key twice when it is already further along.
  assert.equal(insertTrace(slots, 32).outcome.kind, 'duplicate')
})

test('search outcomes agree with the Searching module for every key', () => {
  let slots = insertAll(10, [19, 12, 22, 32, 9, 29])
  slots = deleteTrace(slots, 22).slots
  for (let key = 0; key < 60; key += 1) {
    const ours = searchTrace(slots, key)
    const module5 = createSearchTrace(slots, key)
    assert.equal(ours.outcome.kind === 'found', module5.found, `key ${key}`)
    assert.equal(ours.probes, module5.checks, `key ${key}`)
  }
})

test('every frame carries a message and a pseudocode line', () => {
  const traces = [insertTrace(insertAll(5, [0, 5]), 10), searchTrace(emptyTable(7), 3), deleteTrace(insertAll(7, [3]), 3)]
  for (const frame of traces.flatMap((t) => t.frames)) {
    assert.ok(frame.message && frame.title && frame.line)
  }
})

test('load factor, key checks and summaries', () => {
  assert.equal(loadFactor(insertAll(10, [1, 2, 3])), 0.3)
  assert.equal(checkKey('23'), null)
  assert.match(checkKey(''), /Enter a key/)
  assert.match(checkKey('2.5'), /whole numbers/)
  assert.match(checkKey('-4'), /whole numbers/)
  assert.match(checkKey('10000'), /0 to 9999/)
  assert.equal(summarise(insertTrace(emptyTable(10), 23)), 'Inserted 23 into slot 3 (1 check)')
})
