import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, ListChecks, Target } from 'lucide-react'
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

  const navButton =
    'grid size-11 flex-none place-items-center rounded-full border-0 bg-white text-blue-700 shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-50 disabled:opacity-40'

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

        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Previous step"
            disabled={stepIndex === 0}
            onClick={() => goTo(stepIndex - 1)}
            className={navButton}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            {STEPS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to step ${index + 1}: ${item.title}`}
                aria-current={index === stepIndex ? 'step' : undefined}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full border-0 p-0 transition-all ${
                  index === stepIndex ? 'w-6 bg-blue-600' : 'w-2 bg-blue-200 hover:bg-blue-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next step"
            disabled={stepIndex === STEPS.length - 1}
            onClick={() => goTo(stepIndex + 1)}
            className={navButton}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {step.id === 'trace' && traced && (
          <p className="mt-3 text-center text-[11px] text-slate-500">
            Walkthrough finished. Try placing the keys yourself in step 3.
          </p>
        )}
      </section>

      <aside className="lesson-aside">
        <div className="side-card">
          <div className="side-card-heading">
            <span className="mini-icon">
              <ListChecks size={17} />
            </span>
            IN THIS LESSON
          </div>
          <h3>
            Step {stepIndex + 1} of {STEPS.length}
          </h3>
          <div className="progress-line">
            <span style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
          <ol className="m-0 grid list-none gap-1 p-0">
            {STEPS.map((item, index) => {
              const active = index === stepIndex
              const done = item.id === 'check' ? completed : visited.has(item.id) && !active
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={active ? 'step' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-xl border border-tan px-2.5 py-2 text-left text-[11px] transition-colors ${
                      active ? 'bg-blue-50 font-bold text-blue-600' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`grid size-5 flex-none place-items-center rounded-md text-[10px] font-extrabold ${
                        active ? 'bg-sky-950 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate">{item.title}</span>
                    {done && <CheckCircle2 size={14} className="text-emerald-500" aria-label="visited" />}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

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
