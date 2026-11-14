import { motion, useReducedMotion } from 'motion/react'

// The slot table, drawn in the same style as the L01 lesson cards:
// blue slots on the dark ink card, white key chips, and the key being
// inserted as a yellow chip that glides above the slot it is checking.
//
// marks: { [slotIndex]: 'check' | 'collision' | 'placed' | 'path' | 'wrong' | 'full' }
const SLOT_STYLE = {
  check: 'bg-yellow/20 ring-2 ring-yellow',
  collision: 'bg-red-400/40 ring-2 ring-red-400',
  placed: 'bg-emerald-400/30 ring-2 ring-emerald-400',
  path: 'bg-blue-700/40 outline-1 outline-dashed outline-offset-1 outline-red-300/80',
  wrong: 'bg-red-400/30 ring-2 ring-red-400',
  full: 'bg-red-400/25 ring-1 ring-red-400/70',
}

const MARK_LABEL = {
  check: 'checking',
  collision: 'collision',
  placed: 'just stored',
  path: 'already checked',
  wrong: 'not this one',
  full: 'full',
}

export default function ProbeTable({
  table,
  marks = {},
  incoming = null, // { key, slot }
  onSelect,
  selectLabel = 'Place the key in slot',
  disabled = false,
  layoutGroup = 'probe',
  lane = true, // the space above the slots where the yellow key waits
}) {
  const reduceMotion = useReducedMotion()
  const size = table.length
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }

  return (
    <div className="mx-auto w-full select-none" style={{ maxWidth: `${size * 3.1}rem` }}>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {table.map((value, index) => {
          const mark = marks[index]
          const shake = !reduceMotion && (mark === 'collision' || mark === 'wrong')
          const label = `Slot ${index}${value === null ? ', empty' : `, holds ${value}`}${
            mark ? `, ${MARK_LABEL[mark]}` : ''
          }`

          const slotBody = (
            <>
              {value !== null && (
                <motion.span
                  layout={!reduceMotion}
                  initial={false}
                  animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0.5 z-10 flex items-center justify-center rounded bg-white text-xs font-bold text-blue-700 shadow-lg shadow-blue-950/40 @lg:text-sm"
                >
                  {value}
                </motion.span>
              )}
              {mark === 'placed' && (
                <span aria-hidden="true" className="absolute -right-1 -top-1 z-20 grid size-3.5 place-items-center rounded-full bg-emerald-400 text-[8px] font-black text-ink">
                  ✓
                </span>
              )}
              {mark === 'collision' && (
                <span aria-hidden="true" className="absolute -right-1 -top-1 z-20 grid size-3.5 place-items-center rounded-full bg-red-400 text-[9px] font-black text-white">
                  !
                </span>
              )}
            </>
          )

          const slotClass = `relative aspect-square w-full rounded-md border-0 p-0 transition-all duration-300 ${
            SLOT_STYLE[mark] ?? 'bg-blue-700/40'
          }`

          return (
            <div key={index} className="flex min-w-0 flex-col items-center gap-1">
              {/* Arrival lane: the yellow key waits above the slot it is checking */}
              <div className={lane ? 'aspect-square w-full' : 'hidden'}>
                {incoming && incoming.slot === index && (
                  <motion.div
                    layoutId={`${layoutGroup}-incoming`}
                    transition={spring}
                    initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full w-full items-center justify-center rounded bg-yellow text-xs font-bold text-blue-900 shadow-lg shadow-blue-950/40 @lg:text-sm"
                  >
                    {incoming.key}
                  </motion.div>
                )}
              </div>

              {onSelect ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(index)}
                  aria-label={`${selectLabel} ${index}. ${label}`}
                  className={`${slotClass} cursor-pointer hover:ring-2 hover:ring-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow disabled:cursor-default disabled:hover:ring-0`}
                >
                  {slotBody}
                </button>
              ) : (
                <div className={slotClass} role="img" aria-label={label}>
                  {slotBody}
                </div>
              )}

              <span className="text-[10px] text-blue-100">[{index}]</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
