import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "./Button"

const DWELL = 4500 // ms each term stays on screen while Play is running
const spring = { type: "spring", stiffness: 300, damping: 24 }

/* ---------- Small building blocks ---------- */

// Fades and pops its child in after `delay` seconds
function Pop({ delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  )
}

function Chip({ className, children }) {
  return (
    <div
      className={`flex h-9 items-center px-3 font-mono text-xs font-bold shadow-lg shadow-blue-950/40 ${className}`}
    >
      {children}
    </div>
  )
}

const Arrow = () => <span className="text-lg text-white/80">→</span>

/* ---------- One tiny diagram per term ---------- */

function HashDiagram() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Pop delay={0}><Chip className="rounded-full bg-white text-blue-700">john_doe</Chip></Pop>
      <Pop delay={0.4}><Arrow /></Pop>
      <Pop delay={0.6}>
        <Chip className="rounded-lg border-2 border-white/60 bg-blue-700/60 text-white">hash()</Chip>
      </Pop>
      <Pop delay={1}><Arrow /></Pop>
      <Pop delay={1.2}><Chip className="rounded-full bg-emerald-400 text-white">3</Chip></Pop>
    </div>
  )
}

function CollisionDiagram() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col gap-2">
        <Pop delay={0}><Chip className="rounded-full bg-white text-blue-700">john_doe</Chip></Pop>
        <Pop delay={0.6}><Chip className="rounded-full bg-amber-300 text-blue-900">jane_roe</Chip></Pop>
      </div>
      <Pop delay={0.9}><Arrow /></Pop>
      <motion.div
        initial={{ backgroundColor: "#1d4ed866" }}
        animate={{ backgroundColor: "#f87171cc" }}
        transition={{ delay: 1.2, duration: 0.3 }}
        className="flex h-14 w-14 flex-col items-center justify-center rounded-lg ring-2 ring-white/30"
      >
        <span className="text-[10px] text-blue-100">bucket</span>
        <span className="text-lg font-bold leading-none text-white">3</span>
      </motion.div>
      <Pop delay={1.4}><span className="text-xs font-bold text-red-200">Collision!</span></Pop>
    </div>
  )
}

function ChainingDiagram() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Pop delay={0}><span className="text-xs text-blue-100">[3]</span></Pop>
      <Pop delay={0.1}>
        <div className="flex h-9 w-10 items-center justify-center rounded-md bg-blue-700/60 text-white">●</div>
      </Pop>
      <Pop delay={0.4}><Arrow /></Pop>
      <Pop delay={0.5}><Chip className="rounded-lg bg-white text-blue-700">john_doe</Chip></Pop>
      <Pop delay={0.9}><Arrow /></Pop>
      <Pop delay={1}><Chip className="rounded-lg bg-amber-300 text-blue-900">jane_roe</Chip></Pop>
      <Pop delay={1.4}><span className="font-mono text-[10px] text-blue-200/70">→ NULL</span></Pop>
    </div>
  )
}

function ProbingDiagram() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="relative h-12 w-12 rounded-md bg-blue-700/40">
              {i === 3 && (
                <>
                  <div className="absolute inset-0.5 flex items-center justify-center rounded bg-white text-center text-[9px] font-bold leading-[1.1] text-blue-700">
                    john_<br />doe
                  </div>
                  {/* red ring: "taken" */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute inset-0 rounded-md ring-2 ring-red-400"
                  />
                </>
              )}
              {i === 4 && (
                <>
                  {/* the new key hops here from above slot 3 */}
                  <motion.div
                    initial={{ opacity: 0, x: -56, y: -36 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ ...spring, delay: 1 }}
                    className="absolute inset-0.5 z-10 flex items-center justify-center rounded bg-amber-300 text-center text-[9px] font-bold leading-[1.1] text-blue-900"
                  >
                    jane_<br />roe
                  </motion.div>
                  {/* green ring: "free" */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="absolute inset-0 rounded-md ring-2 ring-emerald-400"
                  />
                </>
              )}
            </div>
            <span className="text-[10px] text-blue-100">[{i}]</span>
          </div>
        ))}
      </div>
      <Pop delay={1.2}>
        <span className="text-xs text-blue-100">slot 3 is taken, so try (3 + 1) % 10 = 4</span>
      </Pop>
    </div>
  )
}

function LoadDiagram() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ backgroundColor: "#1d4ed866" }}
            animate={i < 8 ? { backgroundColor: "#ffffff" } : {}}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.25 }}
            className="h-6 w-6 rounded-md"
          />
        ))}
      </div>
      <Pop delay={1.7}>
        <span className="font-mono text-xs text-white">8 entries / 10 buckets = 0.8</span>
      </Pop>
      <Pop delay={2.1}>
        <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-blue-900">
          Too full: time to resize
        </span>
      </Pop>
    </div>
  )
}

/* ---------- The terms (wording from your table) ---------- */

const TERMS = [
  { id: "hash", term: "Hash function", meaning: "Maps a key to a bucket index", Diagram: HashDiagram },
  { id: "collision", term: "Collision", meaning: "Two keys land in the same bucket", Diagram: CollisionDiagram },
  { id: "chaining", term: "Separate chaining", meaning: "Each bucket holds a list of colliding entries", Diagram: ChainingDiagram },
  { id: "open", term: "Open addressing", meaning: "Alternative: probe for the next free slot", Diagram: ProbingDiagram },
  { id: "load", term: "Load factor", meaning: "entries / buckets - drives resize", Diagram: LoadDiagram },
]

export default function TerminologyVisual() {
  const [index, setIndex] = useState(0)
  const [nonce, setNonce] = useState(0) // bumping this replays the current diagram
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % TERMS.length), DWELL)
    return () => clearTimeout(t)
  }, [playing, index])

  const pick = (i) => {
    setIndex(i)
    setNonce((n) => n + 1)
  }

  const { id, term, meaning, Diagram } = TERMS[index]

  return (
    <div className="select-none">
      {/* data-no-swipe stops the carousel from swiping when you press these */}
      <div data-no-swipe className="flex flex-wrap justify-center gap-2">
        {TERMS.map((t, i) => (
          <Button
            key={t.id}
            size="sm"
            onClick={() => pick(i)}
            className={
              i === index
                ? "bg-white text-blue-700 hover:bg-white"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }
          >
            {t.term}
          </Button>
        ))}
      </div>

      {/* Fixed minimum height so the card does not jump between terms */}
      <div className="mt-4 min-h-56 rounded-xl bg-blue-700/40 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${id}-${nonce}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h4 className="text-center text-base font-bold text-white">{term}</h4>
            <p className="mt-1 text-center text-sm text-blue-100">{meaning}</p>
            <div className="mt-4 flex min-h-28 items-center justify-center">
              <Diagram />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div data-no-swipe className="mt-3 flex items-center justify-center gap-3">
        <Button
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          className="min-w-24 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          {playing ? "Pause" : "Play"}
        </Button>
        <span className="text-xs text-blue-100">
          {index + 1} / {TERMS.length}
        </span>
      </div>
    </div>
  )
}