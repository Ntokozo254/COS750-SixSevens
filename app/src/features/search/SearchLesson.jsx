import { useState } from 'react'
import { CheckCircle2, Lightbulb, Target } from 'lucide-react'
import LearningContent from '../../components/learning/LearningContent'
import { StepNav, StepOutline } from '../../components/learning/LessonSteps'
import SearchAssessment from './SearchAssessment'
import SearchExplorer, { SearchTable } from './SearchExplorer'
import SearchPractice from './SearchPractice'
import SearchWarmup from './SearchWarmup'
import { SEARCH_EXAMPLES } from './searchExamples'
import './search.css'

const STEPS = [
  { id: 'learn', title: 'Understand the search' },
  { id: 'explore', title: 'Trace a search' },
  { id: 'practice', title: 'Guided practice' },
  { id: 'check', title: 'Knowledge check' },
]

// Module 5 page body. Same frame as Module 4: objective and dark ink stage on the
// left, "In this lesson" outline on the right, prev/next dots underneath.
export default function SearchLesson({ objective, completed = false, onComplete }) {
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
    <div className="lesson-layout lesson-scope hash-search-module">
      <section className="lesson-card">
        <div className="lesson-card-header">
          <div>
            <div className="eyebrow">WHAT YOU'LL LEARN</div>
            <h2>Your learning objective</h2>
          </div>
          <span className="pill pill-blue">LO5</span>
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

        <div className="hash-search-stage" role="region" aria-label={`Step ${stepIndex + 1}: ${step.title}`}>
          {step.id === 'learn' && (
            <>
              <div className="hash-search-section-heading">
                <div>
                  <span className="eyebrow">STEP 1 OF 4 · UNDERSTAND</span>
                  <h2>Start where the key was stored.</h2>
                </div>
              </div>
              <p>
                A hash table stores entries in array slots. A key identifies the entry you want. In
                this lesson, keys are whole numbers and the hash function uses the remainder after
                division.
              </p>
              <div className="hash-search-context">
                <h3>Find a student record from its number.</h3>
                <p>
                  Imagine looking up a student record by number. Two numbers can map to the same
                  home slot, creating a collision. Your search needs to follow the same path used to
                  store the entry so it reaches the right record.
                </p>
              </div>
              <div className="hash-search-outcomes">
                <h3>By the end, you can</h3>
                <ul>
                  <li>Calculate a key’s home slot using the modulo hash function.</li>
                  <li>Trace a probe sequence through collisions and wrap-around.</li>
                  <li>
                    Explain when a matching key, empty slot, tombstone, or full circuit ends or
                    continues the search.
                  </li>
                  <li>Explain the conditions for expected O(1) search and the O(m) worst case.</li>
                </ul>
              </div>
              <SearchWarmup />
              <ol className="hash-search-procedure">
                <li>
                  <strong>Calculate the home slot.</strong>
                  <p>
                    Use the same hash function as insertion. With m slots, our example calculates
                    key mod m. Slot indices begin at 0.
                  </p>
                </li>
                <li>
                  <strong>Read the slot.</strong>
                  <p>
                    A matching key ends the search successfully. A different key means a collision
                    may have moved the target further along the probe sequence.
                  </p>
                </li>
                <li>
                  <strong>Continue or stop.</strong>
                  <p>
                    Linear probing checks (index + 1) mod m, wrapping to slot 0 after the last slot.
                    Stop at a match, a never-used empty slot, or after inspecting all m slots.
                  </p>
                </li>
              </ol>
              <SearchTable table={SEARCH_EXAMPLES[0].table} />
              <LearningContent
                title="A worked search for 32"
                content="In this 10-slot table, 32 mod 10 = 2. Slot 2 contains 12, slot 3 contains 22, and slot 4 contains 32. The search follows 2 → 3 → 4 and succeeds after three slot inspections."
              />
              <LearningContent
                title="When the key is missing"
                content="Searching for 42 starts at slot 2 and follows 2 → 3 → 4 → 5. Slot 5 is empty, so the search ends there. Insertion would have used that empty slot before placing 42 further along this probe sequence."
              />
              <div className="hash-search-support-note">
                <Lightbulb size={20} />
                <div>
                  <strong>Deleted slots keep the path open.</strong>
                  <p>
                    A tombstone marks a deleted entry. Search continues past it because another key
                    may have been displaced beyond that position. If every slot is occupied or
                    deleted, inspect at most m slots.
                  </p>
                </div>
              </div>
              <LearningContent
                title="How much work does searching take?"
                content="With well-distributed hashes and controlled occupancy, search takes expected O(1) time. A worst-case search can inspect all m slots, giving O(m) probe cost. When table capacity m grows in proportion to the number n of entries, this is also O(n). Deleted markers can lengthen probe sequences."
              />
              <p className="hash-search-note">
                O(1) means constant work. O(m) means the number of inspected slots can grow with the
                table’s capacity. Recorded animation snapshots add copying work to this teaching
                display.
              </p>
              <div className="hash-search-actions">
                <span />
                <button type="button" className="hash-search-go" onClick={() => goToId('explore')}>
                  Trace an example →
                </button>
              </div>
            </>
          )}
          {step.id === 'explore' && (
            <>
              <div className="hash-search-section-heading">
                <div>
                  <span className="eyebrow">STEP 2 OF 4 · TRACE A SEARCH</span>
                  <h2>Follow every comparison until the search stops.</h2>
                </div>
              </div>
              <SearchExplorer onTraced={() => setTraced(true)} />
              <div className="hash-search-actions">
                <span>
                  {traced
                    ? 'Walkthrough explored. Try making the decisions yourself.'
                    : 'Use the controls to follow each comparison.'}
                </span>
                <button type="button" className="hash-search-go" onClick={() => goToId('practice')}>
                  Try guided practice →
                </button>
              </div>
            </>
          )}
          {step.id === 'practice' && <SearchPractice onContinue={() => goToId('check')} />}
          {/* Kept mounted so answers survive switching steps */}
          <div hidden={step.id !== 'check'}>
            <SearchAssessment
              completed={completed}
              onComplete={onComplete}
              onReview={goToId}
              active={step.id === 'check'}
            />
          </div>
        </div>

        <StepNav steps={STEPS} index={stepIndex} onSelect={goTo} />
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
          <h3>Follow the path. Explain the ending.</h3>
          <p>
            By the end you can calculate the starting slot, trace each probe, and explain why a
            search succeeds or stops.
          </p>
          <div className="checkpoint-row">
            <CheckCircle2 size={17} /> Found and missing keys
          </div>
          <div className="checkpoint-row">
            <CheckCircle2 size={17} /> Collisions and wrap-around
          </div>
          <div className="checkpoint-row">
            <CheckCircle2 size={17} /> Empty slots and tombstones
          </div>
        </div>

        <div className="side-card support-card">
          <Lightbulb size={24} />
          <h3>Go at your own pace.</h3>
          <p>
            Replay examples, predict the next slot, and use the hints. Answer at least 4 of 5 in the
            knowledge check to complete this module.
          </p>
        </div>
      </aside>
    </div>
  )
}
