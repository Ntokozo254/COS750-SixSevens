import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import AnimationControls from "../AnimationControls";

const KEY = "john_doe"
const HASH_CODE = 4829103
const SIZE = 10
const SLOT = HASH_CODE % SIZE // 3
const TOTAL_STEPS =4;


// How long each stage lasts (ms). After the last one, it loops back to the start.
const DURATIONS = [1700, 1700, 1700, 2800]

const spring = { type: "spring", stiffness: 300, damping: 24 }

const captions = [
  "Start with the key.",
  "Step 1: the hash function turns the key into a large integer.",
  `Step 2: ${HASH_CODE} % ${SIZE} = ${SLOT}, which fits inside the array.`,
  `${KEY} is stored in slot ${SLOT}.`,
]

const [first, last] = KEY.split("_")

function Arrow({ show }) {
  return (
    <motion.span
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      className="lesson-visual-pointer flex h-9 items-center text-lg"
    >
      →
    </motion.span>
  )
}

function Step({ show, label, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-1"
    >
      {children}
      <span className="lesson-visual-index text-[10px] uppercase tracking-wide">{label}</span>
    </motion.div>
  )
}

function FnBox({ active, children }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.1 : 1 }}
      transition={spring}
      className={`lesson-visual-slot flex h-9 items-center rounded-lg px-3 font-mono text-xs font-bold transition-colors duration-300 ${
        active
          ? "lesson-visual-slot--occupied"
          : ""
      }`}
    >
      {children}
    </motion.div>
  )
}

function Chip({ className, children }) {
  return (
    <div
      className={`lesson-visual-tag flex h-9 items-center rounded-full px-3 font-mono text-xs font-bold ${className}`}
    >
      {children}
    </div>
  )
}

export default function HashingExampleVisual() {
 const [stage, setStage] = useState(0)
const [playing, setPlaying] = useState(false) // set to false if you want it to start paused



 const goNext = () => {
    setStage((current) =>
      Math.min(current + 1, TOTAL_STEPS - 1)
    );
  };
  const goPrevious = () => {
    setStage((current) =>
      Math.max(current - 1, 0)
    );
  };
const goPrev = () => {
  setPlaying(false)
  setStage((s) => (s - 1 + DURATIONS.length) % DURATIONS.length)
}

  return (
    <div
      className="lesson-visual select-none"
      role="img"
      aria-label={`${KEY} is hashed to ${HASH_CODE}, then ${HASH_CODE} mod ${SIZE} gives slot ${SLOT}`}
    >
      {/* The pipeline: key -> hash() -> hash code -> % 10 -> index */}
      <div className="flex flex-wrap items-start justify-center gap-x-1.5 gap-y-3">
        <Step show label="key">
          <Chip className="lesson-visual-slot--occupied">{KEY}</Chip>
        </Step>
        <Arrow show={stage >= 1} />
        <Step show={stage >= 1} label="step 1">
          <FnBox active={stage === 1}>hash()</FnBox>
        </Step>
        <Arrow show={stage >= 1} />
        <Step show={stage >= 1} label="hash code">
          <Chip className="lesson-visual-slot--current">{HASH_CODE}</Chip>
        </Step>
        <Arrow show={stage >= 2} />
        <Step show={stage >= 2} label="step 2">
          <FnBox active={stage === 2}>% {SIZE}</FnBox>
        </Step>
        <Arrow show={stage >= 2} />
        <Step show={stage >= 2} label="index">
          <Chip className="lesson-visual-slot--found">{SLOT}</Chip>
        </Step>
      </div>

      {/* The array */}
      <div className="mt-7 grid grid-cols-10 gap-1">
        {Array.from({ length: SIZE }, (_, i) => {
          const isTarget = i === SLOT
          const lit = isTarget && stage >= 2
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`lesson-visual-slot relative aspect-square w-full rounded-md transition-all duration-300 ${
                  lit ? "lesson-visual-slot--found" : ""
                }`}
              >
                <AnimatePresence>
                  {isTarget && stage === 3 && (
                    <motion.div
                      initial={{ y: -90, opacity: 0, scale: 0.7 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={spring}
                      className="lesson-visual-slot lesson-visual-slot--occupied absolute inset-0.5 z-10 flex items-center justify-center rounded text-center text-[9px] font-bold leading-[1.1]"
                    >
                      {first}_<br />
                      {last}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={`lesson-visual-index text-[10px] ${lit ? "font-bold" : ""}`}>
                [{i}]
              </span>
            </div>
          )
        })}
      </div>

      {/* One-line caption that changes with each stage */}
      <div className="lesson-visual-caption mt-4 min-h-10 text-center text-sm">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {captions[stage]}
          </motion.p>
        </AnimatePresence>
      </div>
      {/* data-no-swipe stops the carousel from swiping when you press these */}
{/* Animation navigation */}
<AnimationControls
  step={stage}
  totalSteps={TOTAL_STEPS}
  onPrevious={goPrevious}
  onNext={goNext}
/>
    </div>
  )
}
