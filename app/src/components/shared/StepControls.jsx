import { Button } from "@/components/ui/button"

// Prev / Next buttons so students move through a walkthrough at their own pace.
export default function StepControls({ step, total, onPrev, onNext, disabled = false }) {
  return (
    <div data-no-swipe className="mt-3 flex items-center justify-center gap-2">
      <Button
        size="sm"
        disabled={disabled || step <= 0}
        onClick={onPrev}
        className="bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
      >
        ← Prev
      </Button>
      <span className="min-w-16 text-center text-xs text-blue-100">
        {disabled ? "–" : `Step ${step + 1} / ${total}`}
      </span>
      <Button
        size="sm"
        disabled={disabled || step >= total - 1}
        onClick={onNext}
        className="bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50"
      >
        Next →
      </Button>
    </div>
  )
}
