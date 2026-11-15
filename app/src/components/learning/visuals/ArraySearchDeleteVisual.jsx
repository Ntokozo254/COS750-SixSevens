
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import AnimationControls from "../AnimationControls";

const TARGET = 95;
const SLOT = 56;

const spring = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

const INITIAL = [42, 17, 8, 91, 75, 33, 95].map(
  (value, i) => ({
    id: `n${i}`,
    value,
  })
);

const CAPACITY = INITIAL.length;

const SEARCH_STEPS = [
  { index: null, message: "Ready to search for 95. Click Next to begin." },
  { index: 0, message: "Index 0: Is 42 equal to 95? No. Move forward." },
  { index: 1, message: "Index 1: Is 17 equal to 95? No. Move forward." },
  { index: 2, message: "Index 2: Is 8 equal to 95? No. Move forward." },
  { index: 3, message: "Index 3: Is 91 equal to 95? No. Move forward." },
  { index: 4, message: "Index 4: Is 75 equal to 95? No. Move forward." },
  { index: 5, message: "Index 5: Is 33 equal to 95? No. Move forward." },
  { index: 6, message: "Index 6: Is 95 equal to 95? Yes! Target found." },
];

const DELETE_STEPS = [
  { index: null, message: "Ready to delete 95. Click Next to begin." },
  ...SEARCH_STEPS.slice(1, 7),
  { index: 6, message: "Found 95 at index 6. Ready to delete." },
  { index: null, message: "95 has been deleted from the array." },
];

export default function ArraySearchDeleteVisual() {
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);

  const steps = mode === "delete" ? DELETE_STEPS : SEARCH_STEPS;

  const totalSteps = steps.length;
  const currentStep = steps[step];

  const items = useMemo(() => {
    if (mode === "delete" && step === DELETE_STEPS.length - 1) {
      return INITIAL.filter((item) => item.value !== TARGET);
    }

    return INITIAL;
  }, [mode, step]);

  const current = currentStep.index;

  const found = current === 6;
  const deleted = mode === "delete" &&
    step === DELETE_STEPS.length - 1;

  const startDemo = (selectedMode) => {
    setMode(selectedMode);
    setStep(0);
  };

  const nextStep = () => {
    setStep((current) =>
      Math.min(current + 1, totalSteps - 1)
    );
  };

  const previousStep = () => {
    setStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  const reset = () => {
    setMode(null);
    setStep(0);
  };

  const statusOf = (item, index) => {
    if (found && item.value === TARGET) return "found";
    if (current === index) return "checking";
    if (current !== null && index < current) return "visited";
    return "idle";
  };

  const styles = {
    idle: "lesson-visual-slot--occupied",
    checking: "lesson-visual-slot--current",
    visited: "lesson-visual-slot--visited",
    found: "lesson-visual-slot--found",
  };

  return (
    <div data-no-swipe className="lesson-visual select-none">

      {/* Array visualisation */}
      <div className="relative h-[116px] overflow-x-auto overflow-y-hidden">

        {/* Empty slots */}
        <div className="absolute left-1 top-10 flex gap-2">
          {Array.from({ length: CAPACITY }, (_, i) => (
            <div
              key={i}
              className="lesson-visual-surface h-12 w-12 flex-none rounded-lg"
            />
          ))}
        </div>

        {/* Search pointer */}
        <motion.div
          initial={false}
          animate={{
            x: (current ?? 0) * SLOT,
            opacity: current === null || deleted ? 0 : 1,
          }}
          transition={spring}
          className="absolute left-1 top-0 flex h-10 w-12 flex-col items-center justify-end"
        >
          <span className="lesson-visual-index font-semibold">
            i = {current ?? 0}
          </span>
          <span className="lesson-visual-pointer leading-none">
            ▼
          </span>
        </motion.div>

        {/* Array elements */}
        <div className="absolute left-1 top-10 flex gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, index) => {
              const status = statusOf(item, index);

              return (
                <motion.div
                  key={item.id}
                  layout
                  transition={spring}
                  exit={{
                    opacity: 0,
                    scale: 0.4,
                    y: -16,
                  }}
                  className="flex w-12 flex-none flex-col items-center gap-1.5"
                >
                  <motion.div
                    animate={{
                      scale: status === "checking" || status === "found"
                        ? 1.12
                        : 1,
                    }}
                    transition={spring}
                    className={`lesson-visual-slot flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold transition-colors duration-300 ${styles[status]}`}
                  >
                    {item.value}
                  </motion.div>

                  <span className="lesson-visual-index">
                    [{index}]
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Explanation */}
      <p
        aria-live="polite"
        className="lesson-visual-caption mt-3 min-h-10"
      >
        {mode === null
          ? `Press Search to find ${TARGET}, or Delete to remove it.`
          : currentStep.message}
      </p>

      {/* Demonstration selection */}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => startDemo("search")}
        >
          Search for {TARGET}
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={() => startDemo("delete")}
        >
          Delete {TARGET}
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={reset}
        >
          Reset
        </Button>
      </div>

      {/* Manual animation controls */}
      {mode !== null && (
        <AnimationControls
          step={step}
          totalSteps={totalSteps}
          onPrevious={previousStep}
          onNext={nextStep}
        />
      )}

    </div>
  );
}
