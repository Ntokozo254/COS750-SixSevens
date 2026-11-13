import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "./Button"

const SIZE = 10
const STORED_KEY = "john_doe"
const NEW_KEY = "jane_roe"
const STORED_HASH = 4829103
const NEW_HASH = 7351873 // made up, chosen so it also lands in slot 3
const SLOT = STORED_HASH % SIZE // 3 (and NEW_HASH % SIZE is 3 too)
const NEXT = (SLOT + 1) % SIZE // 4, the slot linear probing tries next

const spring = { type: "spring", stiffness: 260, damping: 24 }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const IDLE = `Slot ${SLOT} already holds ${STORED_KEY}. Press Play to insert a second key.`
const ARRIVE = `Insert ${NEW_KEY}: hash = ${NEW_HASH}, and ${NEW_HASH} % ${SIZE} = ${SLOT}.`
const COLLIDE = `Collision! Slot ${SLOT} is already taken by ${STORED_KEY}.`

// Each beat is [stage, message, pause in ms]
const BEATS = {
  chaining: [
    [0, ARRIVE, 1800],
    [1, COLLIDE, 1800],
    [2, `Separate chaining: bucket ${SLOT} holds a small list, so ${NEW_KEY} is appended to it.`, 0],
  ],
  probing: [
    [0, ARRIVE, 1800],
    [1, COLLIDE, 1800],
    [2, `Linear probing: try the next slot, (${SLOT} + 1) % ${SIZE} = ${NEXT}. It is empty.`, 1800],
    [3, `${NEW_KEY} is stored in slot ${NEXT}. A lookup repeats the same formula to find it.`, 0],
  ],
}

const MODES = [
  { id: "chaining", label: "Separate chaining" },
  { id: "probing", label: "Probing" },
]

function TwoLine({ text }) {
  const [a, b] = text.split("_")
  return (
    <>
      {a}_<br />
      {b}
    </>
  )
}

// The new key. It keeps the same layoutId wherever it is rendered, so it glides between places.
function NewKey() {
  return (
    <motion.div
      layoutId="new-key"
      layout="position"
      transition={spring}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full w-full items-center justify-center rounded bg-amber-300 text-center text-[9px] font-bold leading-[1.1] text-blue-900 shadow-lg shadow-blue-950/40"
    >
      <TwoLine text={NEW_KEY} />
    </motion.div>
  )
}

export default function CollisionVisual() {
  const [mode, setMode] = useState("chaining")
  const [stage, setStage] = useState(-1) // -1 = nothing inserted yet
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(IDLE)

  // Each play gets an id. If it changes (mode switch or unmount), the old run stops.
  const runRef = useRef(0)
  useEffect(() => () => { runRef.current = -1 }, [])

  const chooseMode = (m) => {
    if (busy) return
    runRef.current += 1
    setMode(m)
    setStage(-1)
    setMessage(IDLE)
  }

  const play = async () => {
    if (busy) return
    const id = ++runRef.current
    const stale = () => runRef.current !== id

    setBusy(true)
    if (stage !== -1) {
      // Replay: clear the previous run first
      setStage(-1)
      setMessage(IDLE)
      await sleep(450)
      if (stale()) return
    }
    for (const [s, text, pause] of BEATS[mode]) {
      setStage(s)
      setMessage(text)
      await sleep(pause)
      if (stale()) return
    }
    setBusy(false)
  }

  const chaining = mode === "chaining"
  const probing = mode === "probing"

  // Where is the new key right now?
  const inArrival = stage >= 0 && (chaining ? stage < 2 : stage < 3)
  const inChain = chaining && stage >= 2
  const inProbeSlot = probing && stage >= 3

  const slotStyle = (i) => {
    if (i === SLOT && stage === 1) return "bg-red-400/40 ring-2 ring-red-400"
    if (i === SLOT && inChain) return "bg-emerald-400/20 ring-2 ring-emerald-400"
    if (i === NEXT && probing && stage === 2) return "bg-amber-300/20 ring-2 ring-amber-300"
    if (i === NEXT && inProbeSlot) return "bg-emerald-400/30 ring-2 ring-emerald-400"
    return "bg-blue-700/40"
  }

  return (
    <div className="select-none">
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: SIZE }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {/* Arrival area: the new key waits here, above its hashed slot */}
            <div className="aspect-square w-full">{i === SLOT && inArrival && <NewKey />}</div>

            {/* The slot */}
            <div
              className={`relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(i)}`}
            >
              {i === SLOT && (
                <motion.div
                  animate={stage === 1 ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0.5 z-10 flex items-center justify-center rounded bg-white text-center text-[9px] font-bold leading-[1.1] text-blue-700 shadow-lg shadow-blue-950/40"
                >
                  <TwoLine text={STORED_KEY} />
                </motion.div>
              )}
              {i === NEXT && inProbeSlot && (
                <div className="absolute inset-0.5 z-10">
                  <NewKey />
                </div>
              )}
            </div>

            <span className="text-[10px] text-blue-100">[{i}]</span>

            {/* Chain area: in separate chaining, colliding keys hang below the bucket */}
            <div className="flex min-h-14 w-full flex-col items-center">
              {i === SLOT && inChain && (
                <>
                  <div className="h-2 w-px bg-white/70" />
                  <div className="aspect-square w-full">
                    <NewKey />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="mt-2 min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

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
          {stage === -1 ? "Play" : busy ? "Playing..." : "Replay"}
        </Button>
      </div>
    </div>
  )
}