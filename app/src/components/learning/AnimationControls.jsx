
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "./visuals/Button"

export default function AnimationControls({
  step,
  totalSteps,
  onPrevious,
  onNext,
  onPlay,
}) {
  return (
    <div data-no-swipe className="mt-3 flex items-center justify-center gap-2">
      <Button
        type="button"
        className="secondary-button"
        onClick={onPrevious}
        disabled={step === 0}
        aria-label="Previous animation step"
      >
        <ChevronLeft size={15} />
        Previous
      </Button>

      <span
        className="lesson-visual-index mx-2 text-xs"
        role="status"
        aria-live="polite"
      >
        Step {step + 1} of {totalSteps}
      </span>

      <Button
        type="button"
        className="secondary-button"
        onClick={onNext}
        disabled={step === totalSteps - 1}
        aria-label="Next animation step"
      >
        Next <ChevronRight size={15} />
      </Button>

      {onPlay && (
        <Button
          type="button"
          variant="primary"
          onClick={onPlay}
          className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
         
          Play
        </Button>
      )}
    </div>
  )
}
