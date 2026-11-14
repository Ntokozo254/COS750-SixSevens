import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react"
import { InkButton } from "../../../features/probing/ProbingUi"

const N = 10 // table size
const KEYS = [47, 83, 21] // they land in slots 7, 3 and 1

const SPEEDS = [
  { id: "slow", label: "Slow", ms: 1800 },
  { id: "normal", label: "Normal", ms: 1100 },
  { id: "fast", label: "Fast", ms: 600 },
]

const spring = { type: "spring", stiffness: 260, damping: 24 }

// Every step of the animation as data, so it can be played, paused or stepped.
// stage: 0 key, 1 plug in, 2 result, 3 placed
function buildFrames() {
  const frames = [{ count: 0, stage: -1, phase: "idle", message: `Press Play to hash three keys into a table of ${N} slots.` }]
  KEYS.forEach((k, i) => {
    const slot = k % N
    const messages = [
      `Take the key ${k}.`,
      `Plug it into the rule: h(${k}) = ${k} mod ${N}.`,
      `${k} divided by ${N} leaves a remainder of ${slot}, so the slot is ${slot}.`,
      `${k} goes into slot ${slot}.`,
    ]
    messages.forEach((message, stage) => frames.push({ count: i, stage, phase: "run", message }))
  })
  frames.push({
    count: KEYS.length,
    stage: -1,
    phase: "done",
    message: "Each key went straight to its slot. The same rule always gives the same answer.",
  })
  return frames
}

const FRAMES = buildFrames()
const LAST = FRAMES.length - 1

export default function HashFunctionVisual() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState("normal")

  const { count, stage, phase, message } = FRAMES[frameIndex]
  const atEnd = frameIndex === LAST
  const delay = SPEEDS.find((item) => item.id === speed).ms

  // Auto-advance while playing. The state update happens in the timer, not in the effect body.
  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => {
      const next = Math.min(frameIndex + 1, LAST)
      setFrameIndex(next)
      if (next === LAST) setPlaying(false)
    }, delay)
    return () => clearTimeout(timer)
  }, [playing, frameIndex, delay])

  function step(delta) {
    setPlaying(false)
    setFrameIndex((i) => Math.max(0, Math.min(LAST, i + delta)))
  }

  function togglePlay() {
    if (atEnd) setFrameIndex(0)
    setPlaying((value) => !value)
  }

  function restart() {
    setPlaying(false)
    setFrameIndex(0)
  }

  function onKeyDown(event) {
    if (event.target.closest("button")) return
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.stopPropagation() // keep the lesson carousel from also changing card
      step(event.key === "ArrowRight" ? 1 : -1)
    }
  }

  const current = phase === "run" ? KEYS[count] : null
  const slot = current === null ? -1 : current % N
  const placed = phase === "done" ? KEYS : KEYS.slice(0, stage === 3 ? count + 1 : count)

  const slotStyle = (i) => {
    if (i === slot && stage === 2) return "bg-yellow/20 ring-2 ring-yellow"
    if (i === slot && stage === 3) return "bg-emerald-400/30 ring-2 ring-emerald-400"
    return "bg-blue-700/40"
  }

  return (
    <div
      data-no-swipe
      className="select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-yellow"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Hash function animation. Use the left and right arrow keys to step."
    >
      {/* The rule, with a colour for each part */}
      <div className="rounded-xl bg-blue-700/40 px-4 py-3 text-center">
        <p className="font-mono text-lg font-bold text-white">
          h(<span className="text-yellow">k</span>) = <span className="text-yellow">k</span> mod{" "}
          <span className="text-blue-200">N</span>
        </p>
        <p className="mt-1 text-xs text-blue-100">
          <span className="text-yellow">k</span> is the key,{" "}
          <span className="text-blue-200">N</span> is the table size ({N})
        </p>
      </div>

      {/* The worked example builds up one piece at a time */}
      <div className="mt-4 flex min-h-12 flex-wrap items-center justify-center gap-x-2 font-mono text-lg font-bold text-white">
        {current !== null ? (
          <>
            <motion.span key={count} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              h(<span className="text-yellow">{current}</span>)
            </motion.span>
            {stage >= 1 && (
              <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                = <span className="text-yellow">{current}</span> mod{" "}
                <span className="text-blue-200">{N}</span>
              </motion.span>
            )}
            {stage >= 2 && (
              <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-300">
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
              <div className={`relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(i)}`}>
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
              <span className={`text-[10px] ${i === slot ? "font-bold text-white" : "text-blue-100"}`}>[{i}]</span>
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="mt-3 min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

      <div className="mt-1 flex items-center gap-2 text-[11px] text-blue-100">
        <span className="whitespace-nowrap">
          Step {frameIndex + 1} of {FRAMES.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${((frameIndex + 1) / FRAMES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls: restart, step back, play/pause, step forward, speed */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <InkButton variant="ghost" aria-label="Restart" onClick={restart}>
            <RotateCcw size={15} />
          </InkButton>
          <InkButton variant="ghost" aria-label="Previous step" disabled={frameIndex === 0} onClick={() => step(-1)}>
            <ChevronLeft size={16} />
          </InkButton>
          <InkButton variant="go" className="min-w-24" onClick={togglePlay}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </InkButton>
          <InkButton variant="ghost" aria-label="Next step" disabled={atEnd} onClick={() => step(1)}>
            <ChevronRight size={16} />
          </InkButton>
        </div>
        <div className="flex items-center gap-1.5" role="group" aria-label="Playback speed">
          {SPEEDS.map((item) => (
            <InkButton
              key={item.id}
              variant={item.id === speed ? "on" : "off"}
              aria-pressed={item.id === speed}
              className="h-7 px-2 text-xs"
              onClick={() => setSpeed(item.id)}
            >
              {item.label}
            </InkButton>
          ))}
        </div>
      </div>
    </div>
  )
}
