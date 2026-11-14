import { motion } from "motion/react"
import { hashFunction } from "../../../logic/hashing"
import PlaybackControls from "./PlaybackControls"
import { usePlayback } from "./usePlayback"

const N = 10
const KEYS = [15, 32, 25, 42, 7] // 25 collides with 15 (slot 5), 42 with 32 (slot 2)

const spring = { type: "spring", stiffness: 260, damping: 24 }

// Work out once which keys get a free slot and which collide.
const STEPS = (() => {
  const owner = {}
  return KEYS.map((key) => {
    const slot = hashFunction(key, N)
    const blocker = owner[slot] ?? null
    if (blocker === null) owner[slot] = key
    return { key, slot, blocker }
  })
})()

// Frames: start, then per key "hash it" and "check the slot", then a summary.
const FRAMES = [
  { i: -1, stage: 0, message: `Insert ${KEYS.join(", ")} into a table of ${N} slots. Watch for keys that want a taken slot.` },
  ...STEPS.flatMap(({ key, slot, blocker }, i) => [
    { i, stage: 0, message: `h(${key}) = ${key} mod ${N} = ${slot}. Is slot ${slot} free?` },
    {
      i,
      stage: 1,
      message:
        blocker === null
          ? `Slot ${slot} is empty, so ${key} is stored there.`
          : `Collision! Slot ${slot} already holds ${blocker}. ${key} and ${blocker} are different keys with the same home slot.`,
    },
  ]),
  {
    i: KEYS.length,
    stage: 0,
    message: `${STEPS.filter((s) => s.blocker !== null).length} collisions. The table is only half full, yet two keys have nowhere to go. Module 4 shows where they end up.`,
  },
]

export default function CollisionTraceVisual() {
  const playback = usePlayback(FRAMES.length)
  const { i, stage, message } = FRAMES[playback.frameIndex]

  // Steps fully done so far (the current one counts once its slot has been checked).
  const done = STEPS.slice(0, stage === 1 ? i + 1 : Math.max(i, 0))
  const current = i >= 0 && i < STEPS.length ? STEPS[i] : null

  const stored = {}
  const collided = {}
  done.forEach((s) => {
    if (s.blocker === null) stored[s.slot] = s.key
    else (collided[s.slot] ??= []).push(s.key)
  })

  const slotStyle = (slot) => {
    if (!current || current.slot !== slot) return "bg-blue-700/40"
    if (stage === 0) return "bg-yellow/20 ring-2 ring-yellow"
    return current.blocker === null ? "bg-emerald-400/30 ring-2 ring-emerald-400" : "bg-red-400/25 ring-2 ring-red-400"
  }

  return (
    <div
      data-no-swipe
      className="select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-yellow"
      tabIndex={0}
      onKeyDown={playback.onKeyDown}
      aria-label="Collision animation. Use the left and right arrow keys to step."
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
        <span className="font-bold uppercase tracking-widest text-blue-200">Keys</span>
        {KEYS.map((key, k) => (
          <span
            key={key}
            className={`grid h-6 min-w-7 place-items-center rounded px-1.5 text-xs font-bold ${
              k === i ? "bg-yellow text-blue-900" : k < i ? "bg-white/90 text-blue-700" : "bg-blue-700/40 text-blue-100 ring-1 ring-white/20"
            }`}
          >
            {key}
          </span>
        ))}
      </div>

      <p className="mt-3 min-h-7 text-center font-mono text-lg font-bold text-white">
        {current ? (
          <>
            h(<span className="text-yellow">{current.key}</span>) = {current.key} mod {N} ={" "}
            <span className="text-emerald-300">{current.slot}</span>
          </>
        ) : (
          <span className="text-sm font-normal text-blue-200">h(k) = k mod {N}</span>
        )}
      </p>

      <div className="mt-3 grid grid-cols-10 gap-1">
        {Array.from({ length: N }, (_, slot) => (
          <div key={slot} className="flex flex-col items-center gap-1">
            <div className={`relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(slot)}`}>
              {stored[slot] !== undefined && (
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={spring}
                  className="absolute inset-0.5 flex items-center justify-center rounded bg-white text-sm font-bold text-blue-700"
                >
                  {stored[slot]}
                </motion.div>
              )}
            </div>
            <span className={`text-[10px] ${current?.slot === slot ? "font-bold text-white" : "text-blue-100"}`}>[{slot}]</span>
            {/* Keys that collided here wait underneath; they are not stored yet */}
            <div className="flex min-h-6 flex-col items-center gap-0.5">
              {(collided[slot] ?? []).map((key) => (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  aria-label={`${key} collided at slot ${slot}`}
                  className="rounded bg-red-400 px-1 text-[10px] font-bold text-white"
                >
                  {key}!
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="mt-2 min-h-12 text-center text-sm text-blue-100">
        {message}
      </p>

      <PlaybackControls playback={playback} />
    </div>
  )
}
