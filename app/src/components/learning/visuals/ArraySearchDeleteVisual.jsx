import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "./Button"

const TARGET = 95
const STEP = 1000 // ms spent "checking" each element. Raise it to go slower.
const SLOT = 56 // 48px block + 8px gap
const spring = { type: "spring", stiffness: 380, damping: 30 }

const INITIAL = [42, 17, 8, 91, 75, 33, 95].map((value, i) => ({ id: `n${i}`, value }))
const CAPACITY = INITIAL.length

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const styles = {
  idle: "bg-white text-blue-700",
  checking: "bg-yellow text-blue-900",
  visited: "bg-white/35 text-blue-100",
  found: "bg-emerald-400 text-white",
  deleting: "bg-red-400 text-white",
}
const scales = { checking: 1.12, found: 1.12, deleting: 0.92 }

export default function ArraySearchDeleteVisual() {
  const [items, setItems] = useState(INITIAL)
  const [current, setCurrent] = useState(null) // index the pointer is on
  const [visited, setVisited] = useState([]) // ids already ruled out
  const [foundId, setFoundId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(
    `Press Search to look for ${TARGET}, or Delete to remove it.`
  )

  // Each run gets an id. If the id changes (Reset or unmount), the old run stops.
  const runRef = useRef(0)
  useEffect(() => () => { runRef.current = -1 }, [])

  const clearMarks = () => {
    setCurrent(null)
    setVisited([])
    setFoundId(null)
    setDeletingId(null)
    setAsking(false)
  }

  const reset = () => {
    runRef.current += 1
    clearMarks()
    setItems(INITIAL)
    setBusy(false)
    setMessage(`Press Search to look for ${TARGET}, or Delete to remove it.`)
  }

  const run = async (mode) => {
    if (busy) return
    const id = ++runRef.current
    const stale = () => runRef.current !== id
    const arr = items

    setBusy(true)
    clearMarks()
    setMessage(`Looking for ${TARGET}: start at index 0 and check each element in turn.`)
    await sleep(700)
    if (stale()) return

    // Linear search: visit each element until we find the target or run out
    let foundIdx = -1
    for (let i = 0; i < arr.length; i++) {
      setCurrent(i)
      setMessage(`Index ${i}: is ${arr[i].value} equal to ${TARGET}?`)
      await sleep(STEP)
      if (stale()) return

      if (arr[i].value === TARGET) {
        foundIdx = i
        break
      }
      setVisited((v) => [...v, arr[i].id])
      setMessage(`${arr[i].value} is not ${TARGET}. Move to the next element.`)
      await sleep(550)
      if (stale()) return
    }

    // Reached the end without a match
    if (foundIdx === -1) {
      setCurrent(null)
      setMessage(
        `Reached the end after ${arr.length} comparisons: ${TARGET} is not in the array.` +
          (mode === "delete" ? " Nothing to delete." : "")
      )
      setBusy(false)
      return
    }

    const hit = arr[foundIdx]
    setFoundId(hit.id)
    setMessage(
      `Found ${TARGET} at index ${foundIdx} after ${foundIdx + 1} comparison${foundIdx ? "s" : ""}.`
    )

    if (mode === "search") {
      setBusy(false)
      return
    }

    // Delete: ask, then remove it anyway
    await sleep(1000)
    if (stale()) return
    setAsking(true)
    setMessage(`Delete ${TARGET}?`)
    await sleep(1800)
    if (stale()) return

    setAsking(false)
    setDeletingId(hit.id)
    setMessage("Deleting...")
    await sleep(700)
    if (stale()) return

    const shifted = arr.length - 1 - foundIdx
    setItems(arr.filter((x) => x.id !== hit.id))
    clearMarks()
    setMessage(
      `Deleted ${TARGET}. ` +
        (shifted
          ? `The ${shifted} element${shifted > 1 ? "s" : ""} after it shifted left to close the gap.`
          : "It was the last element, so nothing had to shift.")
    )
    setBusy(false)
  }

  const statusOf = (item, i) => {
    if (deletingId === item.id) return "deleting"
    if (foundId === item.id) return "found"
    if (current === i && foundId === null) return "checking"
    if (visited.includes(item.id)) return "visited"
    return "idle"
  }

  return (
    // data-no-swipe stops the carousel from swiping when you use these controls
    <div data-no-swipe className="select-none">
      <div className="relative h-[116px] overflow-x-auto overflow-y-hidden">
        {/* Empty slots (the array's fixed capacity) */}
        <div className="absolute left-1 top-10 flex gap-2">
          {Array.from({ length: CAPACITY }, (_, i) => (
            <div key={i} className="h-12 w-12 flex-none rounded-lg bg-blue-700/40" />
          ))}
        </div>

        {/* The pointer. It slides along the array, and turns into the "Delete?" bubble */}
        <motion.div
          initial={false}
          animate={{ x: (current ?? 0) * SLOT, opacity: current === null ? 0 : 1 }}
          transition={spring}
          className="absolute left-1 top-0 flex h-10 w-12 flex-col items-center justify-end"
        >
          {asking ? (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <span className="whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-xs font-bold text-blue-700 shadow-lg">
                  Delete {TARGET}?
                </span>
                <span className="leading-none text-white">▼</span>
              </motion.div>
            </div>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-blue-100">i = {current ?? 0}</span>
              <span className="leading-none text-white">▼</span>
            </>
          )}
        </motion.div>

        {/* The array */}
        <div className="absolute left-1 top-10 flex gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, i) => {
              const status = statusOf(item, i)
              return (
                <motion.div
                  key={item.id}
                  layout
                  transition={spring}
                  exit={{ opacity: 0, scale: 0.4, y: -16 }}
                  className="flex w-12 flex-none flex-col items-center gap-1.5"
                >
                  <motion.div
                    animate={{ scale: scales[status] ?? 1 }}
                    transition={spring}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold shadow-lg shadow-blue-950/40 transition-colors duration-300 ${styles[status]}`}
                  >
                    {item.value}
                  </motion.div>
                  <span className="text-xs text-blue-100">[{i}]</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-10 text-sm text-blue-100">
        {message}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => run("search")}
          className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50">
          Search for {TARGET}
        </Button>
        <Button size="sm" disabled={busy} onClick={() => run("delete")}
          className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
          Delete {TARGET}
        </Button>
        <Button size="sm" onClick={reset}
          className="bg-blue-700 text-white hover:bg-blue-800">
          Reset
        </Button>
      </div>
    </div>
  )
}