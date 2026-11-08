import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import StepControls from "@/components/shared/StepControls"
import { useAutoAdvance } from "@/components/shared/useAutoAdvance"

const SIZE = 10

// A table built with linear probing. john_doe, jane_roe and amy_t all hashed to 3,
// so jane_roe and amy_t were pushed forward into 4 and 6.
const TABLE = { 1: "mary_k", 3: "john_doe", 4: "jane_roe", 5: "sam_li", 6: "amy_t" }

// Each search: the key, its (made up) hash, and the slots it checks in order
const SEARCHES = {
  hit: { key: "amy_t", hash: 5120593, path: [3, 4, 5, 6] },
  miss: { key: "bob_x", hash: 3310874, path: [4, 5, 6, 7] },
}

const IDLE = "Pick a key to search for. Watch which slots get checked."

// Every step of one search: position in the path (-1 = just hashed), what to say, autoplay wait
function buildSteps(which) {
  const { key, hash, path } = SEARCHES[which]
  const steps = [
    { probe: -1, pause: 2200, message: `hash(‘${key}’) = ${hash}, and ${hash} % ${SIZE} = ${path[0]}. Start at slot ${path[0]}.` },
  ]
  path.forEach((slot, s) => {
    const stored = TABLE[slot]
    if (!stored) {
      steps.push({ probe: s, pause: 0, message: `Slot ${slot} is empty. If ${key} existed, it would be here, so it is NOT in the table.` })
    } else if (stored === key) {
      steps.push({ probe: s, pause: 0, message: `Slot ${slot} holds ${key}. Found it after ${s + 1} checks.` })
    } else {
      steps.push({ probe: s, pause: 1700, message: `Slot ${slot} holds ${stored}, not ${key}. Move to the next slot.` })
    }
  })
  return steps
}

const STEPS = { hit: buildSteps("hit"), miss: buildSteps("miss") }

// stepped: students press Prev / Next instead of watching it autoplay
export default function ProbeSearchVisual({ stepped = false }) {
  const [search, setSearch] = useState(null) // "hit" | "miss" | null
  const [at, setAt] = useState(0) // which entry of STEPS[search] is showing

  const steps = search ? STEPS[search] : []
  const last = steps.length - 1
  const auto = !stepped && search !== null
  useAutoAdvance(auto, at, last, steps[at]?.pause ?? 0, setAt)

  const busy = auto && at < last
  const step = search ? steps[at].probe : -1 // position in the path being checked
  const message = search ? steps[at].message : IDLE

  const reset = () => {
    setSearch(null)
    setAt(0)
  }

  const run = (which) => {
    if (busy) return
    setSearch(which)
    setAt(0)
  }

  const path = search ? SEARCHES[search].path : []
  const current = step >= 0 ? path[step] : null

  const slotStyle = (i) => {
    const checked = path.slice(0, step).includes(i)
    if (i === current) {
      if (!TABLE[i]) return "bg-red-400/40 ring-2 ring-red-400 text-blue-100"
      if (TABLE[i] === SEARCHES[search].key) return "bg-emerald-400 text-white ring-4 ring-emerald-200/60"
      return "bg-amber-300 text-blue-900 ring-2 ring-amber-200"
    }
    if (checked) return "bg-white/35 text-blue-100"
    return TABLE[i] ? "bg-white text-blue-700 shadow-md shadow-blue-950/30" : "bg-blue-700/40 text-blue-200"
  }

  return (
    <div className="select-none">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: SIZE }, (_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === current ? 1.08 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`relative flex h-14 flex-col items-center justify-center rounded-lg px-1 transition-colors duration-300 ${slotStyle(i)}`}
          >
            <span className="absolute left-1.5 top-1 text-[10px] opacity-70">[{i}]</span>
            <span className={`mt-2 font-mono text-[11px] sm:text-xs ${TABLE[i] ? "font-bold" : "opacity-60"}`}>
              {TABLE[i] ?? "—"}
            </span>
          </motion.div>
        ))}
      </div>

      <p aria-live="polite" className="mt-4 min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

      {/* data-no-swipe stops the carousel from swiping when you press these */}
      <div data-no-swipe className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" disabled={busy} onClick={() => run("hit")}
          className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50">
          Search {SEARCHES.hit.key}
        </Button>
        <Button size="sm" disabled={busy} onClick={() => run("miss")}
          className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50">
          Search {SEARCHES.miss.key}
        </Button>
        <Button size="sm" onClick={reset} disabled={!search}
          className="bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50">
          Reset
        </Button>
      </div>

      {stepped && (
        <StepControls
          step={at}
          total={steps.length}
          disabled={!search}
          onPrev={() => setAt(at - 1)}
          onNext={() => setAt(at + 1)}
        />
      )}
    </div>
  )
}
