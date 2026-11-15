import test from 'node:test'
import assert from 'node:assert/strict'
import { hashFunction } from '../../logic/hashing.js'
import { calculateHashExample, MAX_HASH_KEY, MAX_HASH_TABLE_SIZE } from './hashFunctionsLogic.js'
import { HASH_FUNCTIONS_TOPIC, HASH_PRACTICE_CASES } from './hashFunctionsData.js'

test('worked examples distinguish the quotient from the remainder and include zero', () => {
  const cases = [
    { key: 23, size: 10, quotient: 2, remainder: 3 },
    { key: 42, size: 7, quotient: 6, remainder: 0 },
    { key: 37, size: 8, quotient: 4, remainder: 5 },
    { key: 0, size: 20, quotient: 0, remainder: 0 },
    { key: MAX_HASH_KEY, size: 20, quotient: 50_000, remainder: 0 },
    { key: 19, size: 20, quotient: 0, remainder: 19 },
  ]

  for (const { key, size, quotient, remainder } of cases) {
    const calculation = calculateHashExample(key, size)
    assert.equal(calculation.quotient, quotient)
    assert.equal(calculation.remainder, remainder)
    assert.equal(calculation.homeIndex, remainder)
    assert.equal(calculation.steps.length, 4)
  }
})

test('every supported table size gives an in-range home and a valid division reconstruction', () => {
  for (let size = 1; size <= MAX_HASH_TABLE_SIZE; size += 1) {
    for (const key of [0, 1, 23, 37, 42, 99, MAX_HASH_KEY]) {
      const calculation = calculateHashExample(key, size)
      assert.equal(key, calculation.quotient * size + calculation.remainder)
      assert.ok(calculation.remainder >= 0 && calculation.remainder < size)
      assert.equal(calculation.homeIndex, hashFunction(key, size))
    }
  }
})

test('identical inputs repeat while a changed table size can change the home slot', () => {
  assert.deepEqual(calculateHashExample(23, 10), calculateHashExample(23, 10))
  assert.equal(calculateHashExample(23, 10).homeIndex, 3)
  assert.equal(calculateHashExample(23, 7).homeIndex, 2)
  assert.equal(calculateHashExample(12, 10).homeIndex, calculateHashExample(22, 10).homeIndex)
})

test('invalid keys and capacities are rejected before a misleading calculation is shown', () => {
  for (const key of [-1, MAX_HASH_KEY + 1, 1.5, NaN, Infinity, '23', null, true]) {
    assert.throws(() => calculateHashExample(key, 10), RangeError)
  }
  for (const size of [-1, 0, MAX_HASH_TABLE_SIZE + 1, 1.5, NaN, Infinity, '10', null]) {
    assert.throws(() => calculateHashExample(23, size), RangeError)
  }
})

test('practice examples are distinct, valid, and include the three requested seed cases', () => {
  const signatures = HASH_PRACTICE_CASES.map(({ key, tableSize }) => `${key}/${tableSize}`)
  assert.equal(new Set(signatures).size, HASH_PRACTICE_CASES.length)
  assert.deepEqual(signatures.slice(0, 3), ['23/10', '42/7', '37/8'])

  for (const { key, tableSize } of HASH_PRACTICE_CASES) {
    const calculation = calculateHashExample(key, tableSize)
    assert.ok(calculation.homeIndex >= 0 && calculation.homeIndex < tableSize)
  }
})

test('each independent LO2 assessment set covers all five concepts with unique keys', () => {
  const ids = []
  const concepts = Object.keys(HASH_FUNCTIONS_TOPIC.concepts).sort()
  assert.equal(HASH_FUNCTIONS_TOPIC.id, 2)
  assert.equal(HASH_FUNCTIONS_TOPIC.outcomes.length, 4)
  assert.ok(HASH_FUNCTIONS_TOPIC.questionSets.length >= 2)

  for (const questions of HASH_FUNCTIONS_TOPIC.questionSets) {
    assert.equal(questions.length, 5)
    assert.deepEqual(questions.map((question) => question.concept).sort(), concepts)

    for (const question of questions) {
      assert.equal(question.objective, 'LO2')
      assert.ok(Number.isInteger(question.correctAnswer))
      assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.options.length)
      assert.ok(question.explanation.length > 0)
      ids.push(question.id)

      if (question.calculation) {
        const { key, tableSize } = question.calculation
        assert.equal(Number(question.options[question.correctAnswer]), calculateHashExample(key, tableSize).homeIndex)
      }
    }
  }

  assert.equal(new Set(ids).size, ids.length)
})

test('boundary, collision, and lookup question examples agree with the shared hash function', () => {
  const [first, second] = HASH_FUNCTIONS_TOPIC.questionSets
  const firstRangeQuestion = first.find((question) => question.concept === 'range')
  assert.equal(firstRangeQuestion.options[firstRangeQuestion.correctAnswer], '0 through 7')
  for (const key of [0, 7, 8, 23, MAX_HASH_KEY]) {
    assert.ok(hashFunction(key, 8) >= 0 && hashFunction(key, 8) <= 7)
    assert.equal(hashFunction(key, 1), 0)
  }
  const secondRangeQuestion = second.find((question) => question.concept === 'range')
  assert.equal(secondRangeQuestion.options[secondRangeQuestion.correctAnswer], '0')
  assert.equal(hashFunction(12, 10), 2)
  assert.equal(hashFunction(22, 10), 2)
  assert.equal(hashFunction(37, 8), 5)
  const lookup = second.find((question) => question.concept === 'home-slot')
  assert.equal(lookup.options[lookup.correctAnswer], `Slot ${hashFunction(37, 8)}`)
})
