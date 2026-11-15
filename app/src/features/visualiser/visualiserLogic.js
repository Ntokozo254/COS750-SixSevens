import { hashFunction } from '../../logic/hashing.js'

// Linear-probing operations for the Visualiser page, as step-by-step frames.
// A slot is null (never used), a whole-number key, or TOMBSTONE (deleted).
// The search rules match the Searching module: an empty slot ends a search,
// a deleted slot does not.

export const TOMBSTONE = Object.freeze({ tombstone: true })
export const MAX_KEY = 9999
export const TABLE_SIZES = [5, 7, 10, 11, 13]

export const isEmpty = (slot) => slot === null || slot === undefined
export const isDeleted = (slot) => slot !== null && typeof slot === 'object' && slot.tombstone === true
export const isKey = (slot) => typeof slot === 'number'

export const PSEUDOCODE = {
  insert: [
    { id: 'hash', text: 'index = key mod m' },
    { id: 'loop', text: 'repeat up to m times:' },
    { id: 'same', text: '  if slot holds key: already stored, stop' },
    { id: 'deleted', text: '  if slot is deleted: remember it, keep going' },
    { id: 'empty', text: '  if slot is empty: store key (in first deleted slot seen), stop' },
    { id: 'next', text: '  index = (index + 1) mod m' },
    { id: 'full', text: 'no empty slot: use first deleted slot, or table is full' },
  ],
  search: [
    { id: 'hash', text: 'index = key mod m' },
    { id: 'loop', text: 'repeat up to m times:' },
    { id: 'empty', text: '  if slot is empty: key is absent, stop' },
    { id: 'same', text: '  if slot holds key: found, stop' },
    { id: 'next', text: '  index = (index + 1) mod m   (past keys and deleted slots)' },
    { id: 'missing', text: 'checked every slot: key is absent' },
  ],
  delete: [
    { id: 'hash', text: 'index = key mod m' },
    { id: 'loop', text: 'repeat up to m times:' },
    { id: 'empty', text: '  if slot is empty: key is absent, nothing to delete' },
    { id: 'same', text: '  if slot holds key: mark it deleted, stop' },
    { id: 'next', text: '  index = (index + 1) mod m   (past keys and deleted slots)' },
    { id: 'missing', text: 'checked every slot: nothing to delete' },
  ],
}

export function emptyTable(size) {
  return Array(size).fill(null)
}

export function countKeys(slots) {
  return slots.filter(isKey).length
}

export function countDeleted(slots) {
  return slots.filter(isDeleted).length
}

export function loadFactor(slots) {
  return slots.length ? countKeys(slots) / slots.length : 0
}

// Returns null for a valid key, otherwise a message for the learner.
export function checkKey(text) {
  const trimmed = String(text ?? '').trim()
  if (trimmed === '') return 'Enter a key first.'
  if (!/^\d+$/.test(trimmed)) return 'Keys must be whole numbers, like 23.'
  if (Number(trimmed) > MAX_KEY) return `Use a key from 0 to ${MAX_KEY}.`
  return null
}

const describe = (slot) => (isEmpty(slot) ? 'empty' : isDeleted(slot) ? 'deleted' : `key ${slot}`)

// Walks the probe sequence for `key`, calling `visit` on each slot. `visit`
// returns true to stop. Adds the hash, wrap and per-slot frames as it goes.
function probe(slots, key, frames, visit) {
  const m = slots.length
  const home = hashFunction(key, m)
  const checked = []
  frames.push({
    type: 'hash',
    index: home,
    slots: [...slots],
    checked: [],
    line: 'hash',
    title: `Home slot ${home}`,
    message: `${key} mod ${m} = ${home}, so the search for a place starts at slot ${home}.`,
  })
  for (let step = 0; step < m; step += 1) {
    const index = (home + step) % m
    if (step > 0 && index === 0) {
      frames.push({
        type: 'wrap',
        index: 0,
        slots: [...slots],
        checked: [...checked],
        line: 'next',
        title: 'Wrap around',
        message: `Slot ${m - 1} is the last slot, so the next one is slot 0.`,
      })
    }
    checked.push(index)
    if (visit(index, checked)) return { home, checked, exhausted: false }
  }
  return { home, checked, exhausted: true }
}

export function insertTrace(slots, key) {
  const frames = []
  let firstDeleted = null
  let outcome = null
  const result = [...slots]

  const { home, checked, exhausted } = probe(slots, key, frames, (index, seen) => {
    const slot = slots[index]
    const base = { index, slots: [...slots], checked: [...seen] }
    if (isKey(slot) && slot === key) {
      frames.push({ ...base, type: 'duplicate', line: 'same', title: 'Already stored', message: `Slot ${index} already holds ${key}. A key is only stored once.` })
      outcome = { kind: 'duplicate', index }
      return true
    }
    if (isDeleted(slot)) {
      if (firstDeleted === null) firstDeleted = index
      frames.push({ ...base, type: 'deleted', line: 'deleted', title: `Slot ${index} is deleted`, message: `Slot ${index} is a deleted slot. It could hold ${key}, but ${key} might already be stored further along, so keep checking.` })
      return false
    }
    if (isEmpty(slot)) {
      const target = firstDeleted ?? index
      result[target] = key
      frames.push({
        ...base,
        index: target,
        type: 'insert',
        slots: [...result],
        line: 'empty',
        title: `Stored in slot ${target}`,
        message:
          target === index
            ? `Slot ${index} is empty, so ${key} is stored there.`
            : `Slot ${index} is empty, so ${key} is not in the table. It goes into the first deleted slot seen, slot ${target}.`,
      })
      outcome = { kind: 'inserted', index: target }
      return true
    }
    frames.push({ ...base, type: 'collision', line: 'next', title: `Collision at slot ${index}`, message: `Slot ${index} holds ${slot}, not ${key}. Try the next slot.` })
    return false
  })

  if (exhausted) {
    if (firstDeleted !== null) {
      result[firstDeleted] = key
      frames.push({ type: 'insert', index: firstDeleted, slots: [...result], checked, line: 'full', title: `Stored in slot ${firstDeleted}`, message: `Every slot was checked and ${key} is not stored, so it goes into the first deleted slot, slot ${firstDeleted}.` })
      outcome = { kind: 'inserted', index: firstDeleted }
    } else {
      frames.push({ type: 'full', index: null, slots: [...slots], checked, line: 'full', title: 'Table is full', message: `All ${slots.length} slots hold keys, so ${key} cannot be stored. A real table would be resized before this happens.` })
      outcome = { kind: 'full', index: null }
    }
  }

  return { op: 'insert', key, home, probes: checked.length, outcome, slots: result, frames }
}

function findTrace(op, slots, key) {
  const frames = []
  let outcome = null
  const result = [...slots]

  const { home, checked, exhausted } = probe(slots, key, frames, (index, seen) => {
    const slot = slots[index]
    const base = { index, slots: [...slots], checked: [...seen] }
    if (isEmpty(slot)) {
      frames.push({
        ...base,
        type: 'empty',
        line: 'empty',
        title: `Slot ${index} is empty`,
        message: `Slot ${index} has never been used, so ${key} cannot be further along. ${key} is not in the table${op === 'delete' ? ', so there is nothing to delete' : ''}.`,
      })
      outcome = { kind: 'missing', index: null }
      return true
    }
    if (isKey(slot) && slot === key) {
      if (op === 'delete') {
        result[index] = TOMBSTONE
        frames.push({ ...base, slots: [...result], type: 'tombstone', line: 'same', title: `Deleted from slot ${index}`, message: `Found ${key} in slot ${index}. It is marked deleted rather than emptied, so searches for keys further along still get past it.` })
        outcome = { kind: 'deleted', index }
      } else {
        frames.push({ ...base, type: 'found', line: 'same', title: `Found in slot ${index}`, message: `Slot ${index} holds ${key}. Found after checking ${seen.length} slot${seen.length === 1 ? '' : 's'}.` })
        outcome = { kind: 'found', index }
      }
      return true
    }
    frames.push({
      ...base,
      type: isDeleted(slot) ? 'deleted' : 'collision',
      line: 'next',
      title: isDeleted(slot) ? `Slot ${index} is deleted` : `Slot ${index} holds ${slot}`,
      message: isDeleted(slot)
        ? `Slot ${index} is deleted. Keep going: ${key} may have been stored past it.`
        : `Slot ${index} holds ${describe(slot)}, not ${key}. Try the next slot.`,
    })
    return false
  })

  if (exhausted) {
    frames.push({ type: 'missing', index: null, slots: [...result], checked, line: 'missing', title: 'Not in the table', message: `All ${slots.length} slots were checked without finding ${key}${op === 'delete' ? ', so there is nothing to delete' : ''}.` })
    outcome = { kind: 'missing', index: null }
  }

  return { op, key, home, probes: checked.length, outcome, slots: result, frames }
}

export const searchTrace = (slots, key) => findTrace('search', slots, key)
export const deleteTrace = (slots, key) => findTrace('delete', slots, key)

// One line for the history list.
export function summarise(trace) {
  const { op, key, probes, outcome } = trace
  const checks = `${probes} check${probes === 1 ? '' : 's'}`
  if (op === 'insert') {
    if (outcome.kind === 'inserted') return `Inserted ${key} into slot ${outcome.index} (${checks})`
    if (outcome.kind === 'duplicate') return `${key} is already in slot ${outcome.index}`
    return `Could not insert ${key}: table is full`
  }
  if (op === 'search') {
    return outcome.kind === 'found' ? `Found ${key} in slot ${outcome.index} (${checks})` : `${key} not found (${checks})`
  }
  return outcome.kind === 'deleted' ? `Deleted ${key} from slot ${outcome.index} (${checks})` : `${key} not found, nothing deleted (${checks})`
}
