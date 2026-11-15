
import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "./Button"
import AnimationControls from "../AnimationControls"

const SIZE = 10
const STORED_KEY = "john_doe"
const NEW_KEY = "jane_roe"
const STORED_HASH = 4829103
const NEW_HASH = 7351873

const SLOT = STORED_HASH % SIZE
const NEXT = (SLOT + 1) % SIZE

const spring = { type: "spring", stiffness: 260, damping: 24 }

const IDLE = `Slot ${SLOT} already holds ${STORED_KEY}. Press Play to insert a second key.`
const ARRIVE = `Insert ${NEW_KEY}: hash = ${NEW_HASH}, and ${NEW_HASH} % ${SIZE} = ${SLOT}.`
const COLLIDE = `Collision! Slot ${SLOT} is already taken by ${STORED_KEY}.`

// Each beat: [stage, message, pause in milliseconds]
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

// The new key keeps the same layoutId wherever it is rendered.
function NewKey() {
  return (
    <motion.div
      layoutId="new-key"
      layout="position"
      transition={spring}
      initial={{ opacity: 1, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lesson-visual-slot lesson-visual-slot--current flex h-full w-full items-center justify-center rounded text-center text-[9px] font-bold leading-[1.1]"
    >
      <TwoLine text={NEW_KEY} />
    </motion.div>
  )
}

export default function CollisionVisual() {
  const [mode, setMode] = useState("chaining")
  const [stage, setStage] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const beats = BEATS[mode]
  const totalSteps = beats.length + 1

  // The controls include the initial idle state as step zero.
  const currentBeatIndex = beats.findIndex(
    ([beatStage]) => beatStage === stage
  )

  const step = currentBeatIndex + 1

  const message =
    stage === -1
      ? IDLE
      : beats[currentBeatIndex][1]

  const isComplete = currentBeatIndex === beats.length - 1

  // Automatically advance while playback is active.
  useEffect(() => {
    if (!isPlaying || stage === -1) return

    const beatIndex = beats.findIndex(
      ([beatStage]) => beatStage === stage
    )

    if (beatIndex === -1 || beatIndex === beats.length - 1) {
      setIsPlaying(false)
      return
    }

    const delay = beats[beatIndex][2] || 1800

    const timeoutId = setTimeout(() => {
      setStage(beats[beatIndex + 1][0])
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [isPlaying, stage, beats])

  // Select a collision-resolution strategy.
  const chooseMode = (selectedMode) => {
    setIsPlaying(false)
    setMode(selectedMode)
    setStage(-1)
  }

  // Manually move backwards.
  const previousStep = () => {
    setIsPlaying(false)

    if (step <= 1) {
      setStage(-1)
      return
    }

    setStage(beats[step - 2][0])
  }

  // Manually move forwards.
  const nextStep = () => {
    setIsPlaying(false)

    if (step < totalSteps - 1) {
      setStage(beats[step][0])
    }
  }

  // Play or replay the demonstration.
  const play = () => {
    if (isComplete) {
      setStage(beats[0][0])
    } else if (stage === -1) {
      setStage(beats[0][0])
    }

    setIsPlaying(true)
  }

  const chaining = mode === "chaining"
  const probing = mode === "probing"

  // Where is the new key currently displayed?
  const inArrival =
    stage >= 0 && (chaining ? stage < 2 : stage < 3)

  const inChain = chaining && stage >= 2
  const inProbeSlot = probing && stage >= 3

  const slotStyle = (i) => {
    if (i === SLOT && stage === 1) {
      return "lesson-visual-slot--collision"
    }

    if (i === SLOT && inChain) {
      return "lesson-visual-slot--found"
    }

    if (i === NEXT && probing && stage === 2) {
      return "lesson-visual-slot--current"
    }

    if (i === NEXT && inProbeSlot) {
      return "lesson-visual-slot--found"
    }

    return ""
  }

  return (
    <div className="lesson-visual select-none">

      {/* Hash table */}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: SIZE }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
          >
            {/* Arrival area */}
            <div className="aspect-square w-full">
              {i === SLOT && inArrival && <NewKey />}
            </div>

            {/* Hash table slot */}
            <div
              className={`lesson-visual-slot relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(i)}`}
            >
              {i === SLOT && (
                <motion.div
                  animate={
                    stage === 1
                      ? { x: [0, -4, 4, -4, 4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.5 }}
                  className="lesson-visual-slot lesson-visual-slot--occupied absolute inset-0.5 z-10 flex items-center justify-center rounded text-center text-[9px] font-bold leading-[1.1]"
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

            <span className="lesson-visual-index">[{i}]</span>

            {/* Separate chaining area */}
            <div className="flex min-h-14 w-full flex-col items-center">
              {i === SLOT && inChain && (
                <>
                  <div className="h-2 w-px bg-[#9bb8e9]" />
                  <div className="aspect-square w-full">
                    <NewKey />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <p
        aria-live="polite"
        className="lesson-visual-caption mt-2 min-h-10 text-center"
      >
        {message}
      </p>

      {/* Collision resolution strategy */}
      <div
        data-no-swipe
        className="mt-3 flex flex-wrap items-center justify-center gap-2"
      >
        {MODES.map((m) => (
          <Button
            key={m.id}
            size="sm"
            disabled={mode === m.id}
            onClick={() => chooseMode(m.id)}
            aria-pressed={mode === m.id}
          >
            {m.label}
          </Button>
        ))}
      </div>

      {/* Shared animation controls */}
      <AnimationControls
        step={step}
        totalSteps={totalSteps}
        onPrevious={previousStep}
        onNext={nextStep}
        onPlay={play}
        playLabel={isComplete ? "Replay" : "Play"}
      />
    </div>
  )
}
