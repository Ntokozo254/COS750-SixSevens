import { useId, useState } from 'react'
import { CheckCircle2, Lightbulb, Target } from 'lucide-react'
import FeedbackPanel from '../../components/learning/FeedbackPanel'
import ScaffoldingPanel from '../../components/assessment/ScaffoldingPanel'
import KnowledgeCheck from './KnowledgeCheck'
import '../search/search.css'
import './topics.css'

const activities = [
  { id: 'learn', title: 'Understand' },
  { id: 'explore', title: 'Explore an example' },
  { id: 'practice', title: 'Guided practice' },
  { id: 'check', title: 'Knowledge check' },
]

function TopicWarmup({ check }) {
  const instanceId = useId()
  const [selected, setSelected] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const correct = selected === check.correctAnswer

  function choose(index) {
    setSelected(index)
    if (index !== check.correctAnswer) setMistakes((count) => count + 1)
  }

  return (
    <section className="hash-search-warmup" aria-labelledby={`${instanceId}-title`}>
      <span className="eyebrow">QUICK REFRESHER</span>
      <h3 id={`${instanceId}-title`}>{check.question}</h3>
      <p>Try this optional check before the worked example. You can change your answer.</p>
      <div
        className="hash-search-warmup-options"
        role="group"
        aria-labelledby={`${instanceId}-title`}
      >
        {check.options.map((option, index) => (
          <button
            type="button"
            key={option}
            className="secondary-button"
            aria-pressed={selected === index}
            onClick={() => choose(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div role="status">
          <FeedbackPanel
            correct={correct}
            message={
              correct
                ? 'Correct. Use that idea in the next example.'
                : 'Use the reminder, then try again.'
            }
            explanation={correct ? check.explanation : undefined}
          />
          {!correct && (
            <ScaffoldingPanel
              title="Work through the idea"
              hints={check.hints.slice(0, Math.min(mistakes, check.hints.length))}
            />
          )}
        </div>
      )}
    </section>
  )
}

export default function TopicLesson({
  topic,
  Explorer,
  Practice,
  completed = false,
  onComplete,
  preferences = {},
}) {
  const instanceId = useId()
  const [activity, setActivity] = useState(() => {
    if (preferences.preferredMode === 'visual') return 'explore'
    if (preferences.preferredMode === 'kinesthetic') return 'practice'
    return 'learn'
  })

  return (
    <section
      className="hash-search-module hash-topic-module"
      data-topic-id={topic.id}
      aria-label={`${topic.title} learning activities`}
    >
      <nav className="hash-search-activities" aria-label={`${topic.title} activities`}>
        {activities.map((item) => (
          <button
            type="button"
            key={item.id}
            id={`${instanceId}-${item.id}`}
            aria-current={activity === item.id ? 'step' : undefined}
            onClick={() => setActivity(item.id)}
          >
            {item.title}
          </button>
        ))}
      </nav>
      {completed && (
        <div className="hash-search-complete" role="status">
          <CheckCircle2 size={18} />
          <span>Knowledge check passed. You can revisit every activity.</span>
        </div>
      )}
      <div className="hash-search-layout">
        <div
          className="lesson-card hash-search-content"
          role="region"
          aria-labelledby={`${instanceId}-${activity}`}
        >
          <div hidden={activity !== 'learn'}>
            <div className="hash-search-section-heading">
              <div>
                <span className="eyebrow">START WITH THE IDEA</span>
                <h2>{topic.title}</h2>
              </div>
              <span className="pill pill-blue">LO{topic.id}</span>
            </div>
            <p className="hash-topic-introduction">{topic.introduction}</p>
            <div className="hash-search-context">
              <h3>Put it into context</h3>
              <p>{topic.scenario}</p>
            </div>
            <div className="hash-search-outcomes">
              <h3>By the end, you can</h3>
              <ul>
                {topic.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
            <TopicWarmup check={topic.warmup} />
            {topic.sections.map((section) => (
              <section key={section.title} className="lesson-section">
                <h2>{section.title}</h2>
                <p>{section.content}</p>
                {section.example && (
                  <div className="hash-topic-worked-example">
                    <strong>Worked example</strong>
                    <p>{section.example}</p>
                  </div>
                )}
              </section>
            ))}
            <div className="hash-search-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setActivity('explore')}
              >
                Explore a worked example →
              </button>
            </div>
          </div>
          <div hidden={activity !== 'explore'}>
            <Explorer preferences={preferences} active={activity === 'explore'} />
            <div className="hash-search-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setActivity('practice')}
              >
                Try guided practice →
              </button>
            </div>
          </div>
          <div hidden={activity !== 'practice'}>
            <Practice preferences={preferences} />
            <div className="hash-search-actions">
              <button type="button" className="primary-button" onClick={() => setActivity('check')}>
                Check my understanding →
              </button>
            </div>
          </div>
          <div hidden={activity !== 'check'}>
            <KnowledgeCheck
              topic={topic}
              completed={completed}
              onComplete={onComplete}
              active={activity === 'check'}
              onReview={setActivity}
            />
          </div>
        </div>
        <aside className="lesson-aside hash-search-aside">
          <div className="side-card">
            <div className="side-card-heading">
              <span className="mini-icon">
                <Target size={17} />
              </span>
              LEARNING CHECKPOINT
            </div>
            <h3>Explain it, then apply it.</h3>
            <p>
              Observe the worked example, make the next decision yourself, then check your
              understanding. Answer at least 4 of the 5 knowledge-check questions correctly to
              complete this module.
            </p>
          </div>
          <div className="side-card support-card">
            <Lightbulb size={24} />
            <h3>Choose how you study.</h3>
            <p>
              Use diagrams, written explanations, and hands-on practice together. You can move
              between activities at any time. Optional Read aloud, reading size, and display
              preferences are available in Settings.
            </p>
            <p className="hash-search-mastery-note">
              Mistakes reveal hints. Retry with new examples when you are ready.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
