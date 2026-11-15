import { hashFunction } from '../../logic/hashing.js'
import { insertLinearProbing } from '../../logic/linearProbing.js'

export const MAX_COLLISION_SLOTS = 12
export const MAX_COLLISION_KEYS = 12

function validateInputs(keys, capacity) {
  if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > MAX_COLLISION_SLOTS) {
    throw new RangeError(`Choose a table size from 1 to ${MAX_COLLISION_SLOTS}.`)
  }
  if (!Array.isArray(keys) || keys.length < 1 || keys.length > MAX_COLLISION_KEYS) {
    throw new RangeError(`Use from 1 to ${MAX_COLLISION_KEYS} keys.`)
  }
  for (const key of keys) {
    if (!Number.isSafeInteger(key) || key < 0 || key > 1_000_000) {
      throw new RangeError('Use whole-number keys from 0 to 1,000,000.')
    }
  }
}

export function parseCollisionInputs(text, capacity) {
  if (typeof text !== 'string' || text.trim() === '') {
    return { keys: null, error: 'Enter at least one key.' }
  }
  const tokens = text.split(',').map((token) => token.trim())
  if (tokens.some((token) => !/^\d+$/.test(token))) {
    return { keys: null, error: 'Separate whole-number keys with commas, with no empty entries.' }
  }
  const keys = tokens.map(Number)
  try {
    validateInputs(keys, capacity)
    return { keys, error: null }
  } catch (error) {
    return { keys: null, error: error.message }
  }
}

export function getCollisionHomes(keys, capacity) {
  validateInputs(keys, capacity)
  const seen = new Set()
  const homes = new Map()
  return keys.map((key) => {
    const home = hashFunction(key, capacity)
    const duplicate = seen.has(key)
    const collision = !duplicate && homes.has(home)
    seen.add(key)
    homes.set(home, true)
    return { key, home, duplicate, collision }
  })
}

function recordStep(steps, table, buckets, details) {
  steps.push({
    table: [...table],
    buckets: buckets.map((bucket) => [...bucket]),
    index: null,
    home: null,
    ...details,
  })
}

export function createCollisionTrace(keys, capacity, method = 'probing') {
  validateInputs(keys, capacity)
  if (method !== 'probing' && method !== 'chaining') {
    throw new TypeError('Choose linear probing or separate chaining.')
  }

  let table = Array(capacity).fill(null)
  const buckets = Array.from({ length: capacity }, () => [])
  const placements = []
  const steps = []
  recordStep(steps, table, buckets, {
    type: 'ready',
    title: 'Begin with empty storage',
    text: `Use h(key) = key mod ${capacity}. Each distinct key keeps its own entry.`,
  })

  for (const key of keys) {
    const home = hashFunction(key, capacity)
    recordStep(steps, table, buckets, {
      type: 'hash', key, home, index: home,
      title: `Calculate the home slot for ${key}`,
      text: `${key} mod ${capacity} = ${home}. Begin at slot ${home}.`,
    })

    if (method === 'chaining') {
      const duplicate = buckets[home].includes(key)
      if (!duplicate) buckets[home].push(key)
      placements.push({ key, home, index: home, status: duplicate ? 'duplicate' : 'stored' })
      recordStep(steps, table, buckets, {
        type: duplicate ? 'duplicate' : 'stored', key, home, index: home,
        title: duplicate ? `Key ${key} already exists` : `Store ${key} in bucket ${home}`,
        text: duplicate
          ? 'This is the same key again. Keep its existing entry.'
          : `Bucket ${home} now holds [${buckets[home].join(', ')}]. Keys sharing a home slot stay together in that bucket.`,
      })
      continue
    }

    const result = insertLinearProbing([...table], key)
    for (const event of result.steps) {
      const storedKey = event.table[event.index]
      let title = `Inspect slot ${event.index}`
      let text = storedKey === null
        ? `Slot ${event.index} is empty and can hold the new key.`
        : `Slot ${event.index} holds ${storedKey}. Compare it with ${key}.`
      if (event.type === 'collision') {
        title = `Slot ${event.index} is occupied`
        const next = (event.index + 1) % capacity
        text = `Preserve key ${storedKey}. Next inspect (${event.index} + 1) mod ${capacity} = ${next}.${next === 0 ? ' This wraps to the first slot.' : ''}`
      }
      if (event.type === 'insert') {
        title = `Store ${key} at slot ${event.index}`
        text = `The home slot is ${home}; the final slot is ${event.index}. Existing entries keep their positions.`
      }
      recordStep(steps, event.table, buckets, {
        type: event.type, key, home, index: event.index, title, text,
      })
    }

    table = [...result.table]
    const index = result.success ? result.steps.at(-1).index : table.indexOf(key)
    const status = result.success ? 'stored' : index >= 0 ? 'duplicate' : 'full'
    placements.push({ key, home, index: index >= 0 ? index : null, status })
    if (!result.success) {
      recordStep(steps, table, buckets, {
        type: status, key, home, index: index >= 0 ? index : null,
        title: status === 'duplicate' ? `Key ${key} already exists` : `The table has no free slot for ${key}`,
        text: status === 'duplicate'
          ? `Keep the existing key at slot ${index}. Inserting the same key again is a duplicate request.`
          : `All ${capacity} slots were checked. Report the table full and preserve every stored key.`,
      })
    }
  }

  return {
    method,
    capacity,
    keys: [...keys],
    table: [...table],
    buckets: buckets.map((bucket) => [...bucket]),
    placements,
    steps,
  }
}
