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
    if (i === slot && stage === 2) return "lesson-visual-slot--current"
    if (i === slot && stage === 3) return "lesson-visual-slot--found"
    return ""
  }

  return (
    <div className="lesson-visual select-none">
      {/* The rule, with a colour for each part */}
      <div className="lesson-visual-rule rounded-xl px-4 py-3 text-center">
        <p className="lesson-visual-formula font-mono text-lg font-bold">
          h(<span className="text-[#98651d]">k</span>) = <span className="text-[#98651d]">k</span> mod{" "}
          <span className="text-[#2563eb]">N</span>
        </p>
        <p className="lesson-visual-caption mt-1 text-xs">
          <span className="text-[#98651d]">k</span> is the key,{" "}
          <span className="text-[#2563eb]">N</span> is the table size ({N})
        </p>
      </div>

      {/* The worked example builds up one piece at a time */}
      <div className="lesson-visual-formula mt-4 flex min-h-12 flex-wrap items-center justify-center gap-x-2 font-mono text-lg font-bold">
        {current !== null ? (
          <>
            <motion.span key={count} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              h(<span className="text-[#98651d]">{current}</span>)
            </motion.span>
            {stage >= 1 && (
              <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                = <span className="text-[#98651d]">{current}</span> mod{" "}
                <span className="text-[#2563eb]">{N}</span>
              </motion.span>
            )}
            {stage >= 2 && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#21674e]"
              >
                = {slot}
              </motion.span>
            )}
          </>
        ) : (
          <span className="lesson-visual-caption text-sm font-normal">
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
                className={`lesson-visual-slot relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(i)}`}
              >
                {key !== undefined && (
                  <motion.div
                    initial={{ y: -70, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={spring}
                    className="lesson-visual-slot lesson-visual-slot--occupied absolute inset-0.5 z-10 flex items-center justify-center rounded text-sm font-bold"
                  >
                    {key}
                  </motion.div>
                )}
              </div>
              <span className={`lesson-visual-index text-[10px] ${i === slot ? "font-bold" : ""}`}>
                [{i}]
              </span>
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="lesson-visual-caption mt-3 min-h-10 text-center text-sm">
        {message}
      </p>

      {/* data-no-swipe stops the carousel from swiping when you press the button */}
      <div data-no-swipe className="mt-2 flex justify-center">
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
