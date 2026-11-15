import { motion, useReducedMotion } from 'motion/react'

const MARK_LABEL = {
  check: 'checking',
  collision: 'collision',
  placed: 'just stored',
  path: 'already checked',
  wrong: 'try another slot',
  full: 'full',
}

export default function ProbeTable({
  table,
  marks = {},
  incoming = null,
  onSelect,
  selectLabel = 'Place the key in slot',
  disabled = false,
  layoutGroup = 'probe',
  lane = true,
  reduceMotion = false,
}) {
  const systemReducedMotion = useReducedMotion()
  const staticMotion = reduceMotion || systemReducedMotion

  return (
    <div
      className="hash-probing-table"
      role="group"
      aria-label={`Linear-probing table with ${table.length} slots`}
      style={{ gridTemplateColumns: `repeat(${Math.min(table.length, 5)}, minmax(0, 1fr))` }}
    >
      {table.map((value, index) => {
        const mark = marks[index]
        const arriving = incoming?.slot === index
        const label = `Slot ${index}${value === null ? ', empty' : `, holds ${value}`}${mark ? `, ${MARK_LABEL[mark]}` : ''}`
        const contents = (
          <>
            <span className="hash-probing-slot-index">Slot {index}</span>
            <strong className="hash-probing-slot-value">{value === null ? 'Empty' : value}</strong>
            {mark && <span className="hash-probing-slot-state">{MARK_LABEL[mark]}</span>}
          </>
        )
        return (
          <div className="hash-probing-table-cell" key={index}>
            {lane && (
              <div className="hash-probing-arrival-lane" aria-hidden="true">
                {arriving && (
                  <motion.span
                    className="hash-probing-incoming"
                    layoutId={staticMotion ? undefined : `${layoutGroup}-incoming`}
                    initial={staticMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: staticMotion ? 0 : 0.2 }}
                  >Key {incoming.key}</motion.span>
                )}
              </div>
            )}
            {onSelect ? (
              <button
                type="button"
                className="hash-probing-slot"
                data-mark={mark}
                disabled={disabled}
                onClick={() => onSelect(index)}
                aria-label={`${selectLabel} ${index}. ${label}`}
              >{contents}</button>
            ) : (
              <div className="hash-probing-slot" data-mark={mark} role="img" aria-label={label}>
                {contents}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
