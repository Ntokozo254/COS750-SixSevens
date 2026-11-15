import { HASH_FUNCTIONS_TOPIC } from '../hash-functions/hashFunctionsData.js'
import { COLLISIONS_TOPIC } from '../collisions/collisionsData.js'
import { LOAD_FACTOR_TOPIC } from '../load-factor/loadFactorData.js'
import { PROBING_TOPIC } from '../probing/probingTopic.js'
import { validateCompletionEvidence } from './assessmentEvidence.js'

export const ASSESSMENT_TOPICS = [HASH_FUNCTIONS_TOPIC, COLLISIONS_TOPIC, PROBING_TOPIC, LOAD_FACTOR_TOPIC]

export function getAssessmentTopic(moduleId) {
  return ASSESSMENT_TOPICS.find((topic) => topic.id === moduleId)
}

export function validateTopicCompletionEvidence(moduleId, receipt) {
  const topic = getAssessmentTopic(moduleId)
  return topic ? validateCompletionEvidence(topic.questionSets, receipt, moduleId) : null
}
