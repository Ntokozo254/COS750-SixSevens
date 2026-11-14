import TopicLesson from '../learning/TopicLesson'
import ProbingPractice from './ProbingPractice'
import ProbingTrace from './ProbingTrace'
import { PROBING_TOPIC } from './probingTopic'
import './probing.css'

export default function ProbingLesson({ completed = false, onComplete, preferences }) {
  return (
    <div className="hash-probing-module">
      <TopicLesson
        topic={PROBING_TOPIC}
        Explorer={ProbingTrace}
        Practice={ProbingPractice}
        completed={completed}
        onComplete={onComplete}
        preferences={preferences}
      />
    </div>
  )
}
