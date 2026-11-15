import test from 'node:test'
import assert from 'node:assert/strict'
import { getLearningPreference } from './learningCheckIn.js'

test('returns the most frequently selected approach', () => {
  assert.equal(getLearningPreference(['visual', 'aural', 'visual', 'read-write']), 'visual')
})

test('suggests a multimodal approach when preferences are tied', () => {
  assert.equal(getLearningPreference(['visual', 'aural', 'read-write', 'kinesthetic']), 'multimodal')
})

test('ignores unknown answers and uses multimodal when there are no valid answers', () => {
  assert.equal(getLearningPreference(['unknown']), 'multimodal')
})