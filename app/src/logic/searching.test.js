import test from 'node:test'
import assert from 'node:assert/strict'
import { searchLinearProbing, createSearchTrace } from './searching.js'

const numericExample = () => [19, null, 12, 22, 32, null, null, null, null, 9]
const backendExample = () => ({
  size: 5,
  slots: [
    null,
    { key: 1, value: 'first' },
    { tombstone: true },
    { key: 11, value: { task: ['third'] } },
    null,
  ],
})

test('preserves the legacy result and check-frame API for numeric array callers', () => {
  const table = numericExample()
  const result = searchLinearProbing(table, 32)
  assert.equal(result.found, true)
  assert.equal(result.index, 4)
  assert.equal(result.message, 'Key 32 found at slot 4.')
  assert.equal(result.homeIndex, 2)
  assert.equal(result.checks, 3)
  assert.equal(result.reason, 'found')
  assert.deepEqual(
    result.steps.map((step) => step.type),
    ['check', 'check', 'check'],
  )
  assert.deepEqual(
    result.steps.map((step) => step.index),
    [2, 3, 4],
  )
  assert.deepEqual(result.steps[0], {
    index: 2,
    key: 32,
    value: 12,
    table,
    type: 'check',
    message: 'Checking slot 2.',
  })
})

test('stops at the first null, undefined or sparse empty slot', () => {
  for (const table of [[null, 1, 2], [undefined, 1, 2], Array(3)]) {
    const result = searchLinearProbing(table, 3)
    assert.equal(result.found, false)
    assert.equal(result.index, -1)
    assert.equal(result.checks, 1)
    assert.equal(result.reason, 'empty')
    assert.equal(result.message, 'Key 3 was not found. An empty slot was reached.')
    assert.deepEqual(
      result.steps.map((step) => step.index),
      [0],
    )
  }
  const result = searchLinearProbing([3, null, 2], 6)
  assert.equal(result.checks, 2)
  assert.deepEqual(
    result.steps.map((step) => step.index),
    [0, 1],
  )
})

test('normalizes negative integer hashes and preserves key zero', () => {
  const negative = searchLinearProbing([null, null, null, null, -1], -1)
  assert.equal(negative.homeIndex, 4)
  assert.equal(negative.index, 4)
  assert.equal(negative.checks, 1)
  const zero = searchLinearProbing([0, null, null], 0)
  assert.equal(zero.found, true)
  assert.equal(zero.index, 0)
  assert.equal(searchLinearProbing([Number.MIN_SAFE_INTEGER], Number.MIN_SAFE_INTEGER).found, true)
})

test('wraps around and bounds an unsuccessful scan of a full table', () => {
  const found = searchLinearProbing(numericExample(), 19)
  assert.equal(found.found, true)
  assert.deepEqual(
    found.steps.map((step) => step.index),
    [9, 0],
  )
  const full = searchLinearProbing([0, 1, 2], 5)
  assert.equal(full.found, false)
  assert.equal(full.checks, 3)
  assert.equal(full.reason, 'exhausted')
  assert.deepEqual(
    full.steps.map((step) => step.index),
    [2, 0, 1],
  )
  assert.equal(full.message, 'Key 5 was not found after checking the table.')
})

test('accepts backend table payloads and skips tombstones before a matching entry', () => {
  const table = backendExample()
  const result = searchLinearProbing(table, 11)
  assert.equal(result.found, true)
  assert.equal(result.homeIndex, 1)
  assert.equal(result.index, 3)
  assert.equal(result.checks, 3)
  assert.deepEqual(
    result.steps.map((step) => step.index),
    [1, 2, 3],
  )
  assert.deepEqual(result.steps[1].value, { tombstone: true })
  assert.deepEqual(result.steps[2].value, { key: 11, value: { task: ['third'] } })
  const slotsOnly = searchLinearProbing(table.slots, 11)
  assert.deepEqual(slotsOnly, result)
})

test('a table containing only occupied or deleted slots exhausts each slot once', () => {
  const table = {
    size: 3,
    slots: [{ key: 0, value: null }, { tombstone: true }, { tombstone: true }],
  }
  const result = searchLinearProbing(table, 5)
  assert.equal(result.found, false)
  assert.equal(result.reason, 'exhausted')
  assert.equal(result.checks, 3)
  assert.deepEqual(
    result.steps.map((step) => step.index),
    [2, 0, 1],
  )
  assert.equal(searchLinearProbing([{ tombstone: true }], 0).reason, 'exhausted')
})

test('single-slot found and empty cases terminate after one check', () => {
  assert.equal(searchLinearProbing([0], 0).checks, 1)
  assert.equal(searchLinearProbing([0], 1).reason, 'exhausted')
  const trace = createSearchTrace([null], 0)
  assert.equal(trace.checks, 1)
  assert.equal(trace.reason, 'empty')
  assert.deepEqual(
    trace.steps.map((step) => step.type),
    ['hash', 'empty', 'missing'],
  )
  assert.deepEqual(
    trace.steps.map((step) => step.line),
    [1, 4, 4],
  )
})

test('search traces synchronize wrap, collision and found frames with pseudocode and cost', () => {
  const trace = createSearchTrace(numericExample(), 19)
  assert.equal(trace.found, true)
  assert.equal(trace.index, 0)
  assert.equal(trace.homeIndex, 9)
  assert.equal(trace.checks, 2)
  assert.deepEqual(
    trace.steps.map((step) => step.type),
    ['hash', 'collision', 'wrap', 'found'],
  )
  assert.deepEqual(
    trace.steps.map((step) => step.line),
    [1, 6, 3, 5],
  )
  assert.deepEqual(
    trace.steps.map((step) => step.checks),
    [0, 1, 1, 2],
  )
  assert.deepEqual(
    trace.steps.map((step) => step.checkedIndices),
    [[], [9], [9], [9, 0]],
  )
  assert.equal(trace.steps.at(-1).matchIndex, 0)
  assert.equal(trace.steps.at(-1).index, 0)
})

test('traces treat deleted slots as checks and preserve the probe sequence', () => {
  const trace = createSearchTrace(backendExample(), 11)
  assert.equal(trace.checks, 3)
  assert.deepEqual(
    trace.steps.map((step) => step.type),
    ['hash', 'collision', 'deleted', 'found'],
  )
  assert.deepEqual(
    trace.steps.map((step) => step.line),
    [1, 6, 6, 5],
  )
  assert.deepEqual(trace.steps.at(-1).checkedIndices, [1, 2, 3])
  assert.equal(trace.steps.at(-1).matchIndex, 3)
})

test('missing traces stop at an empty slot or after an exhaustive scan', () => {
  const empty = createSearchTrace(numericExample(), 42)
  assert.equal(empty.reason, 'empty')
  assert.equal(empty.checks, 4)
  assert.deepEqual(
    empty.steps.map((step) => step.type),
    ['hash', 'collision', 'collision', 'collision', 'empty', 'missing'],
  )
  assert.equal(empty.steps.at(-1).line, 4)
  assert.equal(empty.steps.at(-1).index, null)
  assert.equal(empty.steps.at(-1).matchIndex, null)
  const exhausted = createSearchTrace([0, 1, 2], 5)
  assert.equal(exhausted.reason, 'exhausted')
  assert.equal(exhausted.steps.at(-1).line, 7)
  assert.equal(exhausted.steps.at(-1).checks, 3)
  assert.deepEqual(exhausted.steps.at(-1).checkedIndices, [2, 0, 1])
})

test('every legacy and lesson snapshot owns its arrays and nested values', () => {
  const table = backendExample()
  const original = structuredClone(table)
  const legacy = searchLinearProbing(table, 11)
  legacy.steps[0].table[3].value.task.push('snapshot change')
  legacy.steps[2].value.value.task.push('entry change')
  assert.deepEqual(table, original)
  assert.deepEqual(legacy.steps[1].table[3].value.task, ['third'])
  assert.deepEqual(legacy.steps[2].table[3].value.task, ['third'])
  const trace = createSearchTrace(table, 11)
  trace.steps[0].table[3].value.task.push('trace change')
  trace.steps[1].checkedIndices.push(99)
  assert.deepEqual(table, original)
  assert.deepEqual(trace.steps[1].table[3].value.task, ['third'])
  assert.deepEqual(trace.steps[2].checkedIndices, [1, 2])
  table.slots[3].value.task.push('caller change')
  assert.deepEqual(trace.steps.at(-1).table[3].value.task, ['third'])
})

test('rejects empty tables, malformed payloads and unsafe/noninteger keys', () => {
  assert.throws(() => searchLinearProbing([], 1), /cannot be empty/)
  for (const key of [NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1, '1', null]) {
    assert.throws(() => searchLinearProbing([null], key), /safe integer/)
  }
  for (const table of [
    null,
    {},
    { size: 0, slots: [] },
    { size: 2, slots: [null] },
    { size: 1.5, slots: [null] },
    { size: 1, slots: 'invalid' },
    ['1'],
    [Infinity],
    [{ value: 'missing key' }],
    [{ tombstone: false }],
    [[1]],
  ]) {
    assert.throws(() => createSearchTrace(table, 1))
  }
})
