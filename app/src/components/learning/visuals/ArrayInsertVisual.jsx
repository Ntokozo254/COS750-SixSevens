import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Button } from "./Button"

const MAX = 7
const spring = { type: "spring", stiffness: 380, damping: 30 }

let nextId = 1
const rand = () => Math.floor(Math.random() * 90) + 10
const makeArray = (fresh = false) =>
  Array.from({ length: 5 }, () => ({ id: nextId++, value: rand(), fresh }))

export default function ArrayInsertVisual() {
  const [items, setItems] = useState(() => makeArray(false))
  const [gapAt, setGapAt] = useState(null) // index where the gap is open, or null
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("Choose where to insert a new element.")
  const timers = useRef([])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const full = items.length >= MAX

  const newArray = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setGapAt(null)
    setBusy(false)
    setItems(makeArray(true))
    setMessage("New array created. Choose where to insert.")
  }

  const insertAt = (index) => {
    if (busy || full) return
    const shifted = items.length - index
    const newItem = { id: nextId++, value: rand(), fresh: true }

    setBusy(true)
    setMessage(
      shifted > 0
        ? `Inserting at index ${index}: ${shifted} element${shifted > 1 ? "s" : ""} must shift right to make space.`
        : `Inserting at the end (index ${index}): nothing needs to shift.`
    )
    setGapAt(index) // phase 1: open the gap, everything after it slides right

    const t1 = setTimeout(() => {
      // phase 2: drop the new value into the gap
      setItems((prev) => [...prev.slice(0, index), newItem, ...prev.slice(index)])
      setGapAt(null)
      setMessage(`Inserted ${newItem.value} at index ${index}.`)
    }, 800)
    const t2 = setTimeout(() => setBusy(false), 1300)
    timers.current.push(t1, t2)
  }

  const display =
    gapAt === null
      ? items
      : [...items.slice(0, gapAt), { id: "gap", gap: true, fresh: true }, ...items.slice(gapAt)]

  return (
    // data-no-swipe stops the carousel from swiping when you use these controls
    <div data-no-swipe className="lesson-visual select-none">
      {/* Fixed-capacity array: empty slots in the back, blocks on top */}
      <div className="relative h-[76px] overflow-x-auto overflow-y-hidden">
        <div className="absolute left-0 top-0 flex gap-2">
          {Array.from({ length: MAX }, (_, i) => (
            <div key={i} className="lesson-visual-surface h-12 w-12 flex-none rounded-lg" />
          ))}
        </div>

        <div className="absolute left-0 top-0 flex gap-2">
          {display.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              transition={spring}
              initial={item.fresh ? { opacity: 0, y: -28, scale: 0.6 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex w-12 flex-none flex-col items-center gap-1.5"
            >
              {item.gap ? (
                <div className="lesson-visual-gap h-12 w-12 rounded-lg" />
              ) : (
                <div className="lesson-visual-slot lesson-visual-slot--occupied flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold">
                  {item.value}
                </div>
              )}
              <span className="lesson-visual-index">[{i}]</span>
            </motion.div>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="lesson-visual-caption mt-3 min-h-10">
        {full ? `Array is full (${MAX}/${MAX} slots). Make a new array to keep going.` : message}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy || full} onClick={() => insertAt(0)}>
          Insert at beginning
        </Button>
        <Button size="sm" disabled={busy || full} onClick={() => insertAt(Math.floor(items.length / 2))}>
          Insert in middle
        </Button>
        <Button size="sm" disabled={busy || full} onClick={() => insertAt(items.length)}>
          Insert at end
        </Button>
        <Button size="sm" variant="primary" onClick={newArray}>
          New array
        </Button>
      </div>
    </div>
  )
}
