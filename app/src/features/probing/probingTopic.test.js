import assert from 'node:assert/strict'
import test from 'node:test'
import { PROBING_TOPIC } from './probingTopic.js'
import { PROBING_CONCEPTS, PROBING_QUESTION_SETS } from './probingQuestions.js'
import { createCompletionEvidence, validateCompletionEvidence } from '../learning/assessmentEvidence.js'
import { buildInsertTrace } from './probingLogic.js'

test('the novice learning flow aligns outcomes, a prerequisite prediction, and two independent assessments', () => {
  assert.equal(PROBING_TOPIC.id, 4)
  assert.equal(PROBING_TOPIC.questionSets, PROBING_QUESTION_SETS)
  assert.equal(PROBING_TOPIC.questionSets.length, 2)
  assert.ok(PROBING_TOPIC.scenario.includes('student-record'))
  assert.ok(PROBING_TOPIC.outcomes.length >= 4)
  assert.equal(PROBING_TOPIC.warmup.options[PROBING_TOPIC.warmup.correctAnswer], 'Slot 3')
  const ids = new Set()
  for (const questions of PROBING_TOPIC.questionSets) {
    assert.equal(questions.length, 5)
    assert.deepEqual(new Set(questions.map(q => q.concept)), new Set(Object.keys(PROBING_CONCEPTS)))
    for (const question of questions) {
      assert.ok(!ids.has(question.id))
      ids.add(question.id)
      const guidance = PROBING_TOPIC.concepts[question.concept]
      assert.ok(guidance.hints.length >= 2)
      assert.ok(['learn', 'explore', 'practice'].includes(guidance.review))
    }
  }
})

test('all assessment sets require five checked answers and four correct for module4 evidence', () => {
  for (const questions of PROBING_TOPIC.questionSets) {
    const answers = questions.map(q => q.correctAnswer)
    answers[0] = (answers[0] + 1) % questions[0].options.length
    const receipt = createCompletionEvidence(PROBING_TOPIC.questionSets, questions, answers, undefined, 4)
    assert.ok(receipt)
    assert.deepEqual(validateCompletionEvidence(PROBING_TOPIC.questionSets, receipt, 4), receipt)
    assert.equal(validateCompletionEvidence(PROBING_TOPIC.questionSets, receipt, 3), null)
    assert.equal(createCompletionEvidence(PROBING_TOPIC.questionSets, questions, answers.slice(0, 4), undefined, 4), null)
    answers[1] = (answers[1] + 1) % questions[1].options.length
    assert.equal(createCompletionEvidence(PROBING_TOPIC.questionSets, questions, answers, undefined, 4), null)
    assert.equal(validateCompletionEvidence(PROBING_TOPIC.questionSets, { ...receipt, answers, passed: true, score: 100 }, 4), null)
  }
})

test('the authored worked and wrap-around examples match the shared insertion trace', () => {
  const worked = buildInsertTrace([12, 22, 32, 9, 19], 10).at(-1).table
  assert.deepEqual(worked, [19, null, 12, 22, 32, null, null, null, null, 9])
  const wrap = buildInsertTrace([6, 13, 20], 7).at(-1).table
  assert.deepEqual(wrap, [13, 20, null, null, null, null, 6])
})
