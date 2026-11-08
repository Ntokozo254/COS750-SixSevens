import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import StepControls from "@/components/shared/StepControls"
import { useAutoAdvance } from "@/components/shared/useAutoAdvance"

const SIZE = 8
const N = 6
const TARGET = "k6"

// Each inner array is one bucket's chain
const LAYOUTS = {
  average: [["k1"], [], ["k2"], ["k3", "k4"], [], ["k5"], ["k6"], []],
  worst: [[], [], [], [], [], ["k1", "k2", "k3", "k4", "k5", "k6"], [], []],
}

const MODES = [
  { id: "average", label: "Average case" },
  { id: "worst", label: "Worst case" },
]

// The table from your slide
const ROWS = [
  { op: "Insert", average: "O(1)", worst: "O(n)", note: "(all keys collide)" },
  { op: "Lookup", average: "O(1)", worst: "O(n)" },
  { op: "Delete", average: "O(1)", worst: "O(n)" },
  { op: "Space", average: "O(n)", worst: "O(n)" },
]

const IDLE = {
  average: `Average case: ${N} keys spread across ${SIZE} buckets.`,
  worst: `Worst case: all ${N} keys collided into a single bucket.`,
}

const nodeStyles = {
  idle: "bg-white text-blue-700",
  visited: "bg-white/35 text-blue-100",
  checking: "bg-amber-300 text-blue-900",
  found: "bg-emerald-400 text-white",
}

const spring = { type: "spring", stiffness: 260, damping: 24 }

// Every step of one lookup. `pause` is how long autoplay waits before the next step.
function buildSteps(mode) {
  const buckets = LAYOUTS[mode]
  const targetBucket = buckets.findIndex((c) => c.includes(TARGET))
  const chain = buckets[targetBucket]
  const targetPos = chain.indexOf(TARGET)

  // Step 0 is the untouched table. Its pause is the short gap before a replay starts.
  const steps = [{ phase: "idle", cursor: -1, comparisons: 0, pause: 450, message: null }]

  // Hash the key and jump to its bucket
  steps.push({
    phase: "hash", cursor: -1, comparisons: 0, pause: 1600,
    message:
      `Lookup ${TARGET}: hash(${TARGET}) % ${SIZE} = ${targetBucket}.` +
      (mode === "average"
        ? ` Jump straight to bucket ${targetBucket}.`
        : ` Every key collided here, so bucket ${targetBucket} holds one long chain.`),
  })

  // Walk the chain, comparing one node at a time
  for (let i = 0; i <= targetPos; i++) {
    steps.push({
      phase: "walk", cursor: i, comparisons: i + 1, pause: i === targetPos ? 900 : 700,
      message: i === targetPos ? `${chain[i]} is ${TARGET}: found!` : `${chain[i]} is not ${TARGET}. Move to the next node.`,
    })
  }

  // The verdict
  const c = targetPos + 1
  steps.push({
    phase: "done", cursor: targetPos, comparisons: c, pause: 0,
    message:
      mode === "average"
        ? `Found after ${c} comparison. The work does not depend on how many keys are stored: O(1).`
        : `Found after ${c} comparisons. We walked the whole chain, so the work grows with n: O(n).`,
  })
  return { steps, targetBucket, targetPos }
}

const RUNS = { average: buildSteps("average"), worst: buildSteps("worst") }

// stepped: students press Prev / Next instead of watching it autoplay
export default function TimeComplexityVisual({ stepped = false }) {
  const [mode, setMode] = useState("average")
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  const { steps, targetBucket, targetPos } = RUNS[mode]
  const last = steps.length - 1
  const auto = !stepped && playing
  useAutoAdvance(auto, step, last, steps[step].pause, setStep)

  const busy = auto && step < last
  const { phase, cursor, comparisons } = steps[step]
  const message =
    steps[step].message ??
    `${IDLE[mode]} Press ${stepped ? "Next" : "Play"} to look up ${TARGET}.`
  const buckets = LAYOUTS[mode]

  const chooseMode = (m) => {
    if (busy) return
    setMode(m)
    setStep(0)
    setPlaying(false)
  }

  const play = () => {
    if (busy) return
    // From the idle table start straight away. On a replay, show the clean table first.
    setStep(phase === "idle" ? 1 : 0)
    setPlaying(true)
  }

  const nodeStatus = (isTarget, idx) => {
    if (!isTarget) return "idle"
    if (phase === "done") return idx < targetPos ? "visited" : idx === targetPos ? "found" : "idle"
    if (phase === "walk") {
      if (idx < cursor) return "visited"
      if (idx === cursor) return idx === targetPos ? "found" : "checking"
    }
    return "idle"
  }

  return (
    <div className="select-none">
      {/* What we are looking up, and the running count of comparisons */}
      <div className="flex items-center justify-between text-xs text-blue-100">
        <span className="flex items-center gap-2">
          Lookup
          <span className="rounded-full bg-amber-300 px-2.5 py-1 font-mono font-bold text-blue-900">
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
            className="inline-block font-mono text-sm font-bold text-white"
          >
            {comparisons}
          </motion.span>
        </span>
      </div>

      {/* The buckets. Changing the key replays the entrance when the mode changes. */}
      <div key={mode} className="mt-2 flex flex-col gap-0.5 overflow-x-auto p-1">
        {buckets.map((chain, i) => {
          const isTarget = i === targetBucket
          const ring = !isTarget || phase === "idle"
            ? "ring-transparent"
            : phase === "done"
              ? "bg-emerald-400/15 ring-emerald-400"
              : "bg-amber-300/15 ring-amber-300"
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-md px-1 py-0.5 ring-2 transition-all duration-300 ${ring}`}
            >
              <span className="w-6 flex-none text-center text-[10px] text-blue-100">[{i}]</span>
              <div className="flex h-6 w-10 flex-none items-center justify-center rounded bg-blue-700/50 text-[10px]">
                {chain.length ? (
                  <span className="text-white">●</span>
                ) : (
                  <span className="font-mono text-blue-200/70">NULL</span>
                )}
              </div>
              {chain.map((key, idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: i * 0.04 + idx * 0.05 }}
                  className="flex flex-none items-center gap-1"
                >
                  <span className="text-xs text-white/80">→</span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold transition-colors duration-300 ${nodeStyles[nodeStatus(isTarget, idx)]}`}
                  >
                    {key}
                  </span>
                </motion.div>
              ))}
              {chain.length > 0 && (
                <span className="flex-none font-mono text-[10px] text-blue-200/70">→ NULL</span>
              )}
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="mt-2 min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

      {/* The complexity table. The active column is highlighted and Lookup lights up at the end. */}
      <div className="mt-2 overflow-hidden rounded-xl bg-blue-700/40 text-xs">
        <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] uppercase tracking-wide text-blue-100">
          <span>Operation</span>
          <span className={mode === "average" ? "font-bold text-white" : ""}>Average</span>
          <span className={mode === "worst" ? "font-bold text-white" : ""}>Worst case</span>
        </div>
        {ROWS.map((row) => (
          <div
            key={row.op}
            className="grid grid-cols-3 items-center border-t border-white/10 px-3 py-1.5"
          >
            <span className="font-semibold text-white">{row.op}</span>
            {["average", "worst"].map((col) => {
              const active = col === mode
              const hit = row.op === "Lookup" && phase === "done" && active
              return (
                <span
                  key={col}
                  className={`w-fit rounded px-1.5 py-0.5 font-mono transition-colors duration-300 ${
                    hit
                      ? "bg-emerald-400 font-bold text-white"
                      : active
                        ? "bg-white/15 text-white"
                        : "text-blue-100"
                  }`}
                >
                  {row[col]}
                  {col === "worst" && row.note && (
                    <span className="ml-1 font-sans text-[10px] opacity-70">{row.note}</span>
                  )}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      {/* data-no-swipe stops the carousel from swiping when you press these */}
      <div data-no-swipe className="mt-3 flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          {MODES.map((m) => (
            <Button
              key={m.id}
              size="sm"
              disabled={busy}
              onClick={() => chooseMode(m.id)}
              className={
                mode === m.id
                  ? "bg-white text-blue-700 hover:bg-white disabled:opacity-100"
                  : "bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
              }
            >
              {m.label}
            </Button>
          ))}
        </div>
        {stepped ? (
          <StepControls
            step={step}
            total={steps.length}
            onPrev={() => setStep(step - 1)}
            onNext={() => setStep(step + 1)}
          />
        ) : (
          <Button
            size="sm"
            disabled={busy}
            onClick={play}
            className="min-w-28 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {phase === "idle" ? "Play" : busy ? "Playing..." : "Replay"}
          </Button>
        )}
      </div>
    </div>
  )
}