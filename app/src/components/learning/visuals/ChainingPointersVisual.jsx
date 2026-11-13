import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "./Button"

const SIZE = 5

// Made-up hash codes. Order matters: the 3rd, 4th and 5th inserts collide.
const INSERTS = [
  { key: "john_doe", hash: 4829103 }, // bucket 3
  { key: "mary_k", hash: 2210041 }, // bucket 1
  { key: "jane_roe", hash: 7351873 }, // bucket 3 (collision)
  { key: "sam_li", hash: 6094118 }, // bucket 3 (collision)
  { key: "ann_p", hash: 9042316 }, // bucket 1 (collision)
]

const spring = { type: "spring", stiffness: 260, damping: 24 }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const IDLE = `${SIZE} buckets, all empty, so every pointer is NULL. Press Play to insert some keys.`
const DONE = "Done. Each bucket points to the head of its chain, and empty buckets point to NULL."

export default function ChainingPointersVisual() {
  const [count, setCount] = useState(0) // how many keys are fully inserted
  const [phase, setPhase] = useState("idle") // idle | hash | insert | done
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
      setPhase("idle")
      setMessage(IDLE)
      await sleep(550)
      if (stale()) return
    }

    const sizes = Array(SIZE).fill(0) // chain lengths so far, to word the messages
    for (let i = 0; i < INSERTS.length; i++) {
      const { key, hash } = INSERTS[i]
      const b = hash % SIZE
      const occupied = sizes[b] > 0

      // Beat 1: hash the key and look at its bucket
      setCount(i)
      setPhase("hash")
      setMessage(
        occupied ? `Collision! Bucket ${b} already has a chain.` : `Bucket ${b} is empty (NULL).`
      )
      await sleep(1600)
      if (stale()) return

      // Beat 2: add the node
      setPhase("insert")
      setMessage(
        occupied
          ? `Walk to the end of the chain and append ${key}. The chain grows by one node.`
          : `${key} becomes the head of a new chain. Bucket ${b}'s pointer now points to it.`
      )
      sizes[b] += 1
      await sleep(1800)
      if (stale()) return
    }

    setCount(INSERTS.length)
    setPhase("done")
    setMessage(DONE)
    setBusy(false)
  }

  // Build the chains from the keys inserted so far
  const shown = INSERTS.slice(0, phase === "insert" ? count + 1 : count)
  const chains = Array.from({ length: SIZE }, () => [])
  shown.forEach((k) => chains[k.hash % SIZE].push(k))

  const current = phase === "hash" || phase === "insert" ? INSERTS[count] : null
  const currentBucket = current ? current.hash % SIZE : -1
  const wasOccupied = current
    ? INSERTS.slice(0, count).some((k) => k.hash % SIZE === currentBucket)
    : false

  const rowStyle = (i) => {
    if (i !== currentBucket) return "ring-transparent"
    if (phase === "hash") {
      return wasOccupied ? "bg-red-400/20 ring-red-400" : "bg-amber-300/15 ring-amber-300"
    }
    return "bg-emerald-400/15 ring-emerald-400"
  }

  return (
    <div className="select-none">
      {/* What is being inserted right now */}
      <div className="flex min-h-9 flex-wrap items-center justify-center gap-2 text-xs text-blue-100">
        {current ? (
          <>
            <span className="rounded-full bg-amber-300 px-2.5 py-1 font-mono font-bold text-blue-900">
              {current.key}
            </span>
            <span className="font-mono">
              hash {current.hash} → % {SIZE} = {currentBucket}
            </span>
          </>
        ) : (
          <span>Hash table with {SIZE} buckets</span>
        )}
      </div>

      {/* One row per bucket: [index] [head pointer] → node → node → NULL */}
      <div className="mt-2 flex flex-col gap-1.5 overflow-x-auto p-1">
        {chains.map((chain, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 ring-2 transition-all duration-300 ${rowStyle(i)}`}
          >
            <span className="w-7 flex-none text-center text-xs text-blue-100">[{i}]</span>

            {/* The bucket's pointer: NULL when empty, a dot when it points to a chain */}
            <div className="flex h-9 w-12 flex-none items-center justify-center rounded-md bg-blue-700/50">
              <motion.span
                key={chain.length ? "ptr" : "null"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                className={
                  chain.length
                    ? "text-base leading-none text-white"
                    : "font-mono text-[10px] text-blue-200/70"
                }
              >
                {chain.length ? "●" : "NULL"}
              </motion.span>
            </div>

            {chain.map((node) => {
              const isNew = phase === "insert" && current?.key === node.key
              return (
                <motion.div
                  key={node.key}
                  initial={{ opacity: 0, x: -16, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={spring}
                  className="flex flex-none items-center gap-1.5"
                >
                  <span className="text-white/80">→</span>
                  <span
                    className={`rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold shadow-md shadow-blue-950/30 transition-colors duration-300 ${
                      isNew ? "bg-amber-300 text-blue-900" : "bg-white text-blue-700"
                    }`}
                  >
                    {node.key}
                  </span>
                </motion.div>
              )
            })}

            {chain.length > 0 && (
              <motion.span
                layout
                transition={spring}
                className="flex-none font-mono text-[10px] text-blue-200/70"
              >
                → NULL
              </motion.span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-blue-100">
        ● points to the head of a chain. NULL means no chain (or the end of one).
      </p>

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