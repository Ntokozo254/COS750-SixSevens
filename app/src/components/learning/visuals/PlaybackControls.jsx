import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react"
import { InkButton } from "../../../features/probing/ProbingUi"
import { SPEEDS } from "./usePlayback"

// Step counter, progress bar, and restart / back / play-pause / forward / speed buttons,
// matching the linear probing trace. Takes the object returned by usePlayback.
export default function PlaybackControls({ playback }) {
  const { frameIndex, frameCount, playing, speed, setSpeed, atEnd, step, togglePlay, restart } = playback
  return (
    <>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-blue-100">
        <span className="whitespace-nowrap">
          Step {frameIndex + 1} of {frameCount}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${((frameIndex + 1) / frameCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <InkButton variant="ghost" aria-label="Restart" onClick={restart}>
            <RotateCcw size={15} />
          </InkButton>
          <InkButton variant="ghost" aria-label="Previous step" disabled={frameIndex === 0} onClick={() => step(-1)}>
            <ChevronLeft size={16} />
          </InkButton>
          <InkButton variant="go" className="min-w-24" onClick={togglePlay}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </InkButton>
          <InkButton variant="ghost" aria-label="Next step" disabled={atEnd} onClick={() => step(1)}>
            <ChevronRight size={16} />
          </InkButton>
        </div>
        <div className="flex items-center gap-1.5" role="group" aria-label="Playback speed">
          {SPEEDS.map((item) => (
            <InkButton
              key={item.id}
              variant={item.id === speed ? "on" : "off"}
              aria-pressed={item.id === speed}
              className="h-7 px-2 text-xs"
              onClick={() => setSpeed(item.id)}
            >
              {item.label}
            </InkButton>
          ))}
        </div>
      </div>
    </>
  )
}
