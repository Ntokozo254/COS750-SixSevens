import { useState } from "react"
import { Button } from "@/components/ui/button"

// Linear probing search, one line at a time. `explain` is shown when the line is highlighted.
const LINES = [
  { code: "search(key):", explain: "We are given a key and want its value (or to know it is missing)." },
  { code: "  i = hash(key) % N", explain: "Same two steps as inserting: hash the key, then squeeze it into the table with % N." },
  { code: "  while table[i] is not empty:", explain: "Keep going while there is something in the slot. An empty slot means the key was never stored." },
  { code: "    if table[i].key == key:", explain: "Compare the stored key with the one we want. Only the key is compared, not the value." },
  { code: "      return table[i].value", explain: "Match: we found it. In the best case this happens on the very first slot, O(1)." },
  { code: "    i = (i + 1) % N", explain: "No match: step to the next slot. % N wraps around from the last slot back to slot 0." },
  { code: "  return NOT_FOUND", explain: "We hit an empty slot, so the key is not in the table." },
]

export default function SearchCodeVisual() {
  const [line, setLine] = useState(0)

  return (
    <div className="select-none">
      <pre className="overflow-x-auto rounded-lg bg-blue-900/60 p-3 font-mono text-xs leading-6 sm:text-sm">
        {LINES.map((l, i) => (
          <div
            key={i}
            className={`rounded px-2 transition-colors duration-300 ${
              i === line ? "bg-amber-300 font-bold text-blue-900" : "text-blue-100"
            }`}
          >
            {l.code}
          </div>
        ))}
      </pre>

      <p aria-live="polite" className="mt-4 min-h-12 text-center text-sm text-blue-100">
        {LINES[line].explain}
      </p>

      <div data-no-swipe className="mt-3 flex items-center justify-center gap-2">
        <Button size="sm" disabled={line === 0} onClick={() => setLine(line - 1)}
          className="bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50">
          Previous line
        </Button>
        <Button size="sm" disabled={line === LINES.length - 1} onClick={() => setLine(line + 1)}
          className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50">
          Next line
        </Button>
      </div>
    </div>
  )
}
