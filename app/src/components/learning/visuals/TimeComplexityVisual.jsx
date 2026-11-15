import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "./Button"

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
  average: `Average case: ${N} keys spread across ${SIZE} buckets. Press Play to look up ${TARGET}.`,
  worst: `Worst case: all ${N} keys collided into a single bucket. Press Play to look up ${TARGET}.`,
}

const nodeStyles = {
  idle: "lesson-visual-slot--occupied",
  visited: "lesson-visual-slot--visited",
  checking: "lesson-visual-slot--current",
  found: "lesson-visual-slot--found",
}

const spring = { type: "spring", stiffness: 260, damping: 24 }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function TimeComplexityVisual() {
  const [mode, setMode] = useState("average")
  const [phase, setPhase] = useState("idle") // idle | hash | walk | done
  const [cursor, setCursor] = useState(-1) // which node in the chain is being compared
  const [comparisons, setComparisons] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(IDLE.average)

  // Each play gets an id. If it changes (mode switch or unmount), the old run stops.
  const runRef = useRef(0)
  useEffect(() => () => { runRef.current = -1 }, [])

  const buckets = LAYOUTS[mode]
  const targetBucket = buckets.findIndex((c) => c.includes(TARGET))
  const targetPos = buckets[targetBucket].indexOf(TARGET)

  const clear = (m) => {
    setPhase("idle")
    setCursor(-1)
    setComparisons(0)
    setMessage(IDLE[m])
  }

  const chooseMode = (m) => {
    if (busy) return
    runRef.current += 1
    setMode(m)
    clear(m)
  }

  const play = async () => {
    if (busy) return
    const id = ++runRef.current
    const stale = () => runRef.current !== id

    setBusy(true)
    if (phase !== "idle") {
      // Replay: clear the previous run first
      clear(mode)
      await sleep(450)
      if (stale()) return
    }

    // Beat 1: hash the key and jump to its bucket
    setPhase("hash")
    setMessage(
      `Lookup ${TARGET}: hash(${TARGET}) % ${SIZE} = ${targetBucket}.` +
        (mode === "average"
          ? ` Jump straight to bucket ${targetBucket}.`
          : ` Every key collided here, so bucket ${targetBucket} holds one long chain.`)
    )
    await sleep(1600)
    if (stale()) return

    // Beat 2: walk the chain, comparing one node at a time
    setPhase("walk")
    const chain = buckets[targetBucket]
    for (let i = 0; i <= targetPos; i++) {
      setCursor(i)
      setComparisons(i + 1)
      setMessage(
        i === targetPos
          ? `${chain[i]} is ${TARGET}: found!`
          : `${chain[i]} is not ${TARGET}. Move to the next node.`
      )
      await sleep(i === targetPos ? 900 : 700)
      if (stale()) return
    }

    // Beat 3: the verdict
    const c = targetPos + 1
    setPhase("done")
    setMessage(
      mode === "average"
        ? `Found after ${c} comparison. The work does not depend on how many keys are stored: O(1).`
        : `Found after ${c} comparisons. We walked the whole chain, so the work grows with n: O(n).`
    )
    setBusy(false)
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
    <div className="lesson-visual select-none">
      {/* What we are looking up, and the running count of comparisons */}
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

      {/* The buckets. Changing the key replays the entrance when the mode changes. */}
      <div key={mode} className="mt-2 flex flex-col gap-0.5 overflow-x-auto p-1">
        {buckets.map((chain, i) => {
          const isTarget = i === targetBucket
          const ring = !isTarget || phase === "idle"
            ? ""
            : phase === "done"
              ? "lesson-visual-slot--found"
              : "lesson-visual-slot--current"
          return (
            <div
              key={i}
              className={`lesson-visual-slot flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-all duration-300 ${ring}`}
            >
              <span className="lesson-visual-index w-6 flex-none text-center">[{i}]</span>
              <div className="lesson-visual-slot lesson-visual-slot--occupied flex h-6 w-10 flex-none items-center justify-center rounded text-[10px]">
                {chain.length ? (
                  <span className="lesson-visual-pointer">●</span>
                ) : (
                  <span className="lesson-visual-index font-mono">NULL</span>
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
                  <span className="lesson-visual-pointer text-xs">→</span>
                  <span
                    className={`lesson-visual-slot rounded px-2 py-0.5 font-mono text-[11px] font-bold transition-colors duration-300 ${nodeStyles[nodeStatus(isTarget, idx)]}`}
                  >
                    {key}
                  </span>
                </motion.div>
              ))}
              {chain.length > 0 && (
                <span className="lesson-visual-index flex-none font-mono">→ NULL</span>
              )}
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="lesson-visual-caption mt-2 min-h-10 text-center">
        {message}
      </p>

      {/* The complexity table. The active column is highlighted and Lookup lights up at the end. */}
      <div className="lesson-visual-surface mt-2 overflow-hidden rounded-xl text-xs">
        <div className="lesson-visual-index grid grid-cols-3 px-3 py-1.5 uppercase tracking-wide">
          <span>Operation</span>
          <span className={mode === "average" ? "font-bold text-[#245bb6]" : ""}>Average</span>
          <span className={mode === "worst" ? "font-bold text-[#245bb6]" : ""}>Worst case</span>
        </div>
        {ROWS.map((row) => (
          <div
            key={row.op}
            className="grid grid-cols-3 items-center border-t border-[#dce5f3] px-3 py-1.5"
          >
            <span className="font-semibold text-[#233a5c]">{row.op}</span>
            {["average", "worst"].map((col) => {
              const active = col === mode
              const hit = row.op === "Lookup" && phase === "done" && active
              return (
                <span
                  key={col}
                  className={`w-fit rounded px-1.5 py-0.5 font-mono transition-colors duration-300 ${
                    hit
                      ? "lesson-visual-slot lesson-visual-slot--found font-bold"
                      : active
                        ? "lesson-visual-slot lesson-visual-slot--occupied"
                        : "text-[#526985]"
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
              aria-pressed={mode === m.id}
            >
              {m.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={busy}
          onClick={play}
          variant="primary"
          className="min-w-28"
        >
          {phase === "idle" ? "Play" : busy ? "Playing..." : "Replay"}
        </Button>
      </div>
    </div>
  )
}
