import KnowledgeCheck from '../learning/KnowledgeCheck'
import { PROBING_TOPIC } from './probingTopic'

export default function ProbingCheck({
  completed = false,
  onComplete,
  onReview,
  active = true,
}) {
  return (
    <KnowledgeCheck
      topic={PROBING_TOPIC}
      completed={completed}
      onComplete={onComplete}
      onReview={onReview}
      active={active}
    />
  )
}
