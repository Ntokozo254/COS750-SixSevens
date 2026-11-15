import test from 'node:test'
import assert from 'node:assert/strict'
import { hashFunction } from '../../logic/hashing.js'
import { LOAD_FACTOR_PRACTICE, LOAD_FACTOR_TOPIC } from './loadFactorData.js'
import {
  buildTable,
  createComparisonTables,
  getTableStats,
  measureInsertion,
  measureSearch,
  rehashTable,
} from './loadFactorLogic.js'

test('load factor counts stored entries and all slots, including key zero', () => {
  const empty = getTableStats(Array(10).fill(null))
  assert.equal(empty.entries, 0)
  assert.equal(empty.capacity, 10)
  assert.equal(empty.loadFactor, 0)
  assert.deepEqual(empty.clusters, [])
  assert.equal(empty.longestCluster, 0)
  assert.equal(getTableStats([0]).loadFactor, 1)
  assert.equal(getTableStats([null]).loadFactor, 0)
  assert.equal(getTableStats(buildTable([0, 2, 4], 8)).loadFactor, 0.375)
  assert.equal(getTableStats(Array(5)).entries, 0)
})

test('cyclic clusters join the final and first occupied slots exactly once', () => {
  const wrapped = [10, 11, null, null, null, null, null, null, 8, 9]
  const stats = getTableStats(wrapped)
  assert.deepEqual(stats.clusters, [[8, 9, 0, 1]])
  assert.equal(stats.clusterCount, 1)
  assert.equal(stats.longestCluster, 4)
  assert.equal(stats.entries, 4)
  const separate = getTableStats([0, 1, null, 3, null])
  assert.deepEqual(separate.clusters, [[3], [0, 1]])
  assert.equal(separate.clusters.flat().length, separate.entries)
})

test('single and full tables form one occupied cluster without double counting', () => {
  assert.deepEqual(getTableStats([0]).clusters, [[0]])
  const full = getTableStats([0, 1, 2, 3])
  assert.deepEqual(full.clusters, [[0, 1, 2, 3]])
  assert.equal(full.clusterCount, 1)
  assert.equal(full.longestCluster, 4)
  assert.equal(full.loadFactor, 1)
})

test('the default equal-load layouts produce different measured paths for the same absent key', () => {
  const { spread, clustered } = createComparisonTables()
  assert.deepEqual(spread, [0, null, 2, null, 4, null, 6, null, 8, null])
  assert.deepEqual(clustered, [0, 10, 20, 30, 40, null, null, null, null, null])
  assert.equal(getTableStats(spread).loadFactor, 0.5)
  assert.equal(getTableStats(clustered).loadFactor, 0.5)
  assert.equal(getTableStats(spread).longestCluster, 1)
  assert.equal(getTableStats(clustered).longestCluster, 5)
  assert.deepEqual(measureSearch(spread, 50), { found: false, index: -1, probes: 2, path: [0, 1], reason: 'empty' })
  assert.deepEqual(measureSearch(clustered, 50), { found: false, index: -1, probes: 6, path: [0, 1, 2, 3, 4, 5], reason: 'empty' })
  assert.equal(measureInsertion(spread, 50).probes, 2)
  assert.equal(measureInsertion(clustered, 50).probes, 6)
})

test('all density controls preserve their stated count and bound each probe sequence', () => {
  for (let entries = 0; entries <= 10; entries += 1) {
    const examples = createComparisonTables(entries)
    for (const table of Object.values(examples)) {
      const stats = getTableStats(table)
      assert.equal(stats.entries, entries)
      assert.equal(stats.loadFactor, entries / 10)
      assert.equal(stats.clusters.flat().length, entries)
      assert.ok(measureSearch(table, 100).probes <= 10)
      assert.ok(measureInsertion(table, 100).probes <= 10)
    }
  }
})

test('measurement reuses the shared probing engines, reports duplicates/fullness, and leaves inputs unchanged', () => {
  const table = buildTable([0, 10, 20])
  const original = [...table]
  const inserted = measureInsertion(table, 30)
  assert.equal(inserted.inserted, true)
  assert.equal(inserted.index, 3)
  assert.equal(inserted.probes, 4)
  assert.equal(inserted.table[3], 30)
  assert.deepEqual(table, original)
  assert.equal(measureInsertion(table, 20).reason, 'duplicate')
  assert.equal(measureInsertion(table, 20).probes, 3)
  assert.equal(measureSearch(table, 20).probes, 3)
  const full = buildTable([0, 1, 2, 3], 4)
  assert.equal(measureSearch(full, 8).reason, 'exhausted')
  assert.equal(measureSearch(full, 8).probes, 4)
  assert.equal(measureInsertion(full, 8).reason, 'full')
  assert.equal(measureInsertion(full, 8).probes, 4)
})

test('rehashing preserves keys and recomputes home slots while resolving new collisions', () => {
  const table = buildTable([12, 22, 32], 10)
  const original = [...table]
  const resized = rehashTable(table, 20)
  assert.deepEqual(table, original)
  assert.deepEqual(resized.filter((key) => key !== null).sort((a, b) => a - b), [12, 22, 32])
  assert.equal(getTableStats(resized).loadFactor, 0.15)
  assert.equal(hashFunction(32, 20), 12)
  assert.equal(resized[12], 12)
  assert.equal(resized[13], 32)
  assert.equal(measureSearch(resized, 32).found, true)
  assert.throws(() => rehashTable(table, 2), RangeError)
  assert.equal(getTableStats(buildTable([1, 12], 11)).longestCluster, 2)
})

test('capacity and key validation reject malformed or unsupported examples', () => {
  for (const capacity of [0, -1, 1.5, 51, '10']) {
    assert.throws(() => buildTable([], capacity), RangeError)
  }
  for (const key of [-1, 1.5, NaN, Infinity, 1_000_001, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => buildTable([key]), RangeError)
    assert.throws(() => measureSearch([null], key), RangeError)
  }
  assert.throws(() => buildTable([1, 1]), TypeError)
  assert.throws(() => buildTable([0, 1], 1), RangeError)
  assert.throws(() => getTableStats([]), RangeError)
  assert.throws(() => getTableStats([1, 1]), TypeError)
  assert.throws(() => getTableStats(['1']), RangeError)
  assert.throws(() => createComparisonTables(11), RangeError)
  assert.throws(() => createComparisonTables(-1), RangeError)
  assert.equal(measureSearch(buildTable([1_000_000], 50), 1_000_000).found, true)
})

test('the module supplies novice outcomes, scaffolding and two aligned five-question assessment sets', () => {
  const topic = LOAD_FACTOR_TOPIC
  assert.equal(topic.id, 6)
  assert.equal(topic.outcomes.length, 4)
  assert.ok(topic.sections.length >= 4)
  assert.ok(topic.refresher.length >= 3)
  assert.ok(topic.reflectionPrompt.length > 0)
  assert.ok(topic.warmup.hints.length >= 2)
  assert.ok(topic.questionSets.length >= 2)
  const ids = []
  for (const questions of topic.questionSets) {
    assert.equal(questions.length, 5)
    assert.deepEqual(questions.map((question) => question.concept).sort(), Object.keys(topic.concepts).sort())
    for (const question of questions) {
      assert.equal(question.objective, 'LO6')
      assert.match(question.id, /^lo6-/)
      assert.ok(Number.isInteger(question.correctAnswer))
      assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.options.length)
      assert.ok(question.explanation.length > 0)
      assert.ok(topic.concepts[question.concept].hints.length >= 2)
      ids.push(question.id)
    }
  }
  assert.equal(new Set(ids).size, ids.length)
})

test('authored calculation, cluster, probe and rehash answers agree with executable examples', () => {
  const [first, second] = LOAD_FACTOR_TOPIC.questionSets
  const { spread, clustered } = createComparisonTables()
  assert.equal(Number(first[0].options[first[0].correctAnswer]), getTableStats(spread).loadFactor)
  assert.equal(parseInt(first[1].options[first[1].correctAnswer], 10), getTableStats([10, 11, null, null, null, null, null, null, 8, 9]).longestCluster)
  assert.equal(first[2].options[first[2].correctAnswer], `${measureSearch(spread, 50).probes} in the spread table and ${measureSearch(clustered, 50).probes} in the clustered table`)
  assert.equal(Number(first[3].options[first[3].correctAnswer]), hashFunction(32, 20))
  assert.equal(Number(second[0].options[second[0].correctAnswer]), getTableStats(buildTable([0, 2, 4], 8)).loadFactor)
  assert.equal(second[1].options[second[1].correctAnswer], `One cluster of length ${getTableStats([0, 1, 2, 3]).longestCluster}`)
})

test('every guided practice calculation is grounded in its actual table and operation', () => {
  assert.ok(LOAD_FACTOR_PRACTICE.length >= 6)
  for (const task of LOAD_FACTOR_PRACTICE) {
    const stats = getTableStats(task.table)
    let expected
    if (task.type === 'load') expected = stats.loadFactor
    if (task.type === 'cluster') expected = stats.longestCluster
    if (task.type === 'search') expected = measureSearch(task.table, task.key).probes
    if (task.type === 'rehash') expected = hashFunction(task.key, task.newCapacity)
    assert.equal(Number(task.options[task.correctAnswer]), expected, task.id)
    assert.ok(task.hints.length >= 2)
    assert.ok(task.explanation.length > 0)
  }
})
