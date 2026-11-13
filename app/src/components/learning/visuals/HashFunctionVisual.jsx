import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import Button from "./Button"

const N = 10 // table size
const KEYS = [47, 83, 21] // they land in slots 7, 3 and 1

const spring = { type: "spring", stiffness: 260, damping: 24 }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const IDLE = `Press Play to hash three keys into a table of ${N} slots.`
const DONE = "Each key went straight to its slot. The same rule always gives the same answer."

export default function HashFunctionVisual() {
  const [count, setCount] = useState(0) // keys fully placed before the current one
  const [stage, setStage] = useState(0) // 0 key, 1 plug in, 2 result, 3 placed
  const [phase, setPhase] = useState("idle") // idle | run | done
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(IDLE)

  // Each play gets an id. If it changes (or on unmount), the old run stops.
  const runRef = useRef(0)
  useEffect(() => () => { runRef.current = -1 }, [])

  const play = async () => {
    if (busy) return
    const id = ++runRef.current
    const stale = () => runRef.current !== id

    setBusy(true)
    if (phase !== "idle") {
      // Replay: clear the previous run first
      setCount(0)
      setStage(0)
      setPhase("idle")
      setMessage(IDLE)
      await sleep(450)
      if (stale()) return
    }

    setPhase("run")
    for (let i = 0; i < KEYS.length; i++) {
      const k = KEYS[i]
      const slot = k % N

      setCount(i)
      setStage(0)
      setMessage(`Take the key ${k}.`)
      await sleep(800)
      if (stale()) return

      setStage(1)
      setMessage(`Plug it into the rule: h(${k}) = ${k} mod ${N}.`)
      await sleep(1000)
      if (stale()) return

      setStage(2)
      setMessage(`${k} divided by ${N} leaves a remainder of ${slot}, so the slot is ${slot}.`)
      await sleep(1000)
      if (stale()) return

      setStage(3)
      setMessage(`${k} goes into slot ${slot}.`)
      await sleep(900)
      if (stale()) return
    }

    setCount(KEYS.length)
    setPhase("done")
    setMessage(DONE)
    setBusy(false)
  }

  const current = phase === "run" ? KEYS[count] : null
  const slot = current === null ? -1 : current % N
  const placed =
    phase === "done" ? KEYS : phase === "run" ? KEYS.slice(0, stage === 3 ? count + 1 : count) : []

  const slotStyle = (i) => {
    if (i === slot && stage === 2) return "bg-amber-300/20 ring-2 ring-amber-300"
    if (i === slot && stage === 3) return "bg-emerald-400/30 ring-2 ring-emerald-400"
    return "bg-blue-700/40"
  }

  return (
    <div className="select-none">
      {/* The rule, with a colour for each part */}
      <div className="rounded-xl bg-blue-700/40 px-4 py-3 text-center">
        <p className="font-mono text-lg font-bold text-white">
          h(<span className="text-amber-300">k</span>) = <span className="text-amber-300">k</span> mod{" "}
          <span className="text-blue-200">N</span>
        </p>
        <p className="mt-1 text-xs text-blue-100">
          <span className="text-amber-300">k</span> is the key,{" "}
          <span className="text-blue-200">N</span> is the table size ({N})
        </p>
      </div>

      {/* The worked example builds up one piece at a time */}
      <div className="mt-4 flex min-h-12 flex-wrap items-center justify-center gap-x-2 font-mono text-lg font-bold text-white">
        {current !== null ? (
          <>
            <motion.span key={count} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              h(<span className="text-amber-300">{current}</span>)
            </motion.span>
            {stage >= 1 && (
              <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                = <span className="text-amber-300">{current}</span> mod{" "}
                <span className="text-blue-200">{N}</span>
              </motion.span>
            )}
            {stage >= 2 && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-300"
              >
                = {slot}
              </motion.span>
            )}
          </>
        ) : (
          <span className="text-sm font-normal text-blue-200">
            {phase === "done" ? "h(k) = k mod N" : "h(k) = ?"}
          </span>
        )}
      </div>

      {/* The table */}
      <div className="mt-3 grid grid-cols-10 gap-1">
        {Array.from({ length: N }, (_, i) => {
          const key = placed.find((k) => k % N === i)
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(i)}`}
              >
                {key !== undefined && (
                  <motion.div
                    initial={{ y: -70, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={spring}
                    className="absolute inset-0.5 z-10 flex items-center justify-center rounded bg-white text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/40"
                  >
                    {key}
                  </motion.div>
                )}
              </div>
              <span className={`text-[10px] ${i === slot ? "font-bold text-white" : "text-blue-100"}`}>
                [{i}]
              </span>
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="mt-3 min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

      {/* data-no-swipe stops the carousel from swiping when you press the button */}
      <div data-no-swipe className="mt-2 flex justify-center">
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