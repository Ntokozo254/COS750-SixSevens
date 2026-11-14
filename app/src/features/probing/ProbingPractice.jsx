import { useId, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import ProbeTable from './ProbeTable'
import { Callout, InkButton, KeyQueue, Stage } from './ProbingUi'
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
      return `Slot ${slot} already holds ${table[slot]}, and a slot holds one key. Start from the home slot: ${key} mod ${size} = ${home}.`
    return `Not slot ${slot}. Start from the home slot: ${key} mod ${size} = ${home}.`
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

export default function ProbingPractice({ onContinue }) {
  const titleId = useId()
  const [table, setTable] = useState(emptyTable)
  const [keyIndex, setKeyIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [wrongSlot, setWrongSlot] = useState(null)
  const [status, setStatus] = useState('placing') // placing | placed | revealed | finished
  const [firstTry, setFirstTry] = useState(0)
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
      if (attempts === 0) setFirstTry((count) => count + 1)
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
        text: `Here is the answer: ${key} follows ${placement.path.join(' → ')} and is stored in slot ${placement.slot}. The dashed slots show the path.`,
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
    setFirstTry(0)
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
    <Stage eyebrow="Step 3 of 4 · Your turn" title="Place each key yourself." titleId={titleId}>
      <p className="text-sm leading-relaxed text-blue-100">
        The table has {size} slots and uses <strong className="text-white">key mod {size}</strong>. For each key, click
        the slot where linear probing stores it. A wrong click gives you a hint, and after three tries the answer is
        shown.
      </p>

      <KeyQueue keys={keys} currentIndex={finished ? keys.length : keyIndex} label="To place" />

      {!finished && (
        <p className="text-base font-bold text-white" aria-live="polite">
          Where does <span className="rounded bg-yellow px-1.5 text-blue-900">{key}</span> go?
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
      />

      <div aria-live="polite">
        {feedback && <Callout tone={feedback.tone}>{feedback.text}</Callout>}
      </div>

      {finished ? (
        <Callout tone="good" title={`You placed ${firstTry} of ${keys.length} keys on your first try.`}>
          {firstTry === keys.length
            ? 'Every placement was right first time, including the wrap-around. You are ready for the knowledge check.'
            : 'Look back at the keys that needed a hint. Each one followed the same rule: start at key mod m and move one slot at a time.'}
        </Callout>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <InkButton variant="ghost" onClick={restart}>
          <RotateCcw size={14} /> Start again
        </InkButton>
        {status === 'placed' || status === 'revealed' ? (
          <InkButton variant="go" onClick={nextKey}>
            {keyIndex === keys.length - 1 ? 'See my result' : 'Next key →'}
          </InkButton>
        ) : finished ? (
          <InkButton variant="go" onClick={onContinue}>
            Go to the knowledge check →
          </InkButton>
        ) : (
          <span className="text-[11px] text-blue-200">
            Key {keyIndex + 1} of {keys.length} · Attempt {attempts + 1} of 3
          </span>
        )}
      </div>
    </Stage>
  )
}
