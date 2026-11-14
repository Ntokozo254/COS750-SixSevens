import { useState } from "react"
import { hashFunction } from "../../../logic/hashing"

// Keys with a pattern (all multiples of 10). With m = 10 they all pile into
// slot 0; with a prime m = 7 they spread out.
const KEYS = [10, 20, 30, 40, 50, 60]
const OPTIONS = [10, 7]

export default function GoodHashVisual() {
  const [size, setSize] = useState(10)

  const buckets = Array.from({ length: size }, () => [])
  KEYS.forEach((k) => buckets[hashFunction(k, size)].push(k))
  const used = buckets.filter((b) => b.length > 0).length

  return (
    <div data-no-swipe className="grid gap-3">
      <p className="text-center font-mono text-sm text-blue-100">
        Keys: {KEYS.map((k) => <span key={k} className="mx-0.5 rounded bg-yellow px-1 font-bold text-blue-900">{k}</span>)}
      </p>

      <div className="flex justify-center gap-2" role="group" aria-label="Choose table size">
        {OPTIONS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={m === size}
            onClick={() => setSize(m)}
            className={`h-8 rounded-md border-0 px-3 text-sm font-semibold transition-colors ${
              m === size ? "bg-white text-blue-700" : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            m = {m}
          </button>
        ))}
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {buckets.map((keys, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`flex min-h-24 w-full flex-col-reverse items-stretch gap-0.5 rounded-md p-0.5 ${
                keys.length > 1 ? "bg-red-400/20 ring-2 ring-red-400" : "bg-blue-700/40"
              }`}
              aria-label={`Slot ${i}: ${keys.length ? keys.join(", ") : "empty"}`}
            >
              {keys.map((k) => (
                <span key={k} className="rounded bg-white py-0.5 text-center text-[11px] font-bold text-blue-700">
                  {k}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-blue-100">[{i}]</span>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="min-h-10 text-center text-sm text-blue-100">
        {size === 10
          ? `All ${KEYS.length} keys land in slot 0: ${KEYS.length - 1} collisions. Every key ends in 0, so mod 10 only ever sees that last digit.`
          : `Same keys, ${used} different slots. A prime table size breaks up the pattern and spreads the keys.`}
      </p>
    </div>
  )
}
