import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "./Button"

const KEY = "john_doe"
const HASH_CODE = 4829103
const SIZE = 10
const SLOT = HASH_CODE % SIZE // 3

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
      className="flex h-9 items-center text-lg text-white/80"
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
      <span className="text-[10px] uppercase tracking-wide text-blue-100">{label}</span>
    </motion.div>
  )
}

function FnBox({ active, children }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.1 : 1 }}
      transition={spring}
      className={`flex h-9 items-center rounded-lg border-2 px-3 font-mono text-xs font-bold transition-colors duration-300 ${
        active
          ? "border-white bg-white text-blue-700 shadow-lg shadow-blue-950/40"
          : "border-white/50 bg-blue-700/50 text-white"
      }`}
    >
      {children}
    </motion.div>
  )
}

function Chip({ className, children }) {
  return (
    <div
      className={`flex h-9 items-center rounded-full px-3 font-mono text-xs font-bold shadow-lg shadow-blue-950/40 ${className}`}
    >
      {children}
    </div>
  )
}

export default function HashingExampleVisual() {
 const [stage, setStage] = useState(0)
const [playing, setPlaying] = useState(true) // set to false if you want it to start paused

useEffect(() => {
  if (!playing) return
  const t = setTimeout(() => setStage((s) => (s + 1) % DURATIONS.length), DURATIONS[stage])
  return () => clearTimeout(t)
}, [stage, playing])

const goNext = () => {
  setPlaying(false)
  setStage((s) => (s + 1) % DURATIONS.length)
}
const goPrev = () => {
  setPlaying(false)
  setStage((s) => (s - 1 + DURATIONS.length) % DURATIONS.length)
}

  return (
    <div
      className="select-none"
      role="img"
      aria-label={`${KEY} is hashed to ${HASH_CODE}, then ${HASH_CODE} mod ${SIZE} gives slot ${SLOT}`}
    >
      {/* The pipeline: key -> hash() -> hash code -> % 10 -> index */}
      <div className="flex flex-wrap items-start justify-center gap-x-1.5 gap-y-3">
        <Step show label="key">
          <Chip className="bg-white text-blue-700">{KEY}</Chip>
        </Step>
        <Arrow show={stage >= 1} />
        <Step show={stage >= 1} label="step 1">
          <FnBox active={stage === 1}>hash()</FnBox>
        </Step>
        <Arrow show={stage >= 1} />
        <Step show={stage >= 1} label="hash code">
          <Chip className="bg-amber-300 text-blue-900">{HASH_CODE}</Chip>
        </Step>
        <Arrow show={stage >= 2} />
        <Step show={stage >= 2} label="step 2">
          <FnBox active={stage === 2}>% {SIZE}</FnBox>
        </Step>
        <Arrow show={stage >= 2} />
        <Step show={stage >= 2} label="index">
          <Chip className="bg-emerald-400 text-white">{SLOT}</Chip>
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
                className={`relative aspect-square w-full rounded-md transition-all duration-300 ${
                  lit ? "bg-emerald-400/30 ring-2 ring-emerald-400" : "bg-blue-700/40"
                }`}
              >
                <AnimatePresence>
                  {isTarget && stage === 3 && (
                    <motion.div
                      initial={{ y: -90, opacity: 0, scale: 0.7 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={spring}
                      className="absolute inset-0.5 z-10 flex items-center justify-center rounded bg-white text-center text-[9px] font-bold leading-[1.1] text-blue-700 shadow-lg shadow-blue-950/40"
                    >
                      {first}_<br />
                      {last}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={`text-[10px] ${lit ? "font-bold text-white" : "text-blue-100"}`}>
                [{i}]
              </span>
            </div>
          )
        })}
      </div>

      {/* One-line caption that changes with each stage */}
      <div className="mt-4 min-h-10 text-center text-sm text-blue-100">
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
<div data-no-swipe className="mt-3 flex items-center justify-center gap-2">
  <Button size="sm" onClick={goPrev} className="bg-blue-700 text-white hover:bg-blue-800">
    Previous
  </Button>
  <Button
    size="sm"
    onClick={() => setPlaying((p) => !p)}
    className="min-w-20 bg-white text-blue-700 hover:bg-blue-50"
  >
    {playing ? "Pause" : "Play"}
  </Button>
  <Button size="sm" onClick={goNext} className="bg-blue-700 text-white hover:bg-blue-800">
    Step
  </Button>
  <span className="ml-1 text-xs text-blue-100">
    {stage + 1} / {DURATIONS.length}
  </span>
</div>
    </div>
  )
}