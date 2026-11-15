import { ListChecks } from "lucide-react"

export default function LessonOutline({ cards, index, onSelect }) {
  return (
    <nav className="side-card lesson-outline" aria-label="In this lesson">
      <div className="side-card-heading">
        <span className="mini-icon"><ListChecks size={17} aria-hidden="true" /></span>
        IN THIS LESSON
      </div>
      <h3>Explore the fundamentals</h3>
      <p className="lesson-outline-position">Card {index + 1} of {cards.length}</p>
      <div className="progress-line" aria-hidden="true"><span style={{ width: ((index + 1) / cards.length) * 100 + "%" }} /></div>
      <ol className="lesson-outline-list">
        {cards.map((card, cardIndex) => {
          const active = cardIndex === index
          return (
            <li key={card.id}>
              <button type="button" className="lesson-outline-button" onClick={() => onSelect(cardIndex)} aria-current={active ? "step" : undefined}>
                <span className="lesson-outline-number" aria-hidden="true">{cardIndex + 1}</span>
                <span>{card.title.trim()}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
