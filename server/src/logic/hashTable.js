// Hash table with linear probing (open addressing) and tombstone deletion.
//
// A table is a plain object so it can travel as JSON between the API and the
// front end:  { size: 10, slots: [ null | { key, value } | { tombstone: true } ] }
//
// Every operation is pure: it never changes the table it is given. It returns
// a NEW table plus a list of `steps` describing exactly what the algorithm did,
// which the front end plays back as the animation.
//
// Step types: hash, occupied, tombstone, empty, wrap, found, not_found,
//             placed, duplicate, full, updated, deleted

export const EMPTY = null;
export const TOMBSTONE = Object.freeze({ tombstone: true });

export function createTable(size = 10) {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error('Table size must be a positive whole number');
  }
  return { size, slots: Array(size).fill(EMPTY) };
}

export function hash(key, size) {
  return key % size;
}

const isTombstone = (slot) => slot !== null && slot.tombstone === true;
const isEmpty = (slot) => slot === null;
const copy = (table) => ({ size: table.size, slots: [...table.slots] });

// Walks the probe sequence for `key`, recording steps as it goes.
// Stops at the key (found) or at a truly empty slot (not found).
// Tombstones are skipped, never treated as the end of the search.
// Also remembers the first tombstone seen, so insert can reuse it.
function probe(table, key) {
  const { size, slots } = table;
  const start = hash(key, size);
  const steps = [{ type: 'hash', key, slot: start, text: `${key} mod ${size} = ${start}` }];
  let firstTombstone = -1;

  for (let i = 0; i < size; i++) {
    const slot = (start + i) % size;
    if (i > 0 && slot === 0) {
      steps.push({ type: 'wrap', slot: 0, text: 'Reached the end of the table, wrap around to slot 0' });
    }
    const content = slots[slot];

    if (isEmpty(content)) {
      steps.push({ type: 'empty', slot, text: `Slot ${slot} is empty` });
      return { status: 'empty', slot, firstTombstone, checks: i + 1, steps };
    }
    if (isTombstone(content)) {
      steps.push({ type: 'tombstone', slot, text: `Slot ${slot} held a deleted key, keep going` });
      if (firstTombstone === -1) firstTombstone = slot;
      continue;
    }
    if (content.key === key) {
      steps.push({ type: 'found', slot, key, text: `Slot ${slot} holds ${key}` });
      return { status: 'found', slot, firstTombstone, checks: i + 1, steps };
    }
    steps.push({ type: 'occupied', slot, found: content.key, text: `Slot ${slot} holds ${content.key}, try the next slot` });
  }
  // Checked every slot without finding the key or an empty slot.
  return { status: 'exhausted', slot: -1, firstTombstone, checks: size, steps };
}

export function insert(table, key, value = null) {
  const result = probe(table, key);
  const steps = result.steps;
  const next = copy(table);

  if (result.status === 'found') {
    steps.push({ type: 'duplicate', slot: result.slot, key, text: `${key} is already in the table` });
    return { ok: false, reason: 'duplicate', table: next, slot: result.slot, steps };
  }

  // Prefer the first tombstone passed on the way (keeps probe sequences short).
  let target = result.firstTombstone;
  if (target === -1 && result.status === 'empty') target = result.slot;

  if (target === -1) {
    steps.push({ type: 'full', text: 'Every slot is taken, the table is full' });
    return { ok: false, reason: 'full', table: next, slot: -1, steps };
  }

  next.slots[target] = { key, value };
  steps.push({ type: 'placed', slot: target, key, text: `Place ${key} in slot ${target}` });
  return { ok: true, table: next, slot: target, steps };
}

export function insertMany(table, keys) {
  let current = table;
  const results = [];
  for (const key of keys) {
    const r = insert(current, key);
    results.push({ key, ok: r.ok, reason: r.reason, slot: r.slot, steps: r.steps });
    current = r.table;
  }
  return { table: current, results };
}

export function search(table, key) {
  const result = probe(table, key);
  const steps = result.steps;
  if (result.status === 'found') {
    return { found: true, slot: result.slot, value: table.slots[result.slot].value, checks: result.checks, steps };
  }
  steps.push({ type: 'not_found', key, text: `${key} is not in the table` });
  return { found: false, slot: -1, value: null, checks: result.checks, steps };
}

export function update(table, key, value) {
  const result = search(table, key);
  const next = copy(table);
  if (!result.found) {
    return { ok: false, reason: 'not_found', table: next, steps: result.steps };
  }
  next.slots[result.slot] = { key, value };
  result.steps.push({ type: 'updated', slot: result.slot, key, text: `Change the value stored for ${key}` });
  return { ok: true, table: next, slot: result.slot, steps: result.steps };
}

export function remove(table, key) {
  const result = search(table, key);
  const next = copy(table);
  if (!result.found) {
    return { ok: false, reason: 'not_found', table: next, steps: result.steps };
  }
  // A tombstone, NOT an empty slot: emptying it would stop later searches early.
  next.slots[result.slot] = TOMBSTONE;
  result.steps.push({ type: 'deleted', slot: result.slot, key, text: `Mark slot ${result.slot} as deleted (tombstone)` });
  return { ok: true, table: next, slot: result.slot, steps: result.steps };
}