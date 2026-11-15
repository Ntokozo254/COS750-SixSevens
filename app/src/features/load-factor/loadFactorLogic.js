import { insertLinearProbing } from '../../logic/linearProbing.js'
import { searchLinearProbing } from '../../logic/searching.js'

function validateCapacity(capacity) {
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
    throw new RangeError('Use a table capacity from 1 to 50 slots.')
  }
}

function validateKey(key) {
  if (!Number.isSafeInteger(key) || key < 0 || key > 1_000_000) {
    throw new RangeError('Use whole-number keys from 0 to 1,000,000.')
  }
}

function isEmpty(value) {
  return value === null || value === undefined
}

function validateTable(table) {
  if (!Array.isArray(table)) throw new TypeError('Provide an array of table slots.')
  validateCapacity(table.length)
  const keys = new Set()
  for (const value of table) {
    if (isEmpty(value)) continue
    validateKey(value)
    if (keys.has(value)) throw new TypeError('Each occupied slot must have a unique key.')
    keys.add(value)
  }
}

export function buildTable(keys, capacity = 10) {
  validateCapacity(capacity)
  if (!Array.isArray(keys)) throw new TypeError('Provide an array of keys.')
  if (keys.length > capacity) throw new RangeError('Use at most one entry per available slot.')
  const seen = new Set()
  const table = Array(capacity).fill(null)
  for (const key of keys) {
    validateKey(key)
    if (seen.has(key)) throw new TypeError('Use unique keys when building a table.')
    seen.add(key)
    insertLinearProbing(table, key)
  }
  return table
}

export function getTableStats(table) {
  validateTable(table)
  const capacity = table.length
  const entries = table.filter((value) => !isEmpty(value)).length
  const clusters = []
  const emptyIndex = table.findIndex(isEmpty)

  if (entries === capacity) {
    clusters.push(Array.from({ length: capacity }, (_, index) => index))
  } else {
    let cluster = []
    // Start just after an empty slot so a run crossing slot zero stays joined.
    for (let offset = 1; offset <= capacity; offset += 1) {
      const index = (emptyIndex + offset) % capacity
      if (!isEmpty(table[index])) {
        cluster.push(index)
      } else if (cluster.length > 0) {
        clusters.push(cluster)
        cluster = []
      }
    }
  }

  return {
    entries,
    capacity,
    loadFactor: entries / capacity,
    clusters,
    clusterCount: clusters.length,
    longestCluster: clusters.reduce((longest, cluster) => Math.max(longest, cluster.length), 0),
  }
}

export function createComparisonTables(entries = 5, capacity = 10) {
  validateCapacity(capacity)
  if (!Number.isInteger(entries) || entries < 0 || entries > capacity) {
    throw new RangeError('The occupied-entry count must be between zero and the capacity.')
  }
  const spreadKeys = Array.from({ length: entries }, (_, index) => Math.floor(index * capacity / entries))
  const clusteredKeys = Array.from({ length: entries }, (_, index) => index * capacity)
  return {
    spread: buildTable(spreadKeys, capacity),
    clustered: buildTable(clusteredKeys, capacity),
  }
}

export function measureSearch(table, key) {
  validateTable(table)
  validateKey(key)
  const result = searchLinearProbing(table, key)
  return {
    found: result.found,
    index: result.index,
    probes: result.checks,
    path: result.steps.map((step) => step.index),
    reason: result.reason,
  }
}

export function measureInsertion(table, key) {
  validateTable(table)
  validateKey(key)
  const result = insertLinearProbing([...table], key)
  const checks = result.steps.filter((step) => step.type === 'check')
  const insertion = result.steps.find((step) => step.type === 'insert')
  const duplicate = table.includes(key)
  return {
    inserted: result.success,
    index: insertion?.index ?? (duplicate ? table.indexOf(key) : -1),
    probes: checks.length,
    path: checks.map((step) => step.index),
    reason: result.success ? 'inserted' : duplicate ? 'duplicate' : 'full',
    table: [...result.table],
  }
}

export function rehashTable(table, capacity) {
  validateTable(table)
  return buildTable(table.filter((value) => !isEmpty(value)), capacity)
}
