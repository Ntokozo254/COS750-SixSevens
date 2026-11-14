import { useId, useState } from 'react'
import ProbeTable from './ProbeTable'
import { Callout, InkButton, Pseudocode, Stage } from './ProbingUi'

// Warm-up: predict before being told (activates the collision idea from Module 1/3).
const WARMUP_TABLE = [null, null, 12, null, null, null, null, null, null, null]
const WARMUP_ANSWER = 3

const RULE = [
  { title: 'Hash', text: 'Work out the home slot: index = key mod m.' },
  { title: 'Check', text: 'If that slot is empty, store the key there. Done.' },
  {
    title: 'Move on',
    text: 'If it is taken (a collision), try the next slot: (index + 1) mod m. After the last slot comes slot 0.',
  },
]

const MIXUPS = [
  ['A collision means the key is rejected.', 'The key is still stored, just further along the table.'],
  ['The new key replaces the old one.', 'Keys already in the table never move. Only the new key keeps looking.'],
  ['When you reach the last slot, you stop.', 'You wrap around to slot 0 and keep checking.'],
  ['The step size depends on the key.', 'Linear probing always moves exactly one slot at a time.'],
]

export default function ProbingLearn({ onNext }) {
  const titleId = useId()
  const [guess, setGuess] = useState(null)
  const solved = guess === WARMUP_ANSWER

  const warmupTable = solved ? WARMUP_TABLE.map((value, i) => (i === WARMUP_ANSWER ? 22 : value)) : WARMUP_TABLE
  const marks = guess === null ? {} : solved ? { 2: 'path', 3: 'placed' } : { [guess]: 'wrong' }

  let feedback = null
  if (guess !== null) {
    if (solved)
      feedback = {
        tone: 'good',
        text: 'Yes. 22 mod 10 = 2, slot 2 is taken by 12, so 22 moves one slot along to slot 3. That move is linear probing.',
      }
    else if (guess === 2)
      feedback = {
        tone: 'bad',
        text: 'Slot 2 is the right place to start, but 12 is already there and keys are never overwritten. Where could 22 go instead?',
      }
    else
      feedback = {
        tone: 'bad',
        text: `Not slot ${guess}. 22 mod 10 = 2, so start at slot 2. It is taken, so look at the very next slot.`,
      }
  }

  return (
    <Stage eyebrow="Step 1 of 4 · Understand" title="A collision does not stop the insert." titleId={titleId}>
      <p className="text-sm leading-relaxed text-blue-100">
        In Module 1 you saw two keys land in the same slot: a <strong className="text-white">collision</strong>. Linear
        probing is the simplest fix. The new key walks forward one slot at a time until it finds an empty one. The array
        stays the same size; the key just moves along.
      </p>

      <Callout tone="info" title="Before we explain it: predict">
        <p className="m-0">
          A 10-slot table stores student numbers using <strong className="text-white">key mod 10</strong>. Slot 2 already
          holds 12. Where do you think <span className="rounded bg-yellow px-1 font-bold text-blue-900">22</span> will go?
          Click a slot.
        </p>
      </Callout>
      <ProbeTable
        table={warmupTable}
        marks={marks}
        onSelect={setGuess}
        disabled={solved}
        selectLabel="Predict 22 goes in slot"
        layoutGroup="warmup"
        lane={false}
      />
      <div aria-live="polite">{feedback && <Callout tone={feedback.tone}>{feedback.text}</Callout>}</div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @2xl:grid-cols-2 @2xl:items-start">
        <div className="grid min-w-0 gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">The rule, in three steps</p>
          <ol className="m-0 grid list-none gap-2 p-0">
            {RULE.map((item, index) => (
              <li key={item.title} className="flex gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <span className="grid size-6 flex-none place-items-center rounded-md bg-yellow text-[11px] font-extrabold text-blue-900">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-blue-100">
                  <strong className="text-white">{item.title}.</strong> {item.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <Pseudocode />
      </div>

      <div className="grid gap-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Common mix-ups</p>
        <ul className="m-0 grid list-none gap-2 p-0 @xl:grid-cols-2">
          {MIXUPS.map(([wrong, right]) => (
            <li key={wrong} className="rounded-xl bg-white/5 p-3 text-sm ring-1 ring-white/10">
              <p className="text-red-300">
                <span aria-hidden="true">✗ </span>
                <span className="sr-only">Mix-up: </span>
                {wrong}
              </p>
              <p className="mt-1 text-emerald-300">
                <span aria-hidden="true">✓ </span>
                <span className="sr-only">Actually: </span>
                {right}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <Callout tone="warn" title="How much work is an insert?">
        Each check is one step. When the table is mostly empty, a key usually finds space in 1 or 2 checks, so insert is
        expected O(1). As the table fills, collided keys form long runs and an insert can check up to all m slots: O(m) in
        the worst case. That is why tables are resized before they get too full, the topic of Module 6.
      </Callout>

      <div className="flex justify-end">
        <InkButton variant="go" onClick={onNext}>
          Watch it insert →
        </InkButton>
      </div>
    </Stage>
  )
}
