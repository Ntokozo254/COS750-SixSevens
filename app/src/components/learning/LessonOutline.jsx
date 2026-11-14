import { ListChecks } from "lucide-react"

export default function LessonOutline({ cards, index, onSelect }) {
  return (
    <div className="side-card max-sm:hidden">
      <div className="side-card-heading">
        <span className="mini-icon"><ListChecks size={17} /></span>
        IN THIS LESSON
      </div>

      <h3>Card {index + 1} of {cards.length}</h3>
      <div className="progress-line">
        <span style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
      </div>

      <ol className="grid gap-1">
        {cards.map((card, i) => {
          const active = i === index
          return (
            <li key={card.id}>
              <button type="button" onClick={() => onSelect(i)} aria-current={active ? "step" : undefined}
                className={`flex w-full bg-white border border-tan border-radius b items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] transition-colors ${
                  active ? "bg-blue-50 font-bold text-blue-600" : "text-slate-500 hover:bg-slate-50"
                }`}>
                <span className={`grid size-5 flex-none place-items-center rounded-md text-[10px] font-extrabold ${
                  active ? "bg-sky-950 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {i + 1}
                </span>
                <span className="truncate">{card.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}