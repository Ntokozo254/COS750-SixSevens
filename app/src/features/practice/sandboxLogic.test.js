import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSandboxTable,
  MAX_SANDBOX_KEYS,
  parseSandboxInputs,
  parseSandboxKey,
  runSandboxOperation,
} from './sandboxLogic.js'

test('parses bounded decimal inputs, retains zero, and accepts an empty build', () => {
  assert.deepEqual(parseSandboxInputs(' 10 ', '0, 12, 22, 1000000'), {
    capacity: 10,
    keys: [0, 12, 22, 1_000_000],
  })
  assert.deepEqual(parseSandboxInputs('1', '  '), { capacity: 1, keys: [] })
  assert.equal(parseSandboxKey('0'), 0)
  assert.equal(parseSandboxKey('1000000'), 1_000_000)
  assert.equal(parseSandboxInputs('20', Array(MAX_SANDBOX_KEYS).fill('0').join(',')).keys.length, MAX_SANDBOX_KEYS)
})

test('rejects malformed lists, fractional or out-of-range numbers and unbounded inputs', () => {
  for (const capacity of ['', '0', '21', '1.5', '-1', '1e1', 'Infinity']) {
    assert.throws(() => parseSandboxInputs(capacity, '1'))
  }
  for (const keys of ['1,,2', '1,', ',1', '-1', '1.5', '1e3', '1000001', 'Infinity']) {
    assert.throws(() => parseSandboxInputs('10', keys))
  }
  assert.throws(() => parseSandboxInputs('20', Array(MAX_SANDBOX_KEYS + 1).fill('0').join(',')))
  assert.throws(() => parseSandboxInputs('10', '0'.repeat(401)))
  for (const key of ['', '-1', '1.5', '1e3', '1000001', null, {}, '0'.repeat(33)]) {
    assert.throws(() => parseSandboxKey(key))
  }
})

test('build respects insertion order and preserves preceding entries after duplicate and full results', () => {
  const build = buildSandboxTable(2, [0, 2, 2, 4])
  assert.deepEqual(build.table, [0, 2])
  assert.deepEqual(build.outcomes.map((outcome) => outcome.status), ['inserted', 'inserted', 'duplicate', 'full'])
  assert.deepEqual(build.outcomes[1].path, [0, 1])
  assert.equal(build.outcomes[2].index, 1)
  assert.equal(build.outcomes[3].probes, 2)
  assert.deepEqual(build.outcomes[3].table, [0, 2])
  assert.deepEqual(buildSandboxTable(3).table, [null, null, null])
})

test('insertion and search follow wrapped paths with index zero as a valid result', () => {
  const table = buildSandboxTable(5, [4, 9, 14]).table
  assert.deepEqual(table, [9, 14, null, null, 4])
  const foundAtZero = runSandboxOperation(table, 'search', 9)
  assert.equal(foundAtZero.status, 'found')
  assert.equal(foundAtZero.index, 0)
  assert.deepEqual(foundAtZero.path, [4, 0])
  assert.equal(foundAtZero.probes, 2)

  const missing = runSandboxOperation(table, 'search', 24)
  assert.equal(missing.status, 'missing')
  assert.equal(missing.reason, 'empty')
  assert.deepEqual(missing.path, [4, 0, 1, 2])
  assert.equal(missing.probes, 4)

  const inserted = runSandboxOperation(table, 'insert', 19)
  assert.equal(inserted.status, 'inserted')
  assert.equal(inserted.index, 2)
  assert.deepEqual(inserted.path, [4, 0, 1, 2])
  assert.deepEqual(table, [9, 14, null, null, 4])
})

test('one-slot empty and full tables terminate for zero and boundary keys', () => {
  const empty = runSandboxOperation([null], 'search', 0)
  assert.equal(empty.status, 'missing')
  assert.equal(empty.reason, 'empty')
  assert.equal(empty.probes, 1)

  const inserted = runSandboxOperation([null], 'insert', 0)
  assert.deepEqual(inserted.table, [0])
  assert.equal(inserted.index, 0)
  const duplicate = runSandboxOperation(inserted.table, 'insert', 0)
  assert.equal(duplicate.status, 'duplicate')
  assert.equal(duplicate.index, 0)
  const full = runSandboxOperation(inserted.table, 'insert', 1_000_000)
  assert.equal(full.status, 'full')
  assert.equal(full.index, null)
  assert.equal(full.probes, 1)
  const absent = runSandboxOperation(inserted.table, 'search', 1_000_000)
  assert.equal(absent.reason, 'exhausted')
  assert.equal(absent.probes, 1)
  assert.deepEqual(absent.path, [0])
})

test('operation results and engine frames have independent arrays', () => {
  const original = [0, null, 2, null]
  const result = runSandboxOperation(original, 'insert', 4)
  result.table[0] = 99
  result.initialTable[0] = 88
  result.steps[0].table[0] = 77
  assert.deepEqual(original, [0, null, 2, null])
  assert.equal(result.steps[1].table[0], 0)

  const found = runSandboxOperation(original, 'search', 2)
  found.table[2] = 99
  found.steps[0].table[2] = 77
  assert.deepEqual(original, [0, null, 2, null])
  assert.equal(found.initialTable[2], 2)
})

test('build snapshots do not share arrays with input keys, later outcomes or the final table', () => {
  const keys = [12, 22, 32]
  const build = buildSandboxTable(5, keys)
  keys[0] = 100
  build.table[2] = 99
  build.outcomes[0].table[2] = 88
  assert.deepEqual(build.keys, [12, 22, 32])
  assert.equal(build.outcomes[1].table[2], 12)
  assert.equal(build.outcomes[2].table[2], 12)
  assert.equal(build.outcomes[0].initialTable[2], null)
})

test('public operations reject invalid table shapes, duplicate stored keys and unsupported actions', () => {
  for (const table of [null, [], Array(2), Array(21).fill(null), [1, 1], ['1'], [-1], [NaN]]) {
    assert.throws(() => runSandboxOperation(table, 'search', 0))
  }
  assert.throws(() => runSandboxOperation([null], 'delete', 0), TypeError)
  assert.throws(() => runSandboxOperation([null], 'insert', 1_000_001), RangeError)
  assert.throws(() => buildSandboxTable(1, Array(2)))
  assert.throws(() => buildSandboxTable(20, Array(21).fill(0)))
  assert.throws(() => buildSandboxTable(0, []))
})
