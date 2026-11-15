import { hashFunction } from '../../logic/hashing.js'
import { insertLinearProbing } from '../../logic/linearProbing.js'
import { searchLinearProbing } from '../../logic/searching.js'

export const MAX_SANDBOX_CAPACITY = 20
export const MAX_SANDBOX_KEYS = 20
export const MAX_SANDBOX_KEY = 1_000_000

function validateCapacity(capacity) {
  if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > MAX_SANDBOX_CAPACITY) {
    throw new RangeError('Choose a whole-number capacity from 1 to 20.')
  }
}

function validateKey(key) {
  if (!Number.isSafeInteger(key) || key < 0 || key > MAX_SANDBOX_KEY) {
    throw new RangeError('Use whole-number keys from 0 to 1,000,000.')
  }
}

function validateTable(table) {
  if (!Array.isArray(table)) throw new TypeError('Provide an array of table slots.')
  validateCapacity(table.length)
  const keys = new Set()
  for (const slot of table) {
    if (slot === null) continue
    validateKey(slot)
    if (keys.has(slot)) throw new TypeError('Each stored key must have its own unique entry.')
    keys.add(slot)
  }
}

export function parseSandboxKey(text) {
  if (typeof text !== 'string' || text.length > 32 || !/^\d+$/.test(text.trim())) {
    throw new TypeError('Enter a whole-number key from 0 to 1,000,000.')
  }
  const key = Number(text.trim())
  validateKey(key)
  return key
}

export function parseSandboxInputs(capacityText, keysText) {
  if (typeof capacityText !== 'string' || capacityText.length > 32 || !/^\d+$/.test(capacityText.trim())) {
    throw new TypeError('Enter a whole-number capacity from 1 to 20.')
  }
  const capacity = Number(capacityText.trim())
  validateCapacity(capacity)
  if (typeof keysText !== 'string' || keysText.length > 400) {
    throw new TypeError('Use at most 20 comma-separated keys from 0 to 1,000,000.')
  }
  const tokens = keysText.trim() === '' ? [] : keysText.split(',')
  if (tokens.length > MAX_SANDBOX_KEYS) throw new RangeError('Build with at most 20 keys at a time.')
  const keys = tokens.map(parseSandboxKey)
  return { capacity, keys }
}

export function runSandboxOperation(table, operation, key) {
  validateTable(table)
  validateKey(key)
  if (operation !== 'insert' && operation !== 'search') {
    throw new TypeError('Choose insertion or search.')
  }

  const initialTable = [...table]
  const home = hashFunction(key, table.length)
  if (operation === 'search') {
    const result = searchLinearProbing(initialTable, key)
    return {
      operation,
      key,
      home,
      initialTable: [...initialTable],
      table: [...initialTable],
      status: result.found ? 'found' : 'missing',
      reason: result.reason,
      index: result.found ? result.index : null,
      probes: result.checks,
      path: result.steps.map((step) => step.index),
      message: result.message,
      nextAction: result.found
        ? 'Try a different key and compare which slots are inspected.'
        : result.reason === 'empty'
          ? 'Insert this key to see it use an available position along the same probe sequence.'
          : 'Every slot has been checked once. Reset or rebuild with free capacity before adding a new distinct key.',
      steps: result.steps,
    }
  }

  const result = insertLinearProbing([...initialTable], key)
  const checks = result.steps.filter((step) => step.type === 'check')
  const stored = result.steps.find((step) => step.type === 'insert')
  const duplicate = !result.success && initialTable.includes(key)
  const status = result.success ? 'inserted' : duplicate ? 'duplicate' : 'full'
  const index = stored?.index ?? (duplicate ? initialTable.indexOf(key) : null)
  let message = `Key ${key} was inserted at slot ${index}.`
  let nextAction = `Search for ${key} to follow its home slot and probe sequence.`
  if (duplicate) {
    message = `Key ${key} already exists at slot ${index}. Its existing entry is preserved.`
    nextAction = 'Search for the existing key, or choose a different key to add another entry.'
  } else if (!result.success) {
    message = `All ${table.length} slots are occupied. Key ${key} could not be added.`
    nextAction = 'Rebuild with more free slots, or reset the current table before inserting a new key.'
  }

  return {
    operation,
    key,
    home,
    initialTable,
    table: [...result.table],
    status,
    reason: status,
    index,
    probes: checks.length,
    path: checks.map((step) => step.index),
    message,
    nextAction,
    steps: result.steps,
  }
}

export function buildSandboxTable(capacity, keys = []) {
  validateCapacity(capacity)
  if (!Array.isArray(keys) || keys.length > MAX_SANDBOX_KEYS) {
    throw new TypeError('Build with an array of at most 20 keys.')
  }
  for (const key of keys) validateKey(key)

  let table = Array(capacity).fill(null)
  const outcomes = []
  for (const key of keys) {
    const result = runSandboxOperation(table, 'insert', key)
    table = result.table
    outcomes.push(result)
  }
  return { capacity, keys: [...keys], table: [...table], outcomes }
}
