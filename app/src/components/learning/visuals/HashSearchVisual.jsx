
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "./Button"
import AnimationControls from "../AnimationControls"

const KEY = "john_doe"
const HASH_CODE = 4829103
const SIZE = 10
const SLOT = HASH_CODE % SIZE

const ENTRIES = {
  1: "mary_k",
  3: KEY,
  5: "sam_li",
  6: "zara_m",
  8: "tom_b",
}

const spring = { type: "spring", stiffness: 300, damping: 24 }

const IDLE = "Choose a search method to see how a hash table locates an entry."

const FOUND = `Jump straight to slot [${SLOT}]: found ${KEY}. One step, no scanning.`

// Each entry represents one manually controlled animation step.
const KEY_STEPS = [
  {
    stage: 1,
    message: `Search by key: we know the key '${KEY}' but not where it lives.`,
  },
  {
    stage: 2,
    message: `Hash it: hash('${KEY}') = ${HASH_CODE}.`,
  },
  {
    stage: 3,
    message: `${HASH_CODE} % ${SIZE} = ${SLOT}, so the key must be in slot ${SLOT}.`,
  },
  {
    stage: 4,
    message: FOUND,
  },
]

const INDEX_STEPS = [
  {
    stage: 1,
    message: `Search by index: we already know the index is ${SLOT}, so there is nothing to hash.`,
  },
  {
    stage: 4,
    message: FOUND,
  },
]

function Arrow({ level }) {
  return (
    <motion.span
      initial={false}
      animate={{ opacity: level }}
      className="lesson-visual-pointer flex h-9 items-center text-lg"
    >
      →
    </motion.span>
  )
}

function Step({ level, label, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: level, y: level === 1 ? 0 : 4 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-1"
    >
      {children}
      <span className="lesson-visual-index text-[10px] uppercase tracking-wide">
        {label}
      </span>
    </motion.div>
  )
}

function FnBox({ active, skipped, children }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.1 : 1 }}
      transition={spring}
      className={`lesson-visual-slot flex h-9 items-center rounded-lg px-3 font-mono text-xs font-bold transition-colors duration-300 ${
        active ? "lesson-visual-slot--occupied" : ""
      } ${skipped ? "line-through" : ""}`}
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

export default function HashSearchVisual() {
  const [mode, setMode] = useState(null)
  const [step, setStep] = useState(0)

  const steps =
    mode === "key"
      ? KEY_STEPS
      : mode === "index"
        ? INDEX_STEPS
        : []

  const totalSteps = steps.length

  // Derive the current visual stage from the selected mode and step.
  const stage = mode ? steps[step].stage : 0

  const message = mode ? steps[step].message : IDLE

  const keyMode = mode === "key"
  const indexMode = mode === "index"
  const found = stage === 4

  const locked =
    (keyMode && stage === 3) ||
    (indexMode && stage === 1)

  const lvl = (on) => (on ? 1 : 0.8)
  const skippedLvl = indexMode ? 0.85 : 0.8

  const startSearch = (selectedMode) => {
    setMode(selectedMode)
    setStep(0)
  }

  const previousStep = () => {
    setStep((current) => Math.max(0, current - 1))
  }

  const nextStep = () => {
    setStep((current) => Math.min(totalSteps - 1, current + 1))
  }

  const reset = () => {
    setMode(null)
    setStep(0)
  }

  return (
    <div className="lesson-visual select-none">

      {/* Lookup pipeline: key -> hash() -> hash code -> % 10 -> index */}
      <div className="flex flex-wrap items-start justify-center gap-x-1.5 gap-y-3">
        <Step level={lvl(keyMode && stage >= 1)} label="key">
          <Chip className="lesson-visual-slot--occupied">
            {KEY}
          </Chip>
        </Step>

        <Arrow level={lvl(keyMode && stage >= 2)} />

        <Step
          level={keyMode && stage >= 2 ? 1 : skippedLvl}
          label="step 1"
        >
          <FnBox
            active={keyMode && stage === 2}
            skipped={indexMode}
          >
            hash()
          </FnBox>
        </Step>

        <Arrow level={lvl(keyMode && stage >= 2)} />

        <Step level={lvl(keyMode && stage >= 2)} label="hash code">
          <Chip className="lesson-visual-slot--current">
            {HASH_CODE}
          </Chip>
        </Step>

        <Arrow level={lvl(keyMode && stage >= 3)} />

        <Step
          level={keyMode && stage >= 3 ? 1 : skippedLvl}
          label="step 2"
        >
          <FnBox
            active={keyMode && stage === 3}
            skipped={indexMode}
          >
            % {SIZE}
          </FnBox>
        </Step>

        <Arrow
          level={lvl(
            (keyMode && stage >= 3) ||
            (indexMode && stage >= 1)
          )}
        />

        <Step
          level={lvl(
            (keyMode && stage >= 3) ||
            (indexMode && stage >= 1)
          )}
          label="index"
        >
          <Chip className="lesson-visual-slot--found">
            {SLOT}
          </Chip>
        </Step>
      </div>

      {/* Populated hash table */}
      <div className="mt-6 grid grid-cols-5 gap-2">
        {Array.from({ length: SIZE }, (_, i) => {
          const entry = ENTRIES[i]
          const hit = found && i === SLOT

          return (
            <motion.div
              key={i}
              animate={{
                scale: hit ? 1.1 : 1,
                opacity: found && !hit ? 0.7 : 1,
              }}
              transition={spring}
              className={`lesson-visual-slot relative flex h-14 flex-col items-center justify-center rounded-lg px-1 transition-colors duration-300 ${
                hit
                  ? "lesson-visual-slot--found"
                  : entry
                    ? "lesson-visual-slot--occupied"
                    : ""
              } ${
                locked && i === SLOT
                  ? "lesson-visual-slot--current"
                  : ""
              }`}
            >
              <span className="absolute left-1.5 top-1 text-[10px] opacity-70">
                [{i}]
              </span>

              <span
                className={`mt-2 font-mono text-[11px] sm:text-xs ${
                  entry ? "font-bold" : "font-normal opacity-60"
                }`}
              >
                {entry ?? "—"}
              </span>

              <AnimatePresence>
                {hit && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring}
                    className="lesson-visual-slot lesson-visual-slot--found absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Explanation */}
      <div
        aria-live="polite"
        className="lesson-visual-caption mt-4 min-h-10 text-center text-sm"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Search selection */}
      <div
        data-no-swipe
        className="mt-3 flex flex-wrap items-center justify-center gap-2"
      >
        <Button
          size="sm"
          onClick={() => startSearch("key")}
        >
          Search by key: {KEY}
        </Button>

        <Button
          size="sm"
          onClick={() => startSearch("index")}
        >
          Search by index: {SLOT}
        </Button>

        <Button
          size="sm"
          onClick={reset}
          variant="primary"
        >
          Reset
        </Button>
      </div>

      {/* Manual animation controls */}
      {mode && (
        <AnimationControls
          step={step}
          totalSteps={totalSteps}
          onPrevious={previousStep}
          onNext={nextStep}
        />
      )}
    </div>
  )
}
