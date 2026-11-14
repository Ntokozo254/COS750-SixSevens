import { useState } from "react"
import { hashFunction } from "../../../logic/hashing"
import Button from "./Button"

const N = 10
const KEYS = [64, 17, 39, 84, 52, 27, 90, 11, 48, 75, 33] // 11 keys, 10 slots

// Add keys one at a time and count how many share a slot.
// Shows two things: collisions start early, and 11 keys in 10 slots must collide.
export default function PigeonholeVisual() {
  const [count, setCount] = useState(0)

  const buckets = Array.from({ length: N }, () => [])
  KEYS.slice(0, count).forEach((k) => buckets[hashFunction(k, N)].push(k))
  const collisions = buckets.reduce((sum, b) => sum + Math.max(0, b.length - 1), 0)

  // The first key that landed in an already-used slot.
  let firstCollisionAt = null
  const seen = new Set()
  for (let i = 0; i < count; i++) {
    const slot = hashFunction(KEYS[i], N)
    if (seen.has(slot)) {
      firstCollisionAt = i + 1
      break
    }
    seen.add(slot)
  }

  let message = `Press "Add key" to insert keys into ${N} slots.`
  if (count > N) message = `${count} keys, only ${N} slots: at least one collision is guaranteed. This is the pigeonhole principle.`
  else if (firstCollisionAt !== null)
    message = `The first collision came after just ${firstCollisionAt} keys, with most of the table still empty.`
  else if (count > 0) message = `${count} keys, no collisions yet.`

  return (
    <div data-no-swipe className="grid gap-3">
      <div className="grid grid-cols-10 gap-1">
        {buckets.map((keys, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`flex min-h-20 w-full flex-col-reverse gap-0.5 rounded-md p-0.5 transition-colors ${
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

      <div className="flex flex-wrap justify-center gap-4 text-[11px] text-blue-100">
        <span>
          Keys: <strong className="text-white">{count}</strong> / {N} slots
        </span>
        <span>
          Collisions: <strong className={collisions ? "text-red-300" : "text-white"}>{collisions}</strong>
        </span>
      </div>

      <p aria-live="polite" className="min-h-10 text-center text-sm text-blue-100">
        {message}
      </p>

      <div className="flex justify-center gap-2">
        <Button
          disabled={count >= KEYS.length}
          onClick={() => setCount((c) => c + 1)}
          className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {count < KEYS.length ? `Add key ${KEYS[count]}` : "All keys added"}
        </Button>
        <Button disabled={count === 0} onClick={() => setCount(0)} className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50">
          Reset
        </Button>
      </div>
    </div>
  )
}
