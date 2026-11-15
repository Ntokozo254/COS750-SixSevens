import { useEffect, useId, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
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
  const now = { check: 'check', collision: 'collision', insert: 'placed', duplicate: 'check' }[frame.phase]
  if (now) marks[frame.slot] = now
  return marks
}

export default function ProbingTrace({ onTraced, active = true, preferences = {} }) {
  const titleId = useId()
  const frameId = `${titleId}-frame`
  const motionNoteId = `${titleId}-motion-note`
  const [exampleId, setExampleId] = useState(TRACE_EXAMPLES[0].id)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const systemReduceMotion = useReducedMotion()
  const reduceMotion = Boolean(preferences.reduceMotion || systemReduceMotion)
  const canAutoPlay = active && !reduceMotion
  const isPlaying = playing && canAutoPlay

  const example = TRACE_EXAMPLES.find((item) => item.id === exampleId)
  const frames = useMemo(() => buildInsertTrace(example.keys, example.size), [example])
  const frame = frames[frameIndex]
  const atEnd = frameIndex === frames.length - 1
  const delay = SPEEDS.find((item) => item.id === speed).ms

  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => {
      if (!canAutoPlay) {
        setPlaying(false)
        return
      }
      const next = Math.min(frameIndex + 1, frames.length - 1)
      setFrameIndex(next)
      if (next === frames.length - 1) {
        setPlaying(false)
        onTraced?.()
      }
    }, canAutoPlay ? delay : 0)
    return () => clearTimeout(timer)
  }, [playing, canAutoPlay, frameIndex, delay, frames.length, onTraced])

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
    if (!canAutoPlay) return
    if (atEnd) setFrameIndex(0)
    setPlaying((value) => !value)
  }

  function onKeyDown(event) {
    if (event.target.closest('button, select, input, textarea')) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      step(event.key === 'ArrowRight' ? 1 : -1)
    }
  }

  const incoming =
    frame.key !== null && frame.phase !== 'insert' ? { key: frame.key, slot: frame.slot } : null

  return (
    <Stage
      eyebrow="WORKED INSERTION EXAMPLE"
      title="Follow each check, collision, and placement."
      titleId={titleId}
    >
      <div className="hash-probing-example-options" role="group" aria-label="Choose an insertion example">
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
      <p className="hash-probing-description">{example.purpose}</p>
      <p className="hash-probing-description">
        Use Next and Previous to choose your pace. The highlighted pseudocode line explains the
        current action. You can also focus the trace and use the left and right arrow keys.
      </p>

      <div
        className="hash-probing-trace-layout"
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="group"
        aria-label="Insertion trace. Use left and right arrow keys to step."
      >
        <div className="hash-probing-trace-visual">
          <KeyQueue
            keys={example.keys}
            currentIndex={frame.keyIndex}
            label="Insertion order"
            note={`Table capacity m = ${example.size}`}
          />
          <ProbeTable
            table={frame.table}
            marks={marksFor(frame)}
            incoming={incoming}
            layoutGroup="trace"
            reduceMotion={reduceMotion}
          />
          <p
            id={frameId}
            className="hash-probing-trace-explanation"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {frame.message}
          </p>
          <div className="hash-probing-trace-meta">
            <span>Step {frameIndex + 1} of {frames.length}</span>
            {frame.key !== null && (
              <span>
                For key {frame.key}, <strong>{frame.checks}</strong>{' '}
                {frame.checks === 1 ? 'slot' : 'slots'} checked
              </span>
            )}
          </div>
          <progress
            className="hash-probing-trace-progress"
            aria-label="Insertion walkthrough progress"
            aria-valuetext={`Step ${frameIndex + 1} of ${frames.length}`}
            value={frameIndex + 1}
            max={frames.length}
          >
            Step {frameIndex + 1} of {frames.length}
          </progress>
        </div>

        <div className="hash-probing-trace-code">
          <Pseudocode activeLine={frame.line} />
          <ul className="hash-probing-legend" aria-label="Insertion trace legend">
            <li>
              <span className="hash-probing-legend-key hash-probing-legend-key--check" aria-hidden="true">?</span>
              Checking the current slot.
            </li>
            <li>
              <span className="hash-probing-legend-key hash-probing-legend-key--collision" aria-hidden="true">!</span>
              Collision marks an occupied slot.
            </li>
            <li>
              <span className="hash-probing-legend-key hash-probing-legend-key--placed" aria-hidden="true">✓</span>
              Stored marks a completed insertion.
            </li>
            <li>
              <span className="hash-probing-legend-key hash-probing-legend-key--path" aria-hidden="true" />
              Dashed outline marks a slot already checked for this key.
            </li>
          </ul>
        </div>
      </div>

      <div className="hash-probing-controls">
        <div className="hash-probing-transport" role="group" aria-label="Insertion playback controls">
          <InkButton variant="ghost" aria-label="Restart" onClick={() => chooseExample(exampleId)}>
            <RotateCcw size={15} aria-hidden="true" /> Restart
          </InkButton>
          <InkButton
            variant="ghost"
            aria-label="Previous step"
            disabled={frameIndex === 0}
            aria-controls={frameId}
            onClick={() => step(-1)}
          >
            <ChevronLeft size={16} aria-hidden="true" /> Previous
          </InkButton>
          <InkButton
            variant="go"
            disabled={!canAutoPlay}
            aria-describedby={reduceMotion ? motionNoteId : undefined}
            aria-controls={frameId}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            {isPlaying ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          </InkButton>
          <InkButton
            variant="ghost"
            aria-label="Next step"
            disabled={atEnd}
            aria-controls={frameId}
            onClick={() => step(1)}
          >
            Next <ChevronRight size={16} aria-hidden="true" />
          </InkButton>
        </div>
        <div className="hash-probing-speed" role="group" aria-label="Playback speed">
          {SPEEDS.map((item) => (
            <InkButton
              key={item.id}
              variant={item.id === speed ? 'on' : 'off'}
              aria-pressed={item.id === speed}
              disabled={reduceMotion}
              onClick={() => setSpeed(item.id)}
            >
              {item.label}
            </InkButton>
          ))}
        </div>
      </div>
      <p className="hash-probing-playback-status" role="status" aria-live="polite">
        {isPlaying ? 'Automatic playback is running.' : 'Automatic playback is paused.'}
      </p>
      {reduceMotion && (
        <p className="hash-probing-motion-note" id={motionNoteId}>
          Reduced motion is on. Use Next, Previous, or the arrow keys to advance the example manually.
        </p>
      )}
    </Stage>
  )
}
