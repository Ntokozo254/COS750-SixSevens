// Turns the shared insertLinearProbing() steps into animation frames.
// The same logic drives the trace, the practice marking and the tests,
// so what students watch is exactly what the algorithm does.
import { hashFunction } from '../../logic/hashing.js'
import { insertLinearProbing } from '../../logic/linearProbing.js'

export const CODE_LINES = [
  { id: 'hash', text: 'index = key mod m' },
  { id: 'loop', text: 'repeat at most m times:' },
  { id: 'empty', text: '  if slot[index] is empty:' },
  { id: 'store', text: '    store key in slot[index]; stop' },
  { id: 'next', text: '  index = (index + 1) mod m' },
  { id: 'full', text: 'table is full: resize it (Module 6)' },
]

// Worked examples for the trace. The first one builds the exact table that
// Module 5 searches in its "Found after collisions" example.
export const TRACE_EXAMPLES = [
  {
    id: 'cluster',
    label: 'Collisions in a row',
    size: 10,
    keys: [12, 22, 32, 9, 19],
    purpose: 'Three keys share home slot 2, and 19 wraps around. This builds the table you will search in Module 5.',
  },
  {
    id: 'wrap',
    label: 'Wrap around',
    size: 7,
    keys: [6, 13, 20],
    purpose: 'Slot 6 is the last slot, so a collision there continues at slot 0.',
  },
  {
    id: 'full',
    label: 'A full table',
    size: 3,
    keys: [5, 10, 15, 20],
    purpose: 'Three slots, four keys. Watch what happens when every slot is taken.',
  },
]

// Keys for "Your turn": collisions, a longer probe and a wrap-around.
export const PRACTICE = { size: 10, keys: [15, 25, 35, 8, 18, 29] }

const nextSlot = (index, size) => (index + 1) % size

// Where would `key` end up? Returns the probe path and the final slot (null when full).
export function placeKey(table, key) {
  const result = insertLinearProbing([...table], key)
  const path = result.steps.filter((step) => step.type === 'check').map((step) => step.index)
  const inserted = result.steps.find((step) => step.type === 'insert')
  return {
    home: hashFunction(key, table.length),
    path,
    slot: inserted ? inserted.index : null,
    table: result.table,
    success: result.success,
  }
}

// Frames for the step-by-step trace.
// Each frame: { phase, key, keyIndex, slot, path, table, line, message, checks }
export function buildInsertTrace(keys, size) {
  let table = Array(size).fill(null)
  const frames = [
    {
      phase: 'start',
      key: null,
      keyIndex: -1,
      slot: null,
      path: [],
      table: [...table],
      line: null,
      checks: 0,
      message: `An empty table with ${size} slots (m = ${size}). Press Play or Next to insert ${keys.join(', ')}.`,
    },
  ]

  keys.forEach((key, keyIndex) => {
    const home = hashFunction(key, size)
    const result = insertLinearProbing([...table], key)
    const path = []
    const base = { key, keyIndex }

    frames.push({
      ...base,
      phase: 'hash',
      slot: home,
      path: [],
      table: [...table],
      line: 'hash',
      checks: 0,
      message: `Insert ${key}: ${key} mod ${size} = ${home}, so start at slot ${home}.`,
    })

    for (const step of result.steps) {
      if (step.type === 'check') {
        path.push(step.index)
        frames.push({
          ...base,
          phase: 'check',
          slot: step.index,
          path: [...path],
          table: [...table],
          line: 'empty',
          checks: path.length,
          message: `Is slot ${step.index} empty?`,
        })
      } else if (step.type === 'collision') {
        const next = nextSlot(step.index, size)
        const wraps = next === 0
        frames.push({
          ...base,
          phase: 'collision',
          slot: step.index,
          path: [...path],
          table: [...table],
          line: 'next',
          checks: path.length,
          message: `Collision: slot ${step.index} already holds ${table[step.index]}. ${
            wraps
              ? `That was the last slot, so wrap around to slot 0.`
              : `Move to the next slot, ${step.index} + 1 = ${next}.`
          }`,
        })
      } else if (step.type === 'insert') {
        table = [...step.table]
        frames.push({
          ...base,
          phase: 'insert',
          slot: step.index,
          path: [...path],
          table: [...table],
          line: 'store',
          checks: path.length,
          message: `Slot ${step.index} is empty, so ${key} is stored there after checking ${path.length} ${
            path.length === 1 ? 'slot' : 'slots'
          }.`,
        })
      }
    }

    if (!result.success) {
      frames.push({
        ...base,
        phase: 'full',
        slot: home,
        path: [...path],
        table: [...table],
        line: 'full',
        checks: path.length,
        message: `All ${size} slots were checked and none is empty. ${key} cannot be stored until the table is resized.`,
      })
    }
  })

  const stored = table.filter((value) => value !== null).length
  frames.push({
    phase: 'done',
    key: null,
    keyIndex: keys.length,
    slot: null,
    path: [],
    table: [...table],
    line: null,
    checks: 0,
    message: `Done. ${stored} of ${keys.length} keys are stored. Every key sits at its home slot or further along the probe path.`,
  })

  return frames
}
