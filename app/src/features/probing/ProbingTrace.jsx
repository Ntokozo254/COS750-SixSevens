import { useEffect, useId, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import ProbeTable from './ProbeTable'
import { InkButton, KeyQueue, Pseudocode, Stage } from './ProbingUi'
import { buildInsertTrace, TRACE_EXAMPLES } from './probingLogic'

const SPEEDS = [
  { id: 'slow', label: 'Slow', ms: 2200 },
  { id: 'normal', label: 'Normal', ms: 1400 },
  { id: 'fast', label: 'Fast', ms: 750 },
]

function marksFor(frame) {
  const marks = {}
  if (!frame || frame.slot === null) return marks
  for (const slot of frame.path) marks[slot] = 'path'
  if (frame.phase === 'full') {
    frame.table.forEach((_, slot) => {
      marks[slot] = 'full'
    })
    return marks
  }
  const now = { check: 'check', collision: 'collision', insert: 'placed' }[frame.phase]
  if (now) marks[frame.slot] = now
  return marks
}

export default function ProbingTrace({ onTraced }) {
  const titleId = useId()
  const [exampleId, setExampleId] = useState(TRACE_EXAMPLES[0].id)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')

  const example = TRACE_EXAMPLES.find((item) => item.id === exampleId)
  const frames = useMemo(() => buildInsertTrace(example.keys, example.size), [example])
  const frame = frames[frameIndex]
  const atEnd = frameIndex === frames.length - 1
  const delay = SPEEDS.find((item) => item.id === speed).ms

  // Auto-advance while playing. The state update happens in the timer, not in the effect body.
  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => {
      const next = Math.min(frameIndex + 1, frames.length - 1)
      setFrameIndex(next)
      if (next === frames.length - 1) {
        setPlaying(false)
        onTraced?.()
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [playing, frameIndex, delay, frames.length, onTraced])

  function chooseExample(id) {
    setExampleId(id)
    setFrameIndex(0)
    setPlaying(false)
  }

  function step(delta) {
    setPlaying(false)
    const next = Math.max(0, Math.min(frames.length - 1, frameIndex + delta))
    setFrameIndex(next)
    if (next === frames.length - 1) onTraced?.()
  }

  function togglePlay() {
    if (atEnd) setFrameIndex(0)
    setPlaying((value) => !value)
  }

  function onKeyDown(event) {
    if (event.target.closest('button, select')) return
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
  }

  const incoming =
    frame.key !== null && frame.phase !== 'insert' ? { key: frame.key, slot: frame.slot } : null

  return (
    <Stage eyebrow="Step 2 of 4 · Watch it insert" title="Follow every check, collision and move." titleId={titleId}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose an example">
        {TRACE_EXAMPLES.map((item) => (
          <InkButton
            key={item.id}
            variant={item.id === exampleId ? 'on' : 'off'}
            aria-pressed={item.id === exampleId}
            onClick={() => chooseExample(item.id)}
          >
            {item.label}
          </InkButton>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-blue-100">{example.purpose}</p>

      <div
        className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-yellow @3xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] @3xl:items-start"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Trace. Use the left and right arrow keys to step."
      >
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
          <KeyQueue keys={example.keys} currentIndex={frame.keyIndex} label="Keys" note={`m = ${example.size}`} />
          <ProbeTable table={frame.table} marks={marksFor(frame)} incoming={incoming} layoutGroup="trace" />
          <p aria-live="polite" className="min-h-12 rounded-lg bg-white/5 px-3 py-2 text-sm leading-relaxed text-white">
            {frame.message}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-blue-100">
            <span>
              Step {frameIndex + 1} of {frames.length}
            </span>
            {frame.key !== null && (
              <span>
                Slots checked for {frame.key}: <strong className="text-white">{frame.checks}</strong>
              </span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <span
              className="block h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${((frameIndex + 1) / frames.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
          <Pseudocode activeLine={frame.line} />
          <ul className="m-0 grid list-none gap-1 p-0 text-[11px] text-blue-100">
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-yellow" /> key being inserted / slot being checked
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-red-400" /> collision: slot already taken (!)
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-emerald-400" /> key stored (✓)
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm outline-1 outline-dashed outline-red-300" /> already checked for this key
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <InkButton variant="ghost" aria-label="Restart" onClick={() => chooseExample(exampleId)}>
            <RotateCcw size={15} />
          </InkButton>
          <InkButton variant="ghost" aria-label="Previous step" disabled={frameIndex === 0} onClick={() => step(-1)}>
            <ChevronLeft size={16} />
          </InkButton>
          <InkButton variant="go" className="min-w-24" onClick={togglePlay}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          </InkButton>
          <InkButton variant="ghost" aria-label="Next step" disabled={atEnd} onClick={() => step(1)}>
            <ChevronRight size={16} />
          </InkButton>
        </div>
        <div className="flex items-center gap-1.5" role="group" aria-label="Playback speed">
          {SPEEDS.map((item) => (
            <InkButton
              key={item.id}
              variant={item.id === speed ? 'on' : 'off'}
              aria-pressed={item.id === speed}
              className="h-7 px-2 text-xs"
              onClick={() => setSpeed(item.id)}
            >
              {item.label}
            </InkButton>
          ))}
        </div>
      </div>
    </Stage>
  )
}
