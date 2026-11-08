import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import StepControls from "@/components/shared/StepControls"
import { useAutoAdvance } from "@/components/shared/useAutoAdvance"

const SIZE = 5

// A table built with separate chaining: each bucket is a list
const BUCKETS = [["sam_li"], [], ["mary_k", "tom_b", "zara_m"], ["john_doe"], []]

// Both searches hash to bucket 2 (made up hash values)
const SEARCHES = {
  hit: { key: "zara_m", hash: 8810452 },
  miss: { key: "lee_p", hash: 6602117 },
}
const BUCKET = 2

const IDLE = "Pick a key. We jump to its bucket, then walk down that one chain."

// Every step of one search: which node is highlighted, what to say, and how long autoplay waits
function buildSteps(which) {
  const { key, hash } = SEARCHES[which]
  const chain = BUCKETS[BUCKET]
  const steps = [
    { node: -1, pause: 2200, message: `hash(‘${key}’) = ${hash}, and ${hash} % ${SIZE} = ${BUCKET}. Go to bucket ${BUCKET}.` },
  ]
  for (let n = 0; n <= chain.length; n++) {
    if (n === chain.length) {
      steps.push({ node: n, pause: 0, message: `Reached NULL, the end of the chain. ${key} is NOT in the table.` })
    } else if (chain[n] === key) {
      steps.push({ node: n, pause: 0, message: `${chain[n]} matches. Found it after ${n + 1} comparisons.` })
      break
    } else {
      steps.push({ node: n, pause: 1600, message: `${chain[n]} is not ${key}. Follow the pointer to the next node.` })
    }
  }
  return steps
}

const STEPS = { hit: buildSteps("hit"), miss: buildSteps("miss") }

// stepped: students press Prev / Next instead of watching it autoplay
export default function ChainSearchVisual({ stepped = false }) {
  const [search, setSearch] = useState(null) // "hit" | "miss" | null
  const [step, setStep] = useState(0)

  const steps = search ? STEPS[search] : []
  const last = steps.length - 1
  const auto = !stepped && search !== null
  useAutoAdvance(auto, step, last, steps[step]?.pause ?? 0, setStep)

  const busy = auto && step < last
  const node = search ? steps[step].node : -1 // index in the chain being checked, chain.length = NULL
  const message = search ? steps[step].message : IDLE

  const reset = () => {
    setSearch(null)
    setStep(0)
  }

  const run = (which) => {
    if (busy) return
    setSearch(which)
    setStep(0)
  }

  const key = search ? SEARCHES[search].key : null

  const nodeStyle = (b, n, value) => {
    if (b !== BUCKET || !search) return "bg-white text-blue-700"
    if (n === node) return value === key ? "bg-emerald-400 text-white ring-4 ring-emerald-200/60" : "bg-amber-300 text-blue-900"
    if (n < node) return "bg-white/35 text-blue-100"
    return "bg-white text-blue-700"
  }

  return (
    <div className="select-none">
      <div className="flex flex-col gap-2">
        {BUCKETS.map((chain, b) => {
          const active = search && b === BUCKET
          const nullHit = active && node === chain.length
          return (
            <div key={b} className="flex items-center gap-1.5">
              {/* The bucket itself */}
              <div
                className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors duration-300 ${
                  active ? "bg-amber-300/30 ring-2 ring-amber-300" : "bg-blue-700/40"
                }`}
              >
                [{b}]
              </div>

              {/* The chain hanging off it */}
              {chain.map((value, n) => (
                <div key={value} className="flex items-center gap-1.5">
                  <span className="text-white/70">→</span>
                  <motion.div
                    animate={{ scale: b === BUCKET && n === node ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={`flex h-9 items-center rounded-md px-2 font-mono text-[11px] font-bold shadow-md shadow-blue-950/30 transition-colors duration-300 sm:text-xs ${nodeStyle(b, n, value)}`}
                  >
                    {value}
                  </motion.div>
                </div>
              ))}
              <span className="text-white/70">→</span>
              <span
                className={`rounded px-1 font-mono text-[10px] transition-colors duration-300 ${
                  nullHit ? "bg-red-400/40 text-white ring-2 ring-red-400" : "text-blue-200"
                }`}
              >
                NULL
              </span>
            </div>
          )
        })}
      </div>

      <p aria-live="polite" className="mt-4 min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

      <div data-no-swipe className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" disabled={busy} onClick={() => run("hit")}
          className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50">
          Search {SEARCHES.hit.key}
        </Button>
        <Button size="sm" disabled={busy} onClick={() => run("miss")}
          className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50">
          Search {SEARCHES.miss.key}
        </Button>
        <Button size="sm" onClick={reset} className="bg-blue-700 text-white hover:bg-blue-800">
          Reset
        </Button>
      </div>

      {stepped && (
        <StepControls
          step={step}
          total={steps.length}
          disabled={!search}
          onPrev={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
        />
      )}
    </div>
  )
}
