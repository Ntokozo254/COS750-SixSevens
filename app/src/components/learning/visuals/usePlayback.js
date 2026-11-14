import { useEffect, useState } from "react"

// Shared play / pause / step / speed state for frame-based lesson animations.
// Pair with <PlaybackControls>.

export const SPEEDS = [
  { id: "slow", label: "Slow", ms: 1800 },
  { id: "normal", label: "Normal", ms: 1100 },
  { id: "fast", label: "Fast", ms: 600 },
]

export function usePlayback(frameCount) {
  const last = frameCount - 1
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState("normal")
  const delay = SPEEDS.find((item) => item.id === speed).ms
  const atEnd = frameIndex === last

  // Auto-advance while playing. The state update happens in the timer, not in the effect body.
  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => {
      const next = Math.min(frameIndex + 1, last)
      setFrameIndex(next)
      if (next === last) setPlaying(false)
    }, delay)
    return () => clearTimeout(timer)
  }, [playing, frameIndex, delay, last])

  function step(delta) {
    setPlaying(false)
    setFrameIndex((i) => Math.max(0, Math.min(last, i + delta)))
  }

  function togglePlay() {
    if (atEnd) setFrameIndex(0)
    setPlaying((value) => !value)
  }

  function restart() {
    setPlaying(false)
    setFrameIndex(0)
  }

  // Put on the visual's wrapper (with tabIndex={0}) for arrow-key stepping.
  function onKeyDown(event) {
    if (event.target.closest("button, input")) return
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.stopPropagation() // keep the lesson carousel from also changing card
      step(event.key === "ArrowRight" ? 1 : -1)
    }
  }

  return { frameIndex, frameCount, playing, speed, setSpeed, atEnd, step, togglePlay, restart, onKeyDown }
}
