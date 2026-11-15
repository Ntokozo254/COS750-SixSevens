import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { hashFunction } from '../../logic/hashing.js'
import { insertLinearProbing } from '../../logic/linearProbing.js'
import { searchLinearProbing } from '../../logic/searching.js'
import { PRACTICE_CHALLENGES, PRACTICE_STAGES } from './practiceChallenges.js'

function executeSnippet(code, input) {
  const supplied = structuredClone(input)
  const before = structuredClone(supplied)
  const output = vm.runInNewContext(`${code}\nsolve(input);`, { input: supplied }, { timeout: 300 })
  assert.deepEqual(supplied, before, 'A solution leaves its input unchanged')
  return JSON.parse(JSON.stringify(output))
}

function insertKeys(keys, size) {
  let table = Array(size).fill(null)
  for (const key of keys) table = insertLinearProbing(table, key).table
  return table
}

// Independent bounded reference. Each possible start is followed for at most one circuit.
function longestClusterReference(table) {
  let longest = 0
  for (let start = 0; start < table.length; start += 1) {
    let length = 0
    while (length < table.length && table[(start + length) % table.length] !== null) {
      length += 1
    }
    longest = Math.max(longest, length)
  }
  return longest
}

function referenceOutput(challengeId, input) {
  switch (challengeId) {
    case 'home-slot':
      return hashFunction(input.key, input.size)
    case 'load-factor':
      return input.table.filter((value) => value !== null).length / input.table.length
    case 'insert-key':
      return insertLinearProbing([...input.table], input.key).table
    case 'build-table':
      return insertKeys(input.keys, input.size)
    case 'find-key':
      return searchLinearProbing(input.table, input.key).index
    case 'count-probes':
      return searchLinearProbing(input.table, input.key).checks
    case 'rehash':
      return insertKeys(
        input.table.filter((key) => key !== null),
        input.newSize,
      )
    case 'longest-cyclic-cluster':
      return longestClusterReference(input.table)
    default:
      throw new Error(`Unexpected challenge ${challengeId}`)
  }
}

test('four ordered stages contain exactly the eight original challenge IDs', () => {
  assert.deepEqual(
    PRACTICE_STAGES.map((stage) => stage.id),
    ['fundamentals', 'insertion', 'searching', 'advanced'],
  )
  assert.deepEqual(
    PRACTICE_STAGES.map((stage) => stage.challengeIds.length),
    [2, 2, 2, 2],
  )
  const stageIds = PRACTICE_STAGES.flatMap((stage) => stage.challengeIds)
  assert.equal(new Set(stageIds).size, 8)
  assert.deepEqual(
    stageIds,
    PRACTICE_CHALLENGES.map((challenge) => challenge.id),
  )
  for (const stage of PRACTICE_STAGES) {
    assert.ok(stage.title && stage.description && stage.level)
    for (const id of stage.challengeIds) {
      assert.equal(PRACTICE_CHALLENGES.find((challenge) => challenge.id === id).stageId, stage.id)
    }
  }
})

test('every challenge has complete educational content and unique inspectable tests', () => {
  const testNames = []
  const textFields = [
    'title',
    'difficulty',
    'summary',
    'prompt',
    'starterCode',
    'workedCode',
    'workedExplanation',
    'solution',
  ]
  for (const challenge of PRACTICE_CHALLENGES) {
    assert.equal(challenge.version, 1)
    for (const field of textFields)
      assert.ok(
        typeof challenge[field] === 'string' && challenge[field].trim(),
        `${challenge.id} ${field}`,
      )
    assert.ok(challenge.objectives.length >= 2)
    assert.ok(challenge.constraints.length >= 3)
    assert.equal(challenge.hints.length, 3)
    assert.ok(challenge.hints.every((hint) => typeof hint === 'string' && hint.length > 0))
    assert.ok(challenge.tests.length >= 4 && challenge.tests.length <= 6)
    for (const fixture of challenge.tests) {
      assert.ok(fixture.name && fixture.explanation)
      assert.ok(Object.hasOwn(fixture, 'input'))
      assert.ok(Object.hasOwn(fixture, 'expected'))
      testNames.push(fixture.name)
    }
    for (const field of ['starterCode', 'workedCode', 'solution']) {
      assert.match(challenge[field], /function solve\(input\)/)
      assert.doesNotThrow(() => new vm.Script(challenge[field]))
    }
  }
  assert.equal(testNames.length, 42)
  assert.equal(new Set(testNames).size, testNames.length)
})

for (const challenge of PRACTICE_CHALLENGES) {
  test(`${challenge.id} examples and explicit expected outputs agree with shared operations`, () => {
    const original = structuredClone(challenge)
    for (const fixture of challenge.tests) {
      assert.deepEqual(referenceOutput(challenge.id, fixture.input), fixture.expected, fixture.name)
    }
    assert.deepEqual(
      referenceOutput(challenge.id, challenge.example.input),
      challenge.example.output,
    )
    assert.deepEqual(challenge, original)
  })

  test(`${challenge.id} reference solution passes every visible case without mutating inputs`, () => {
    for (const fixture of challenge.tests) {
      assert.deepEqual(
        executeSnippet(challenge.solution, fixture.input),
        fixture.expected,
        fixture.name,
      )
    }
    assert.deepEqual(
      executeSnippet(challenge.solution, challenge.example.input),
      challenge.example.output,
    )
  })
}

test('worked snippets demonstrate their stated smaller tasks independently of full solutions', () => {
  const challenges = new Map(PRACTICE_CHALLENGES.map((challenge) => [challenge.id, challenge]))
  const run = (id, input) => executeSnippet(challenges.get(id).workedCode, input)
  assert.equal(run('home-slot', { key: 23, size: 10 }), 3)
  assert.equal(run('load-factor', { table: [0, null, 7, null] }), 2)
  assert.deepEqual(run('insert-key', { table: Array(5).fill(null), key: 9 }), [4, 0, 1, 2, 3])
  assert.deepEqual(run('build-table', { keys: [12, 22], size: 5 }), [null, null, 12, null, null])
  assert.equal(run('find-key', { table: [0, null, null], key: 0 }), true)
  assert.deepEqual(run('count-probes', { table: [null, null, null], key: 2 }), {
    index: 2,
    value: null,
    probes: 1,
  })
  assert.deepEqual(run('rehash', { table: [0, 5, 10, null, null], newSize: 10 }), [
    { key: 0, home: 0 },
    { key: 5, home: 5 },
    { key: 10, home: 0 },
  ])
  assert.equal(run('longest-cyclic-cluster', { table: [0, 1, null, 3, 4] }), 2)
})

test('table and key fixtures stay within the documented supported ranges', () => {
  for (const challenge of PRACTICE_CHALLENGES) {
    const inputs = [challenge.example.input, ...challenge.tests.map((fixture) => fixture.input)]
    for (const input of inputs) {
      if (input.table) {
        assert.ok(input.table.length >= 1 && input.table.length <= 20)
        for (const key of input.table)
          assert.ok(key === null || (Number.isInteger(key) && key >= 0 && key <= 1_000_000))
      }
      if (Object.hasOwn(input, 'key'))
        assert.ok(Number.isInteger(input.key) && input.key >= 0 && input.key <= 1_000_000)
      if (Object.hasOwn(input, 'size'))
        assert.ok(Number.isInteger(input.size) && input.size >= 1 && input.size <= 20)
      if (input.keys) {
        assert.ok(input.keys.length <= 30)
        for (const key of input.keys)
          assert.ok(Number.isInteger(key) && key >= 0 && key <= 1_000_000)
      }
      if (Object.hasOwn(input, 'newSize'))
        assert.ok(input.newSize > input.table.length && input.newSize <= 20)
    }
  }
})

test('cyclic-cluster cases cover empty, full, wrapped and separated occupied runs', () => {
  const challenge = PRACTICE_CHALLENGES.find((item) => item.id === 'longest-cyclic-cluster')
  assert.deepEqual(
    challenge.tests.map((fixture) => fixture.expected),
    [0, 1, 4, 3, 4, 2],
  )
  for (let size = 1; size <= 6; size += 1) {
    for (let mask = 0; mask < 2 ** size; mask += 1) {
      const table = Array.from({ length: size }, (_, index) => (mask & (1 << index) ? index : null))
      assert.equal(executeSnippet(challenge.solution, { table }), longestClusterReference(table))
    }
  }
})
