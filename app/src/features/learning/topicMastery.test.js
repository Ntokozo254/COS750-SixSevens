import test from 'node:test'
import assert from 'node:assert/strict'
import { ASSESSMENT_TOPICS, validateTopicCompletionEvidence } from './topicRegistry.js'
import { createCompletionEvidence } from './assessmentEvidence.js'
import { sanitizeProgress } from '../../logic/progress.js'

const allowedIds = [1, 2, 3, 4, 5, 6]
const completedAt = '2026-11-14T00:30:00.000Z'

function evidenceFor(topic, correctCount = 5) {
  const questions = topic.questionSets[0]
  const answers = questions.map((question, index) =>
    index < correctCount
      ? question.correctAnswer
      : (question.correctAnswer + 1) % question.options.length,
  )
  return createCompletionEvidence(topic.questionSets, questions, answers, completedAt, topic.id)
}

test('all topic assessments require a complete checked passing set', () => {
  assert.deepEqual(
    ASSESSMENT_TOPICS.map((topic) => topic.id),
    [2, 3, 4, 6],
  )
  for (const topic of ASSESSMENT_TOPICS) {
    assert.ok(validateTopicCompletionEvidence(topic.id, evidenceFor(topic, 4)))
    assert.equal(evidenceFor(topic, 3), null)
    assert.equal(
      createCompletionEvidence(
        topic.questionSets,
        topic.questionSets[0],
        [0, 0, 0, 0],
        completedAt,
        topic.id,
      ),
      null,
    )
    assert.equal(validateTopicCompletionEvidence(topic.id, { passed: true, score: 100 }), null)
  }
})

test('a receipt from another module or question set cannot complete a topic', () => {
  for (const topic of ASSESSMENT_TOPICS) {
    const receipt = evidenceFor(topic)
    for (const other of ASSESSMENT_TOPICS.filter((item) => item.id !== topic.id)) {
      assert.equal(validateTopicCompletionEvidence(other.id, receipt), null)
      assert.equal(
        validateTopicCompletionEvidence(other.id, { ...receipt, moduleId: other.id }),
        null,
      )
    }
    assert.equal(
      validateTopicCompletionEvidence(topic.id, {
        ...receipt,
        questionIds: receipt.questionIds.slice().reverse(),
      }),
      null,
    )
    assert.equal(
      validateTopicCompletionEvidence(topic.id, { ...receipt, assessmentVersion: 0 }),
      null,
    )
  }
})

test('legacy manual completion is removed for newly assessed modules', () => {
  assert.deepEqual(sanitizeProgress([1, 2, 3, 4, 6], allowedIds).completed, [1])
  assert.deepEqual(
    sanitizeProgress({ version: 2, completed: [1, 2, 3, 4, 6], searchAssessment: null }, allowedIds)
      .completed,
    [1],
  )
})

test('validated topic results persist together and remain independently graded', () => {
  const receipts = Object.fromEntries(
    ASSESSMENT_TOPICS.map((topic) => [topic.id, evidenceFor(topic, 4)]),
  )
  const saved = {
    version: 2,
    completed: [1, 2, 3, 4, 6],
    searchAssessment: null,
    moduleAssessments: receipts,
  }
  assert.deepEqual(sanitizeProgress(JSON.parse(JSON.stringify(saved)), allowedIds), saved)
  const corrupt = structuredClone(saved)
  corrupt.moduleAssessments[3].answers[0] = -1
  const restored = sanitizeProgress(corrupt, allowedIds)
  assert.deepEqual(restored.completed, [1, 2, 4, 6])
  assert.equal(restored.moduleAssessments[3], undefined)
  restored.moduleAssessments[2].answers[0] = 99
  assert.notEqual(saved.moduleAssessments[2].answers[0], 99)
})
