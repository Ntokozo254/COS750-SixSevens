import { CODE_LINES } from './probingLogic'

// Small building blocks that copy the L01 lesson-card look:
// dark ink card, blue-200 eyebrow, white Manrope heading, blue-100 body text.

export function Stage({ eyebrow, title, children, titleId }) {
  return (
    <section
      aria-labelledby={titleId}
      className="@container grid grid-cols-[minmax(0,1fr)] gap-4 rounded-2xl bg-ink p-4 text-white shadow-xl shadow-blue-950/30 @lg:p-6"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">{eyebrow}</p>
        <h3 id={titleId} className="mt-2 font-heading text-xl font-extrabold text-white">
          {title}
        </h3>
      </header>
      {children}
    </section>
  )
}

const VARIANTS = {
  go: 'bg-emerald-500 text-white hover:bg-emerald-600',
  on: 'bg-white text-blue-700 hover:bg-white',
  off: 'bg-blue-700 text-white hover:bg-blue-800',
  ghost: 'bg-white/10 text-white hover:bg-white/20',
}

export function InkButton({ variant = 'off', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow disabled:cursor-default disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

export function Pseudocode({ activeLine = null, title = 'Insert with linear probing' }) {
  return (
    <figure className="m-0 min-w-0 overflow-x-auto rounded-xl bg-blue-950/50 p-3 ring-1 ring-white/10">
      <figcaption className="mb-2 text-[11px] font-bold uppercase tracking-widest text-blue-200">
        {title}
      </figcaption>
      <ol className="m-0 grid list-none gap-0.5 p-0 font-mono text-[12px] leading-relaxed">
        {CODE_LINES.map((line, index) => {
          const active = line.id === activeLine
          return (
            <li
              key={line.id}
              aria-current={active ? 'step' : undefined}
              className={`flex gap-2 whitespace-pre rounded px-1.5 transition-colors ${
                active ? 'bg-yellow font-bold text-blue-900' : 'text-blue-100'
              }`}
            >
              <span className={active ? 'text-blue-900' : 'text-blue-300/70'}>{index + 1}</span>
              <span>{line.text}</span>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

// Keys still to insert: stored keys are white, the current one is yellow.
export function KeyQueue({ keys, currentIndex, label = 'Keys', note = null }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-blue-100">
      {note && <span className="mr-1 font-mono text-blue-100">{note}</span>}
      <span className="font-bold uppercase tracking-widest text-blue-200">{label}</span>
      {keys.map((key, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'now' : 'next'
        return (
          <span
            key={`${key}-${index}`}
            aria-label={`${key}${state === 'done' ? ', done' : state === 'now' ? ', current key' : ', still to come'}`}
            className={`grid h-6 min-w-7 place-items-center rounded px-1.5 text-xs font-bold ${
              state === 'now'
                ? 'bg-yellow text-blue-900'
                : state === 'done'
                  ? 'bg-white/90 text-blue-700'
                  : 'bg-blue-700/40 text-blue-100 ring-1 ring-white/20'
            }`}
          >
            {key}
          </span>
        )
      })}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }) {
  const tones = {
    info: 'bg-white/5 ring-white/15',
    good: 'bg-emerald-400/15 ring-emerald-400/60',
    warn: 'bg-yellow/10 ring-yellow/60',
    bad: 'bg-red-400/15 ring-red-400/60',
  }
  return (
    <div className={`rounded-xl p-3 text-sm ring-1 ${tones[tone]}`}>
      {title && <p className="mb-1 font-bold text-white">{title}</p>}
      <div className="leading-relaxed text-blue-100">{children}</div>
    </div>
  )
}
