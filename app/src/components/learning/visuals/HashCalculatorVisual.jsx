import { useState } from "react"
import { motion } from "motion/react"
import { hashFunction } from "../../../logic/hashing"

const SIZES = [7, 10, 11]

// Learner picks a key and a table size, and sees key mod m worked out
// as a division with a remainder, then the slot it lands in.
export default function HashCalculatorVisual() {
  const [input, setInput] = useState("47")
  const [size, setSize] = useState(10)

  const key = Number(input)
  const valid = input.trim() !== "" && Number.isInteger(key) && key >= 0 && key <= 9999
  const slot = valid ? hashFunction(key, size) : null
  const quotient = valid ? Math.floor(key / size) : null

  return (
    <div data-no-swipe className="grid gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[11px] font-bold uppercase tracking-widest text-blue-200">
          Key
          <input
            type="number"
            min="0"
            max="9999"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-9 w-24 rounded-md border-0 bg-white px-2 font-mono text-base font-bold text-blue-700 outline-none focus-visible:ring-2 focus-visible:ring-yellow"
          />
        </label>

        <fieldset className="m-0 grid gap-1 border-0 p-0">
          <legend className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-200">
            Table size m
          </legend>
          <div className="flex gap-1">
            {SIZES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={m === size}
                onClick={() => setSize(m)}
                className={`h-9 min-w-10 rounded-md border-0 px-2 font-mono text-sm font-bold transition-colors ${
                  m === size ? "bg-yellow text-blue-900" : "bg-blue-700/40 text-white hover:bg-blue-700/60"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div aria-live="polite" className="min-h-16 rounded-xl bg-blue-700/40 px-4 py-3 text-center font-mono">
        {valid ? (
          <>
            <p className="text-lg font-bold text-white">
              h(<span className="text-yellow">{key}</span>) = {key} mod {size} ={" "}
              <span className="text-emerald-300">{slot}</span>
            </p>
            <p className="mt-1 text-xs text-blue-100">
              {key} ÷ {size} = {quotient} remainder <strong className="text-emerald-300">{slot}</strong>. The
              remainder is the slot.
            </p>
          </>
        ) : (
          <p className="text-sm text-blue-200">Type a whole number from 0 to 9999.</p>
        )}
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`relative aspect-square w-full rounded-md transition-colors ${
                i === slot ? "bg-emerald-400/30 ring-2 ring-emerald-400" : "bg-blue-700/40"
              }`}
            >
              {i === slot && (
                <motion.div
                  key={`${key}-${size}`}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute inset-0.5 flex items-center justify-center rounded bg-white text-[11px] font-bold text-blue-700"
                >
                  {key}
                </motion.div>
              )}
            </div>
            <span className={`text-[10px] ${i === slot ? "font-bold text-white" : "text-blue-100"}`}>[{i}]</span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-blue-100">
        Try the same key with a different table size. The slot changes, but it is always between 0 and m − 1.
      </p>
    </div>
  )
}
