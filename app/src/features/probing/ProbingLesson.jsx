import { useState } from 'react'
import { CheckCircle2, Lightbulb, Target } from 'lucide-react'
import { StepNav, StepOutline } from '../../components/learning/LessonSteps'
import ProbingCheck from './ProbingCheck'
import ProbingLearn from './ProbingLearn'
import ProbingPractice from './ProbingPractice'
import ProbingTrace from './ProbingTrace'

const STEPS = [
  { id: 'learn', title: 'Understand the rule' },
  { id: 'trace', title: 'Watch it insert' },
  { id: 'practice', title: 'Your turn: place keys' },
  { id: 'check', title: 'Knowledge check' },
]

// Module 4 page body. Same frame as the L01 lesson: objective on the left with
// dark ink cards, "In this lesson" outline on the right.
export default function ProbingLesson({ objective, completed = false, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [visited, setVisited] = useState(() => new Set(['learn']))
  const [traced, setTraced] = useState(false)
  const step = STEPS[stepIndex]

  function goTo(index) {
    const next = Math.max(0, Math.min(STEPS.length - 1, index))
    setStepIndex(next)
    setVisited((seen) => new Set(seen).add(STEPS[next].id))
  }
  const goToId = (id) => goTo(STEPS.findIndex((item) => item.id === id))

  return (
    <div className="lesson-layout lesson-scope">
      <section className="lesson-card">
        <div className="lesson-card-header">
          <div>
            <div className="eyebrow">WHAT YOU'LL LEARN</div>
            <h2>Your learning objective</h2>
          </div>
          <span className="pill pill-blue">LO4</span>
        </div>
        <p className="objective-large">{objective}</p>

        {completed && (
          <p
            role="status"
            className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700"
          >
            <CheckCircle2 size={16} /> Knowledge check passed. You can revisit every step.
          </p>
        )}

        <div>
          {step.id === 'learn' && <ProbingLearn onNext={() => goTo(1)} />}
          {step.id === 'trace' && <ProbingTrace onTraced={() => setTraced(true)} />}
          {step.id === 'practice' && <ProbingPractice onContinue={() => goToId('check')} />}
          {step.id === 'check' && (
            <ProbingCheck completed={completed} onComplete={onComplete} onReview={goToId} />
          )}
        </div>

        <StepNav steps={STEPS} index={stepIndex} onSelect={goTo} />
        {step.id === 'trace' && traced && (
          <p className="mt-3 text-center text-[11px] text-slate-500">
            Walkthrough finished. Try placing the keys yourself in step 3.
          </p>
        )}
      </section>

      <aside className="lesson-aside">
        <StepOutline
          steps={STEPS}
          index={stepIndex}
          onSelect={goTo}
          isDone={(item, active) => (item.id === 'check' ? completed : visited.has(item.id) && !active)}
        />

        <div className="side-card">
          <div className="side-card-heading">
            <span className="mini-icon">
              <Target size={17} />
            </span>
            LEARNING CHECKPOINT
          </div>
          <h3>Hash, check, move on.</h3>
          <p>By the end you can place any key in a linear-probing table and explain each move.</p>
          <div className="checkpoint-row">
            <CheckCircle2 size={17} /> Home slot with key mod m
          </div>
          <div className="checkpoint-row">
            <CheckCircle2 size={17} /> Collisions and the next slot
          </div>
          <div className="checkpoint-row">
            <CheckCircle2 size={17} /> Wrap-around and a full table
          </div>
        </div>

        <div className="side-card support-card">
          <Lightbulb size={24} />
          <h3>Go at your own pace.</h3>
          <p>
            Slow the animation down, step back, and use the hints. Answer at least 4 of 5 in the knowledge check to
            complete this module.
          </p>
        </div>
      </aside>
    </div>
  )
}
