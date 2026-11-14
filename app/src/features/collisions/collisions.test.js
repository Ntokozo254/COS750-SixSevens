import test from 'node:test'
import assert from 'node:assert/strict'
import { hashFunction } from '../../logic/hashing.js'
import { COLLISION_PRACTICE_CASES, COLLISIONS_TOPIC } from './collisionsData.js'
import { createCollisionTrace, getCollisionHomes, parseCollisionInputs } from './collisionsLogic.js'

test('recognises distinct colliding keys and reports duplicate requests separately', () => {
  assert.deepEqual(getCollisionHomes([12, 22, 12], 10), [
    { key: 12, home: 2, duplicate: false, collision: false },
    { key: 22, home: 2, duplicate: false, collision: true },
    { key: 12, home: 2, duplicate: true, collision: false },
  ])
  const changed = getCollisionHomes([12, 22], 7)
  assert.deepEqual(changed.map((item) => item.home), [5, 1])
  assert.equal(changed[1].collision, false)
  assert.equal(getCollisionHomes([1, 8], 7)[1].collision, true)
})

test('linear probing preserves existing entries and records home and final positions', () => {
  const keys = [12, 22, 32]
  const trace = createCollisionTrace(keys, 10)
  assert.deepEqual(trace.table, [null, null, 12, 22, 32, null, null, null, null, null])
  assert.deepEqual(trace.placements, [
    { key: 12, home: 2, index: 2, status: 'stored' },
    { key: 22, home: 2, index: 3, status: 'stored' },
    { key: 32, home: 2, index: 4, status: 'stored' },
  ])
  assert.deepEqual(keys, [12, 22, 32])
  assert.ok(trace.steps.some((step) => step.type === 'collision' && step.index === 2))
  assert.equal(trace.steps.at(-1).type, 'insert')
  assert.equal(trace.steps.at(-1).table[4], 32)
})

test('probing wraps, reports full tables, and finds duplicates even after a full insertion', () => {
  const wrapped = createCollisionTrace([4, 9, 14], 5)
  assert.deepEqual(wrapped.table, [9, 14, null, null, 4])
  assert.equal(wrapped.placements.at(-1).index, 1)
  assert.ok(wrapped.steps.some((step) => step.text.includes('wraps to the first slot')))

  const full = createCollisionTrace([0, 3, 6, 9, 3], 3)
  assert.deepEqual(full.table, [0, 3, 6])
  assert.equal(full.placements[3].status, 'full')
  assert.equal(full.placements[3].index, null)
  assert.equal(full.placements[4].status, 'duplicate')
  assert.equal(full.placements[4].index, 1)
  assert.equal(full.steps.filter((step) => step.key === 9 && step.type === 'check').length, 3)
  assert.equal(full.steps.at(-1).type, 'duplicate')
})

test('chaining extends a bucket beyond table capacity while preserving distinct keys', () => {
  const trace = createCollisionTrace([1, 6, 11, 6], 5, 'chaining')
  assert.deepEqual(trace.buckets[1], [1, 6, 11])
  assert.equal(trace.placements.at(-1).status, 'duplicate')
  assert.deepEqual(createCollisionTrace([0, 1, 2], 1, 'chaining').buckets, [[0, 1, 2]])
  assert.equal(createCollisionTrace([0, 1, 2], 1).placements.at(-1).status, 'full')
})

test('each recorded state has independent arrays and leaves inputs intact', () => {
  const keys = [12, 22, 32]
  const chain = createCollisionTrace(keys, 10, 'chaining')
  chain.steps.at(-1).buckets[2].push(42)
  chain.steps[0].table[0] = 100
  assert.deepEqual(chain.buckets[2], [12, 22, 32])
  assert.deepEqual(chain.steps[1].buckets[2], [])
  assert.equal(chain.steps[1].table[0], null)
  const probe = createCollisionTrace(keys, 10)
  probe.steps.at(-1).table[2] = 100
  assert.equal(probe.table[2], 12)
  assert.equal(probe.steps[0].table[2], null)
  assert.deepEqual(keys, [12, 22, 32])
})

test('parses bounded integer input strictly and rejects invalid operation data', () => {
  assert.deepEqual(parseCollisionInputs('0, 12, 22, 12', 10), { keys: [0, 12, 22, 12], error: null })
  for (const text of ['', ' ', '1,,2', '1,', '1.5', '-1', '1e3', '1000001']) {
    assert.equal(parseCollisionInputs(text, 10).keys, null, text)
  }
  assert.ok(parseCollisionInputs('1', 0).error)
  assert.ok(parseCollisionInputs('1', 13).error)
  assert.ok(parseCollisionInputs(Array(13).fill(1).join(','), 10).error)
  for (const keys of [null, [], Array(2), [NaN], [Infinity], [1.5], [-1], [1_000_001]]) {
    assert.throws(() => createCollisionTrace(keys, 10))
  }
  assert.throws(() => createCollisionTrace([1], 2, 'unknown'))
  assert.equal(createCollisionTrace([1_000_000], 12).placements[0].home, hashFunction(1_000_000, 12))
})

test('question sets cover all five concepts with canonical unique LO3 identifiers', () => {
  assert.equal(COLLISIONS_TOPIC.id, 3)
  assert.equal(COLLISIONS_TOPIC.outcomes.length, 4)
  assert.equal(COLLISIONS_TOPIC.questionSets.length, 2)
  const allIds = []
  for (const set of COLLISIONS_TOPIC.questionSets) {
    assert.equal(set.length, 5)
    assert.deepEqual(set.map((question) => question.concept).sort(), Object.keys(COLLISIONS_TOPIC.concepts).sort())
    for (const question of set) {
      assert.equal(question.objective, 'LO3')
      assert.equal(question.options.length, 4)
      assert.ok(Number.isInteger(question.correctAnswer))
      assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.options.length)
      assert.ok(question.explanation.length > 0)
      assert.ok(['learn', 'explore', 'practice'].includes(COLLISIONS_TOPIC.concepts[question.concept].review))
      allIds.push(question.id)
    }
  }
  assert.equal(new Set(allIds).size, 10)
})

test('authored modulo, probing, and chaining assessment answers match the shared operations', () => {
  const questions = new Map(COLLISIONS_TOPIC.questionSets.flat().map((question) => [question.id, question]))
  const answer = (id) => {
    const question = questions.get(id)
    return question.options[question.correctAnswer]
  }
  assert.equal(answer('lo3-home-a'), `Slot ${hashFunction(19, 10)}`)
  assert.equal(answer('lo3-home-b'), `Slot ${hashFunction(14, 5)}`)
  assert.equal(hashFunction(4, 5), hashFunction(14, 5))
  assert.equal(answer('lo3-probing-a'), `Slot ${createCollisionTrace([12, 22, 32], 10).placements.at(-1).index}`)
  assert.equal(answer('lo3-probing-b'), `Slot ${createCollisionTrace([4, 9, 14], 5).placements.at(-1).index}`)
  assert.deepEqual(createCollisionTrace([12, 22], 10, 'chaining').buckets[2], [12, 22])
  assert.equal(answer('lo3-chaining-a'), 'Bucket 2 holds both 12 and 22')
  assert.deepEqual(createCollisionTrace([1, 6, 11], 5, 'chaining').buckets[1], [1, 6, 11])
  assert.equal(answer('lo3-chaining-b'), 'In bucket 1 with 1 and 6')
  assert.equal(answer('lo3-definition-a'), 'A collision')
  assert.equal(answer('lo3-definition-b'), 'A duplicate key request')
  assert.equal(answer('lo3-limits-a'), 'This pair now has different homes, while other keys may collide')
  assert.equal(answer('lo3-limits-b'), 'More possible keys than home slots forces some keys to share a home')
})

test('guided practice fixtures have consistent collision and resolution outcomes', () => {
  assert.equal(COLLISION_PRACTICE_CASES.length, 5)
  const cases = new Map(COLLISION_PRACTICE_CASES.map((exercise) => [exercise.id, exercise]))
  for (const exercise of cases.values()) {
    assert.ok(exercise.options[exercise.correctAnswer])
    assert.equal(exercise.hints.length, 2)
  }
  assert.equal(getCollisionHomes(cases.get('pair-ten').keys, 10)[1].collision, true)
  assert.equal(getCollisionHomes(cases.get('pair-seven').keys, 7)[1].collision, false)
  assert.equal(createCollisionTrace([...cases.get('probe-cluster').keys, 32], 10).placements.at(-1).index, 4)
  assert.equal(createCollisionTrace([...cases.get('probe-wrap').keys, 14], 5).placements.at(-1).index, 1)
  assert.deepEqual(createCollisionTrace([...cases.get('chain-three').keys, 11], 5, 'chaining').buckets[1], [1, 6, 11])
})
