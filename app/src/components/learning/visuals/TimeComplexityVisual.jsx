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
  idle: "bg-white text-blue-700",
  visited: "bg-white/35 text-blue-100",
  checking: "bg-yelllow text-blue-900",
  found: "bg-emerald-400 text-white",
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
    <div className="select-none">
      {/* What we are looking up, and the running count of comparisons */}
      <div className="flex items-center justify-between text-xs text-blue-100">
        <span className="flex items-center gap-2">
          Lookup
          <span className="rounded-full bg-yelllow px-2.5 py-1 font-mono font-bold text-blue-900">
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
        <Button
          size="sm"
          disabled={busy}
          onClick={play}
          className="min-w-28 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {phase === "idle" ? "Play" : busy ? "Playing..." : "Replay"}
        </Button>
      </div>
    </div>
  )
}