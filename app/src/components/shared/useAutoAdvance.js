import { useEffect } from "react"

// Auto mode: move to the next step after `delay` ms, until the last step.
export function useAutoAdvance(active, step, last, delay, setStep) {
  useEffect(() => {
    if (!active || step >= last) return
    const t = setTimeout(() => setStep(step + 1), delay)
    return () => clearTimeout(t)
  }, [active, step, last, delay, setStep])
}
