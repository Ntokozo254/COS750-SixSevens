
import { useState } from "react";
import { motion } from "motion/react";
import AnimationControls from "../AnimationControls";

const N = 10;
const KEYS = [47, 83, 21];

const spring = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

// Four stages per key:
// 0 = show key
// 1 = substitute key into formula
// 2 = calculate modulo
// 3 = place key into table

const STEPS_PER_KEY = 4;
const TOTAL_STEPS = KEYS.length * STEPS_PER_KEY;

const IDLE =
  "Ready to demonstrate how hash functions map keys to array indices.";

const DONE =
  "Each key went straight to its slot. The same rule always gives the same answer.";

export default function HashFunctionVisual() {
  const [step, setStep] = useState(0);

  // Determine which key is currently being demonstrated.
  const count = Math.min(
    Math.floor(step / STEPS_PER_KEY),
    KEYS.length - 1
  );

  // Determine the stage of the current key.
  const stage = step % STEPS_PER_KEY;

  const isComplete = step === TOTAL_STEPS;

  const current = isComplete ? null : KEYS[count];

  const slot = current === null ? -1 : current % N;

  // Keys placed before the current key.
  const placed = KEYS.slice(
    0,
    Math.floor(step / STEPS_PER_KEY) +
      (step > 0 && stage === 3 ? 1 : 0)
  );

  // Explanation for the current state.
  const getMessage = () => {
    if (isComplete) return DONE;
    if (step === 0) return IDLE;

    switch (stage) {
      case 0:
        return `Take the key ${current}. We will calculate its array index.`;

      case 1:
        return `Substitute ${current} into the formula: h(${current}) = ${current} mod ${N}.`;

      case 2:
        return `${current} mod ${N} = ${slot}. The remainder determines the array index.`;

      case 3:
        return `${current} is placed into slot ${slot}. Now move to the next key.`;

      default:
        return IDLE;
    }
  };

  const nextStep = () => {
    setStep((current) =>
      Math.min(current + 1, TOTAL_STEPS)
    );
  };

  const previousStep = () => {
    setStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  const reset = () => {
    setStep(0);
  };

  // Determine the appearance of each array slot.
  const slotStyle = (i) => {
    if (i === slot && stage === 2) {
      return "lesson-visual-slot--current";
    }

    if (i === slot && stage === 3) {
      return "lesson-visual-slot--found";
    }

    return "";
  };

  return (
    <div data-no-swipe className="lesson-visual select-none">

      {/* Hash function rule */}
      <div className="lesson-visual-rule rounded-xl px-4 py-3 text-center">
        <p className="lesson-visual-formula font-mono text-lg font-bold">
          h(
          <span className="text-[#98651d]">k</span>
          ) ={" "}
          <span className="text-[#98651d]">k</span>
          {" "}mod{" "}
          <span className="text-[#2563eb]">N</span>
        </p>

        <p className="lesson-visual-caption mt-1 text-xs">
          <span className="text-[#98651d]">k</span> is the key,{" "}
          <span className="text-[#2563eb]">N</span> is the table size ({N})
        </p>
      </div>

      {/* Worked example */}
      <div className="lesson-visual-formula mt-4 flex min-h-12 flex-wrap items-center justify-center gap-x-2 font-mono text-lg font-bold">

        {current !== null ? (
          <>
            {/* Stage 0: Show key */}
            <motion.span
              key={`${count}-${stage}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              h(
              <span className="text-[#98651d]">{current}</span>
              )
            </motion.span>

            {/* Stage 1: Substitute */}
            {stage >= 1 && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ={" "}
                <span className="text-[#98651d]">{current}</span>
                {" "}mod{" "}
                <span className="text-[#2563eb]">{N}</span>
              </motion.span>
            )}

            {/* Stage 2: Calculate */}
            {stage >= 2 && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#21674e]"
              >
                = {slot}
              </motion.span>
            )}
          </>
        ) : (
          <span className="lesson-visual-caption text-sm font-normal">
            h(k) = k mod N
          </span>
        )}
      </div>

      {/* Hash table */}
      <div className="mt-3 grid grid-cols-10 gap-1">
        {Array.from({ length: N }, (_, i) => {

          const key = placed.find(
            (k) => k % N === i
          );

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`lesson-visual-slot relative aspect-square w-full rounded-md transition-all duration-300 ${slotStyle(i)}`}
              >
                {key !== undefined && (
                  <motion.div
                    initial={{ y: -70, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={spring}
                    className="lesson-visual-slot lesson-visual-slot--occupied absolute inset-0.5 z-10 flex items-center justify-center rounded text-sm font-bold"
                  >
                    {key}
                  </motion.div>
                )}
              </div>

              <span
                className={`lesson-visual-index text-[10px] ${
                  i === slot ? "font-bold" : ""
                }`}
              >
                [{i}]
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <p
        aria-live="polite"
        className="lesson-visual-caption mt-3 min-h-10 text-center text-sm"
      >
        {getMessage()}
      </p>

      {/* Manual navigation */}
      <AnimationControls
        step={step}
        totalSteps={TOTAL_STEPS + 1}
        onPrevious={previousStep}
        onNext={nextStep}
      />

      {/* Reset */}
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          className="secondary-button"
          onClick={reset}
        >
          Reset demonstration
        </button>
      </div>

    </div>
  );
}
