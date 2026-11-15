
import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "./Button"
import AnimationControls from "../AnimationControls"

const SIZE = 8
const N = 6
const TARGET = "k6"

// Each inner array is one bucket's chain.
const LAYOUTS = {
  average: [["k1"], [], ["k2"], ["k3", "k4"], [], ["k5"], ["k6"], []],
  worst: [[], [], [], [], [], ["k1", "k2", "k3", "k4", "k5", "k6"], [], []],
}

const MODES = [
  { id: "average", label: "Average case" },
  { id: "worst", label: "Worst case" },
]

// The table from your slide.
const ROWS = [
  { op: "Insert", average: "O(1)", worst: "O(n)", note: "(all keys collide)" },
  { op: "Lookup", average: "O(1)", worst: "O(n)" },
  { op: "Delete", average: "O(1)", worst: "O(n)" },
  { op: "Space", average: "O(n)", worst: "O(n)" },
]

const IDLE = {
  average: `Average case: ${N} keys spread across ${SIZE} buckets. Look up ${TARGET}.`,
  worst: `Worst case: all ${N} keys collided into a single bucket. Look up ${TARGET}.`,
}

const nodeStyles = {
  idle: "lesson-visual-slot--occupied",
  visited: "lesson-visual-slot--visited",
  checking: "lesson-visual-slot--current",
  found: "lesson-visual-slot--found",
}

const spring = { type: "spring", stiffness: 260, damping: 24 }

export default function TimeComplexityVisual() {
  const [mode, setMode] = useState("average")
  const [step, setStep] = useState(0)

  const buckets = LAYOUTS[mode]

  const targetBucket = buckets.findIndex((chain) =>
    chain.includes(TARGET)
  )

  const targetPos = buckets[targetBucket].indexOf(TARGET)
  const chain = buckets[targetBucket]

  // Initial state + hash calculation + one step per comparison.
  const totalSteps = targetPos + 3

  const isIdle = step === 0
  const isHashing = step === 1
  const isWalking = step >= 2 && step < totalSteps - 1
  const isComplete = step === totalSteps - 1

  // Cursor identifies the node currently being compared.
  const cursor = isWalking
    ? step - 2
    : isComplete
      ? targetPos
      : -1

  const comparisons = isIdle || isHashing
    ? 0
    : isComplete
      ? targetPos + 1
      : cursor + 1

  const message = (() => {
    if (isIdle) {
      return IDLE[mode]
    }

    if (isHashing) {
      return (
        `Lookup ${TARGET}: hash(${TARGET}) % ${SIZE} = ${targetBucket}.` +
        (mode === "average"
          ? ` Jump straight to bucket ${targetBucket}.`
          : ` Every key collided here, so bucket ${targetBucket} holds one long chain.`)
      )
    }

    if (isWalking) {
      return chain[cursor] === TARGET
        ? `${chain[cursor]} is ${TARGET}: found!`
        : `${chain[cursor]} is not ${TARGET}. Move to the next node.`
    }

    return mode === "average"
      ? `Found after ${comparisons} comparison. The work does not depend on how many keys are stored: O(1).`
      : `Found after ${comparisons} comparisons. We walked the whole chain, so the work grows with n: O(n).`
  })()

  const chooseMode = (newMode) => {
    setMode(newMode)
    setStep(0)
  }

  const previousStep = () => {
    setStep((previous) => Math.max(0, previous - 1))
  }

  const nextStep = () => {
    setStep((previous) => Math.min(totalSteps - 1, previous + 1))
  }

  const nodeStatus = (isTarget, index) => {
    if (!isTarget) return "idle"

    if (isComplete) {
      return index < targetPos
        ? "visited"
        : index === targetPos
          ? "found"
          : "idle"
    }

    if (isWalking) {
      if (index < cursor) return "visited"

      if (index === cursor) {
        return index === targetPos ? "found" : "checking"
      }
    }

    return "idle"
  }

  return (
    <div className="lesson-visual select-none">
      {/* What we are looking up and the comparison count */}
      <div className="lesson-visual-caption flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          Lookup
          <span className="lesson-visual-slot lesson-visual-slot--current rounded-full px-2.5 py-1 font-mono font-bold">
            {TARGET}
          </span>
        </span>

        <span>
          Comparisons:{" "}
          <motion.span
            key={comparisons}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={spring}
            className="lesson-visual-formula inline-block font-mono text-sm font-bold"
          >
            {comparisons}
          </motion.span>
        </span>
      </div>

      {/* Hash table buckets */}
      <div
        key={mode}
        className="mt-2 flex flex-col gap-0.5 overflow-x-auto p-1"
      >
        {buckets.map((bucketChain, i) => {
          const isTargetBucket = i === targetBucket

          const ring = !isTargetBucket || isIdle
            ? ""
            : isComplete
              ? "lesson-visual-slot--found"
              : "lesson-visual-slot--current"

          return (
            <div
              key={i}
              className={`lesson-visual-slot flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-all duration-300 ${ring}`}
            >
              <span className="lesson-visual-index w-6 flex-none text-center">
                [{i}]
              </span>

              {/* Bucket pointer */}
              <div className="lesson-visual-slot lesson-visual-slot--occupied flex h-6 w-10 flex-none items-center justify-center rounded text-[10px]">
                {bucketChain.length ? (
                  <span className="lesson-visual-pointer">●</span>
                ) : (
                  <span className="lesson-visual-index font-mono">
                    NULL
                  </span>
                )}
              </div>

              {/* Nodes in the chain */}
              {bucketChain.map((key, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    ...spring,
                    delay: i * 0.04 + index * 0.05,
                  }}
                  className="flex flex-none items-center gap-1"
                >
                  <span className="lesson-visual-pointer text-xs">
                    →
                  </span>

                  <span
                    className={`lesson-visual-slot rounded px-2 py-0.5 font-mono text-[11px] font-bold transition-colors duration-300 ${nodeStyles[
                      nodeStatus(isTargetBucket, index)
                    ]}`}
                  >
                    {key}
                  </span>
                </motion.div>
              ))}

              {bucketChain.length > 0 && (
                <span className="lesson-visual-index flex-none font-mono">
                  → NULL
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Current explanation */}
      <p
        aria-live="polite"
        className="lesson-visual-caption mt-2 min-h-10 text-center"
      >
        {message}
      </p>

      {/* Complexity table */}
      <div className="lesson-visual-surface mt-2 overflow-hidden rounded-xl text-xs">
        <div className="lesson-visual-index grid grid-cols-3 px-3 py-1.5 uppercase tracking-wide">
          <span>Operation</span>

          <span
            className={
              mode === "average"
                ? "font-bold text-[#245bb6]"
                : ""
            }
          >
            Average
          </span>

          <span
            className={
              mode === "worst"
                ? "font-bold text-[#245bb6]"
                : ""
            }
          >
            Worst case
          </span>
        </div>

        {ROWS.map((row) => (
          <div
            key={row.op}
            className="grid grid-cols-3 items-center border-t border-[#dce5f3] px-3 py-1.5"
          >
            <span className="font-semibold text-[#233a5c]">
              {row.op}
            </span>

            {["average", "worst"].map((column) => {
              const active = column === mode

              const hit =
                row.op === "Lookup" &&
                isComplete &&
                active

              return (
                <span
                  key={column}
                  className={`w-fit rounded px-1.5 py-0.5 font-mono transition-colors duration-300 ${
                    hit
                      ? "lesson-visual-slot lesson-visual-slot--found font-bold"
                      : active
                        ? "lesson-visual-slot lesson-visual-slot--occupied"
                        : "text-[#526985]"
                  }`}
                >
                  {row[column]}

                  {column === "worst" && row.note && (
                    <span className="ml-1 font-sans text-[10px] opacity-70">
                      {row.note}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      {/* Mode selection */}
      <div data-no-swipe className="mt-3 flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          {MODES.map((item) => (
            <Button
              key={item.id}
              size="sm"
              onClick={() => chooseMode(item.id)}
              aria-pressed={mode === item.id}
              variant={mode === item.id ? "primary" : "secondary"}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Shared animation controls */}
      <AnimationControls
        step={step}
        totalSteps={totalSteps}
        onPrevious={previousStep}
        onNext={nextStep}
      />
    </div>
  )
}
