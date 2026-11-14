import { SEARCH_QUESTION_SETS } from './searchQuestions.js'
import {
  createCompletionEvidence,
  validateCompletionEvidence,
} from '../learning/assessmentEvidence.js'

export function createSearchCompletionEvidence(questions, answers, completedAt) {
  return createCompletionEvidence(SEARCH_QUESTION_SETS, questions, answers, completedAt)
}

export function validateSearchCompletionEvidence(receipt) {
  return validateCompletionEvidence(SEARCH_QUESTION_SETS, receipt)
}
