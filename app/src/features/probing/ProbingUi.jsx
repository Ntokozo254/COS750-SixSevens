import { CODE_LINES } from './probingLogic'

export function Stage({ eyebrow, title, children, titleId }) {
  return (
    <section className="hash-probing-stage" aria-labelledby={titleId}>
      <header>
        <span className="eyebrow">{eyebrow}</span>
        <h2 id={titleId}>{title}</h2>
      </header>
      {children}
    </section>
  )
}

// Preserve the existing component API while using the application's shared buttons.
export function InkButton({ variant = 'off', className = '', ...props }) {
  const buttonClass = variant === 'go' ? 'primary-button' : 'secondary-button'
  return <button type="button" className={`${buttonClass} hash-probing-button ${className}`} {...props} />
}

export function Pseudocode({ activeLine = null, title = 'Insert with linear probing' }) {
  return (
    <figure className="hash-probing-code">
      <figcaption>{title}</figcaption>
      <ol>
        {CODE_LINES.map((line, index) => (
          <li key={line.id} aria-current={line.id === activeLine ? 'step' : undefined}>
            <span aria-hidden="true" className="hash-probing-code-number">{index + 1}</span>
            <code>{line.text}</code>
          </li>
        ))}
      </ol>
    </figure>
  )
}

export function KeyQueue({ keys, currentIndex, label = 'Keys', note = null }) {
  return (
    <div className="hash-probing-key-queue" role="group" aria-label={label}>
      {note && <span>{note}</span>}
      <strong>{label}</strong>
      {keys.map((key, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'now' : 'next'
        return (
          <span
            key={`${key}-${index}`}
            className="hash-probing-key"
            data-state={state}
            aria-label={`${key}, ${state === 'done' ? 'processed' : state === 'now' ? 'current key' : 'still to come'}`}
          >
            {key}{state === 'now' && <small>current</small>}
          </span>
        )
      })}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }) {
  return (
    <div className="hash-probing-callout" data-tone={tone}>
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  )
}
