
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

export default function StepControls({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onReset
}) {
  return (
    <div className="step-controls">
      <button
        className="secondary-button"
        onClick={onReset}
      >
        <RotateCcw size={16} />
        Reset
      </button>

      <div className="step-indicator">
        Step {totalSteps === 0 ? 0 : currentStep + 1} of {totalSteps}
      </div>

      <div className="step-buttons">
        <button
          className="secondary-button"
          onClick={onPrevious}
          disabled={currentStep <= 0}
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <button
          className="primary-button"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1 || totalSteps === 0}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
