import { CheckCircle2, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react'

// Shared step navigation for the multi-step lessons (Modules 4 and 5), so they
// share one look: round prev/next buttons with dots underneath the content,
// and an "In this lesson" list in the aside.

const navButton =
  'grid size-11 flex-none place-items-center rounded-full border-0 bg-white text-blue-700 shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-50 disabled:opacity-40'

export function StepNav({ steps, index, onSelect }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <button
        type="button"
        aria-label="Previous step"
        disabled={index === 0}
        onClick={() => onSelect(index - 1)}
        className={navButton}
      >
        <ChevronLeft size={20} />
      </button>
      <div className="flex items-center gap-1.5">
        {steps.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to step ${i + 1}: ${item.title}`}
            aria-current={i === index ? 'step' : undefined}
            onClick={() => onSelect(i)}
            className={`h-2 rounded-full border-0 p-0 transition-all ${
              i === index ? 'w-6 bg-blue-600' : 'w-2 bg-blue-200 hover:bg-blue-300'
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Next step"
        disabled={index === steps.length - 1}
        onClick={() => onSelect(index + 1)}
        className={navButton}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

// `isDone(item, active)` decides which steps get a tick.
export function StepOutline({ steps, index, onSelect, isDone }) {
  return (
    <div className="side-card">
      <div className="side-card-heading">
        <span className="mini-icon">
          <ListChecks size={17} />
        </span>
        IN THIS LESSON
      </div>
      <h3>
        Step {index + 1} of {steps.length}
      </h3>
      <div className="progress-line">
        <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      <ol className="m-0 grid list-none gap-1 p-0">
        {steps.map((item, i) => {
          const active = i === index
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-xl border border-tan px-2.5 py-2 text-left text-[11px] transition-colors ${
                  active ? 'bg-blue-50 font-bold text-blue-600' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`grid size-5 flex-none place-items-center rounded-md text-[10px] font-extrabold ${
                    active ? 'bg-sky-950 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate">{item.title}</span>
                {isDone?.(item, active) && <CheckCircle2 size={14} className="text-emerald-500" aria-label="visited" />}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
