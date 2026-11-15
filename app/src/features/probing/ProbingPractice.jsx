import { useId, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import ProbeTable from './ProbeTable'
import { Callout, KeyQueue, Stage } from './ProbingUi'
import { placeKey, PRACTICE } from './probingLogic'

const { size, keys } = PRACTICE
const emptyTable = () => Array(size).fill(null)

// Hints get more specific with each wrong click, then the answer is shown.
function hintFor({ attempts, slot, table, key, placement }) {
  const { home, path } = placement
  if (attempts === 1) {
    if (slot === home && table[slot] !== null)
      return `Slot ${slot} is the home slot for ${key}, but it already holds ${table[slot]}. That is a collision. Where does linear probing look next?`
    if (table[slot] !== null)
      return `Slot ${slot} already holds ${table[slot]}, and a slot holds one key. Begin with ${key} mod ${size} = ${home}, then follow consecutive slots.`
    return `Begin with the home-slot calculation. ${key} mod ${size} = ${home}. Then inspect consecutive slots until the first empty position.`
  }
  const taken = path.slice(0, -1)
  if (taken.length === 0)
    return `${key} mod ${size} = ${home}, and slot ${home} is still empty, so there is no collision this time.`
  const wraps = path.some((value, index) => index > 0 && value < path[index - 1])
  return `${key} starts at slot ${home}. Slot${taken.length > 1 ? 's' : ''} ${taken.join(', ')} ${
    taken.length > 1 ? 'are' : 'is'
  } taken, so keep moving one slot at a time${
    wraps ? `, wrapping from slot ${size - 1} to slot 0` : ''
  }. Which empty slot do you reach first?`
}

export default function ProbingPractice({ preferences = {} }) {
  const titleId = useId()
  const [table, setTable] = useState(emptyTable)
  const [keyIndex, setKeyIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [wrongSlot, setWrongSlot] = useState(null)
  const [status, setStatus] = useState('placing') // placing | placed | revealed | finished
  const [feedback, setFeedback] = useState(null)
  const [shown, setShown] = useState(null) // the placement to draw after a key is stored

  const key = keys[keyIndex]
  const placement = useMemo(() => placeKey(table, key), [table, key])

  function choose(slot) {
    if (status !== 'placing') return
    if (slot === placement.slot) {
      const moved = placement.path.length > 1
      setShown(placement)
      setTable(placement.table)
      setStatus('placed')
      setWrongSlot(null)
      setFeedback({
        tone: 'good',
        text: moved
          ? `Correct. ${key} mod ${size} = ${placement.home}, then the probe went ${placement.path.join(' → ')} and stored it in slot ${placement.slot}.`
          : `Correct. ${key} mod ${size} = ${placement.home}, and slot ${placement.home} was empty.`,
      })
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setWrongSlot(slot)
    if (nextAttempts >= 3) {
      setShown(placement)
      setTable(placement.table)
      setStatus('revealed')
      setWrongSlot(null)
      setFeedback({
        tone: 'warn',
        text: `Worked placement. Key ${key} follows ${placement.path.join(' → ')} and is stored in slot ${placement.slot}. The highlighted slots show the path. Follow each move before continuing with the next key.`,
      })
      return
    }
    setFeedback({ tone: 'bad', text: hintFor({ attempts: nextAttempts, slot, table, key, placement }) })
  }

  function nextKey() {
    setShown(null)
    setAttempts(0)
    setWrongSlot(null)
    setFeedback(null)
    if (keyIndex === keys.length - 1) {
      setStatus('finished')
      return
    }
    setKeyIndex((index) => index + 1)
    setStatus('placing')
  }

  function restart() {
    setTable(emptyTable())
    setKeyIndex(0)
    setAttempts(0)
    setWrongSlot(null)
    setStatus('placing')
    setFeedback(null)
    setShown(null)
  }

  const marks = {}
  if (status === 'placing' && wrongSlot !== null) marks[wrongSlot] = 'wrong'
  if ((status === 'placed' || status === 'revealed') && shown) {
    shown.path.slice(0, -1).forEach((slot) => {
      marks[slot] = 'path'
    })
    marks[shown.slot] = 'placed'
  }

  const finished = status === 'finished'

  return (
    <Stage eyebrow="GUIDED PRACTICE" title="Place each key yourself." titleId={titleId}>
      <div className="hash-probing-practice">
        <p className="hash-probing-practice-intro">
          The table has {size} slots and uses <strong>key mod {size}</strong>. For each key,
          choose the slot where linear probing stores it. Hints become more specific when you
          need support, followed by a worked placement you can inspect.
        </p>

        <KeyQueue keys={keys} currentIndex={finished ? keys.length : keyIndex} label="Insertion order" />

        {!finished && (
          <p className="hash-probing-practice-question" aria-live="polite">
            {status === 'placing' ? (
              <>Where should <strong className="hash-probing-practice-key">{key}</strong> be stored?</>
            ) : (
              <>Key <strong className="hash-probing-practice-key">{key}</strong> is stored in slot {shown.slot}.</>
            )}
          </p>
        )}

        <ProbeTable
          table={table}
          marks={marks}
          onSelect={choose}
          disabled={status !== 'placing'}
          selectLabel={`Place ${key} in slot`}
          layoutGroup="practice"
          lane={false}
          reduceMotion={preferences.reduceMotion}
        />

        <div className="hash-probing-feedback" role="status" aria-live="polite" aria-atomic="true">
          {feedback && <Callout tone={feedback.tone}>{feedback.text}</Callout>}
        </div>

        {finished && (
          <div className="hash-probing-practice-complete" role="status">
            <Callout tone="good" title="Practice sequence complete.">
              All {keys.length} keys are stored. Each placement followed the same rule. Begin at
              key mod m, preserve occupied entries, and move one slot at a time. Revisit the
              placements that needed hints, then use the knowledge check when you are ready.
            </Callout>
          </div>
        )}

        <div className="hash-probing-actions">
          <button type="button" className="secondary-button" onClick={restart}>
            <RotateCcw size={14} aria-hidden="true" /> Start again
          </button>
          {status === 'placed' || status === 'revealed' ? (
            <button type="button" className="primary-button" onClick={nextKey}>
              {keyIndex === keys.length - 1 ? 'Review practice' : 'Next key →'}
            </button>
          ) : !finished && (
            <span className="hash-probing-practice-progress">Key {keyIndex + 1} of {keys.length}</span>
          )}
        </div>
      </div>
    </Stage>
  )
}
