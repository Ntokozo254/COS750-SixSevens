import { hashFunction } from './hashing.js'

function readSlots(table) {
  let slots
  if (Array.isArray(table)) {
    slots = table
  } else {
    if (!table || typeof table !== 'object' || !Array.isArray(table.slots)) {
      throw new TypeError('Provide a slots array or a table with size and slots.')
    }
    if (!Number.isSafeInteger(table.size) || table.size <= 0 || table.slots.length !== table.size) {
      throw new TypeError('The table size must be positive and match its slots array.')
    }
    slots = table.slots
  }

  if (slots.length === 0) throw new Error('The hash table cannot be empty.')

  for (const slot of slots) {
    if (slot === null || slot === undefined) continue
    if (typeof slot === 'number' && Number.isSafeInteger(slot)) continue
    if (typeof slot === 'object' && !Array.isArray(slot)) {
      if (slot.tombstone === true || Number.isSafeInteger(slot.key)) continue
    }
    throw new TypeError(
      'Each slot must contain an integer key, a key/value entry, a tombstone, or an empty value.',
    )
  }

  return slots
}

function copySlots(slots) {
  return Array.from(slots, (slot) => structuredClone(slot))
}

function isEmpty(slot) {
  return slot === null || slot === undefined
}

function isDeleted(slot) {
  return slot !== null && typeof slot === 'object' && slot.tombstone === true
}

function slotKey(slot) {
  return typeof slot === 'number' ? slot : slot.key
}

// Keep one `check` frame per inspected slot for the existing visualiser callers.
export function searchLinearProbing(table, key) {
  const slots = readSlots(table)
  if (!Number.isSafeInteger(key)) throw new TypeError('Key must be a safe integer.')

  const tableSize = slots.length
  const homeIndex = hashFunction(key, tableSize)
  const steps = []

  for (let checked = 0; checked < tableSize; checked += 1) {
    const index = (homeIndex + checked) % tableSize
    const slot = slots[index]
    steps.push({
      index,
      key,
      value: structuredClone(slot),
      table: copySlots(slots),
      type: 'check',
      message: `Checking slot ${index}.`,
    })

    if (!isEmpty(slot) && !isDeleted(slot) && slotKey(slot) === key) {
      return {
        found: true,
        index,
        steps,
        message: `Key ${key} found at slot ${index}.`,
        checks: checked + 1,
        homeIndex,
        reason: 'found',
      }
    }

    if (isEmpty(slot)) {
      return {
        found: false,
        index: -1,
        steps,
        message: `Key ${key} was not found. An empty slot was reached.`,
        checks: checked + 1,
        homeIndex,
        reason: 'empty',
      }
    }
  }

  return {
    found: false,
    index: -1,
    steps,
    message: `Key ${key} was not found after checking the table.`,
    checks: tableSize,
    homeIndex,
    reason: 'exhausted',
  }
}

export function createSearchTrace(table, key) {
  const result = searchLinearProbing(table, key)
  const slots = result.steps[0].table
  const checkedIndices = []
  const steps = [
    {
      type: 'hash',
      index: result.homeIndex,
      table: copySlots(slots),
      title: 'Calculate the starting slot',
      message: `Hash key ${key} into ${slots.length} slots. Its home slot is ${result.homeIndex}.`,
      line: 1,
      checkedIndices: [],
      checks: 0,
      matchIndex: null,
    },
  ]

  for (const check of result.steps) {
    if (checkedIndices.length > 0 && check.index === 0) {
      steps.push({
        type: 'wrap',
        index: 0,
        table: copySlots(slots),
        title: 'Wrap to slot zero',
        message: 'The probe sequence has reached the end of the table. Continue from slot 0.',
        line: 3,
        checkedIndices: [...checkedIndices],
        checks: checkedIndices.length,
        matchIndex: null,
      })
    }

    checkedIndices.push(check.index)
    let type = 'collision'
    let title = `Continue past slot ${check.index}`
    let message
    let line = 6
    let matchIndex = null

    if (isEmpty(check.value)) {
      type = 'empty'
      title = `Empty slot ${check.index}`
      message = 'A genuinely empty slot ends this probe sequence. The target is absent.'
      line = 4
    } else if (isDeleted(check.value)) {
      type = 'deleted'
      title = `Deleted slot ${check.index}`
      message =
        'A tombstone preserves the probe sequence. Continue searching for a key stored farther along.'
    } else if (slotKey(check.value) === key) {
      type = 'found'
      title = `Found key ${key}`
      message = `Slot ${check.index} holds the target key. Return index ${check.index}.`
      line = 5
      matchIndex = check.index
    } else {
      message = `Slot ${check.index} holds key ${slotKey(check.value)}. Continue to the next slot.`
    }

    steps.push({
      type,
      index: check.index,
      table: copySlots(slots),
      title,
      message,
      line,
      checkedIndices: [...checkedIndices],
      checks: checkedIndices.length,
      matchIndex,
    })
  }

  if (!result.found) {
    steps.push({
      type: 'missing',
      index: null,
      table: copySlots(slots),
      title: 'Key absent',
      message: result.message,
      line: result.reason === 'empty' ? 4 : 7,
      checkedIndices: [...checkedIndices],
      checks: result.checks,
      matchIndex: null,
    })
  }

  return {
    found: result.found,
    index: result.index,
    homeIndex: result.homeIndex,
    checks: result.checks,
    reason: result.reason,
    message: result.message,
    steps,
  }
}
