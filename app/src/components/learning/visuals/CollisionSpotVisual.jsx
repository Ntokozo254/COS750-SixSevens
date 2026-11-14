import { useState } from "react"
import { hashFunction } from "../../../logic/hashing"
import Button from "./Button"

const N = 10
const STORED = [21, 44, 67, 90] // slots 1, 4, 7, 0
const INCOMING = [54, 38, 11, 100, 63]

const table = Array(N).fill(null)
STORED.forEach((k) => (table[hashFunction(k, N)] = k))

// Learner judges each incoming key: will it collide or not? Nothing is inserted,
// so the table stays the same and every key is judged against it.
export default function CollisionSpotVisual() {
  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState(null) // true = "collision"
  const [score, setScore] = useState(0)

  const finished = index >= INCOMING.length
  const key = finished ? null : INCOMING[index]
  const slot = key === null ? -1 : hashFunction(key, N)
  const collides = key !== null && table[slot] !== null
  const answered = guess !== null
  const correct = answered && guess === collides

  function judge(value) {
    if (answered) return
    setGuess(value)
    if (value === collides) setScore((s) => s + 1)
  }

  function next() {
    setIndex((i) => i + 1)
    setGuess(null)
  }

  return (
    <div data-no-swipe className="grid gap-3">
      <div className="grid grid-cols-10 gap-1">
        {table.map((value, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`flex aspect-square w-full items-center justify-center rounded-md text-sm font-bold transition-all ${
                answered && i === slot
                  ? collides
                    ? "bg-red-400/25 ring-2 ring-red-400"
                    : "bg-emerald-400/30 ring-2 ring-emerald-400"
                  : "bg-blue-700/40"
              }`}
            >
              {value !== null && <span className="rounded bg-white px-1 text-[11px] text-blue-700">{value}</span>}
            </div>
            <span className="text-[10px] text-blue-100">[{i}]</span>
          </div>
        ))}
      </div>

      {finished ? (
        <div className="grid gap-2 rounded-xl bg-blue-700/40 p-3 text-center">
          <p className="font-heading text-xl font-extrabold text-white">
            {score} / {INCOMING.length} spotted
          </p>
          <p className="text-sm text-blue-100">
            The test is always the same: work out k mod m, then look at that slot. Taken means collision.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setIndex(0)
                setGuess(null)
                setScore(0)
              }}
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-white">
            Key {index + 1} of {INCOMING.length}: will{" "}
            <span className="rounded bg-yellow px-1.5 font-bold text-blue-900">{key}</span> collide?
          </p>
          <div className="flex justify-center gap-2">
            <Button
              disabled={answered}
              onClick={() => judge(true)}
              className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Collision
            </Button>
            <Button
              disabled={answered}
              onClick={() => judge(false)}
              className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              No collision
            </Button>
          </div>

          <div aria-live="polite" className="min-h-12">
            {answered && (
              <p
                className={`rounded-lg p-3 text-sm ring-1 ${
                  correct ? "bg-emerald-400/15 text-emerald-100 ring-emerald-400/60" : "bg-red-400/15 text-red-100 ring-red-400/60"
                }`}
              >
                <strong className="text-white">{correct ? "Correct. " : "Not quite. "}</strong>
                {key} mod {N} = {slot}.{" "}
                {collides
                  ? `Slot ${slot} already holds ${table[slot]}, so ${key} collides with it.`
                  : `Slot ${slot} is empty, so ${key} can go straight in.`}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              disabled={!answered}
              onClick={next}
              className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {index === INCOMING.length - 1 ? "See result" : "Next key"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
