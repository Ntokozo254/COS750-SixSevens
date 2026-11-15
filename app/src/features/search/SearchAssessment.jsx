import KnowledgeCheck from '../learning/KnowledgeCheck'
import { SEARCH_CONCEPT_GUIDANCE, SEARCH_QUESTION_SETS } from './searchQuestions'

const refresher = [
  'A 10-slot table holds 12, 22, and 32 at slots 2, 3, and 4. Slot 5 is truly empty.',
  'To find 32, calculate 32 mod 10 = 2. Inspect slots 2 and 3, then find the key at slot 4.',
  'To find 42, begin at slot 2 and follow the same path. Empty slot 5 ends the search with an absent result.',
  'Continue past a deleted marker. If every slot is occupied or deleted, finish after one complete traversal.',
]

const searchTopic = {
  id: 5,
  title: 'Searching in Hash Tables',
  assessmentTitle: 'Can you trace the search?',
  questionSets: SEARCH_QUESTION_SETS,
  concepts: SEARCH_CONCEPT_GUIDANCE,
  refresher,
  masteryMessage:
    'Explain why a deleted marker keeps the search going and a truly empty slot lets it stop.',
}

export default function SearchAssessment(props) {
  return <KnowledgeCheck topic={searchTopic} {...props} />
}
