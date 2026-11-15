
import { useState } from "react"
import { motion } from "motion/react"
import AnimationControls from "../AnimationControls"

const SIZE = 5

// Made-up hash codes. The 3rd, 4th and 5th inserts collide.
const INSERTS = [
  { key: "john_doe", hash: 4829103 },
  { key: "mary_k", hash: 2210041 },
  { key: "jane_roe", hash: 7351873 },
  { key: "sam_li", hash: 6094118 },
  { key: "ann_p", hash: 9042316 },
]

const spring = { type: "spring", stiffness: 260, damping: 24 }

const IDLE = `${SIZE} buckets, all empty, so every pointer is NULL.`
const DONE =
  "Done. Each bucket points to the head of its chain, and empty buckets point to NULL."

// One initial state, followed by two states per insertion.
const TOTAL_STEPS = INSERTS.length * 2 + 1

export default function ChainingPointersVisual() {
  const [step, setStep] = useState(0)

  // Step 0 is the initial empty hash table.
  // Odd steps represent hashing.
  // Even steps represent insertion.
  const isHashing = step > 0 && step % 2 === 1
  const isInserting = step > 0 && step % 2 === 0
  const isComplete = step === TOTAL_STEPS - 1

  // Determine which key is currently being processed.
  const currentIndex = step > 0
    ? Math.floor((step - 1) / 2)
    : -1

  const current = currentIndex >= 0 && currentIndex < INSERTS.length
    ? INSERTS[currentIndex]
    : null

  const currentBucket = current
    ? current.hash % SIZE
    : -1

  // Number of fully inserted keys.
  const insertedCount = Math.floor(step / 2)

  // Build the chains using only completed insertions.
  // During an insertion step, include the current key as well.
  const visibleCount = isInserting
    ? insertedCount
    : insertedCount

  const shown = INSERTS.slice(0, visibleCount)

  const chains = Array.from({ length: SIZE }, () => [])

  shown.forEach((item) => {
    chains[item.hash % SIZE].push(item)
  })

  // Check whether the current bucket already contains a chain.
  const wasOccupied = current
    ? INSERTS.slice(0, currentIndex).some(
        (item) => item.hash % SIZE === currentBucket
      )
    : false

  // Explanation for the current animation state.
  const getMessage = () => {
    if (step === 0) {
      return IDLE
    }

    if (isComplete) {
      return DONE
    }

    if (isHashing) {
      return wasOccupied
        ? `Collision! Bucket ${currentBucket} already has a chain.`
        : `Bucket ${currentBucket} is empty (NULL).`
    }

    if (isInserting) {
      return wasOccupied
        ? `Walk to the end of the chain and append ${current.key}. The chain grows by one node.`
        : `${current.key} becomes the head of a new chain. Bucket ${currentBucket}'s pointer now points to it.`
    }

    return IDLE
  }

  const message = getMessage()

  // Highlight the bucket currently being processed.
  const rowStyle = (index) => {
    if (index !== currentBucket) return ""

    if (isHashing) {
      return wasOccupied
        ? "lesson-visual-slot--collision"
        : "lesson-visual-slot--current"
    }

    if (isInserting) {
      return "lesson-visual-slot--found"
    }

    return ""
  }

  const previousStep = () => {
    setStep((previous) => Math.max(0, previous - 1))
  }

  const nextStep = () => {
    setStep((previous) => Math.min(TOTAL_STEPS - 1, previous + 1))
  }

  return (
    <div className="lesson-visual select-none">
      {/* What is being inserted right now */}
      <div className="lesson-visual-caption flex min-h-9 flex-wrap items-center justify-center gap-2">
        {current ? (
          <>
            <span className="lesson-visual-slot lesson-visual-slot--current rounded-full px-2.5 py-1 font-mono font-bold">
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
        {chains.map((chain, index) => (
          <div
            key={index}
            className={`lesson-visual-slot flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-all duration-300 ${rowStyle(index)}`}
          >
            <span className="lesson-visual-index w-7 flex-none text-center">
              [{index}]
            </span>

            {/* Bucket pointer: NULL when empty, a dot when it points to a chain */}
            <div className="lesson-visual-slot lesson-visual-slot--occupied flex h-9 w-12 flex-none items-center justify-center rounded-md">
              <motion.span
                key={chain.length ? "ptr" : "null"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                className={
                  chain.length
                    ? "lesson-visual-pointer text-base leading-none"
                    : "lesson-visual-index font-mono"
                }
              >
                {chain.length ? "●" : "NULL"}
              </motion.span>
            </div>

            {/* Nodes belonging to this bucket's chain */}
            {chain.map((node) => {
              const isNew =
                isInserting && current?.key === node.key

              return (
                <motion.div
                  key={node.key}
                  initial={{ opacity: 0, x: -16, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={spring}
                  className="flex flex-none items-center gap-1.5"
                >
                  <span className="lesson-visual-pointer">→</span>

                  <span
                    className={`lesson-visual-slot rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold transition-colors duration-300 ${
                      isNew
                        ? "lesson-visual-slot--current"
                        : "lesson-visual-slot--occupied"
                    }`}
                  >
                    {node.key}
                  </span>
                </motion.div>
              )
            })}

            {/* End of the chain */}
            {chain.length > 0 && (
              <motion.span
                layout
                transition={spring}
                className="lesson-visual-index flex-none font-mono"
              >
                → NULL
              </motion.span>
            )}
          </div>
        ))}
      </div>

      <p className="lesson-visual-caption mt-2 text-center">
        ● points to the head of a chain. NULL means no chain (or the end of one).
      </p>

      {/* Current explanation */}
      <p
        aria-live="polite"
        className="lesson-visual-caption mt-3 min-h-10 text-center"
      >
        {message}
      </p>

      {/* Shared animation controls */}
      <AnimationControls
        step={step}
        totalSteps={TOTAL_STEPS}
        onPrevious={previousStep}
        onNext={nextStep}
      />
    </div>
  )
}
