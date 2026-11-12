// Input checks for the API. Each returns an error message, or null when valid.

export const MAX_TABLE_SIZE = 50;
export const MAX_KEY = 1_000_000;

export function checkKey(key) {
  if (typeof key !== 'number' || !Number.isInteger(key)) return 'key must be a whole number';
  if (key < 0 || key > MAX_KEY) return `key must be between 0 and ${MAX_KEY}`;
  return null;
}

export function checkSize(size) {
  if (!Number.isInteger(size) || size < 1 || size > MAX_TABLE_SIZE) {
    return `size must be a whole number from 1 to ${MAX_TABLE_SIZE}`;
  }
  return null;
}

export function checkTable(table) {
  if (!table || typeof table !== 'object') return 'table is required';
  const sizeError = checkSize(table.size);
  if (sizeError) return `table.${sizeError}`;
  if (!Array.isArray(table.slots) || table.slots.length !== table.size) {
    return 'table.slots must be an array with table.size entries';
  }
  for (const slot of table.slots) {
    const ok = slot === null
      || (slot && slot.tombstone === true)
      || (slot && checkKey(slot.key) === null);
    if (!ok) return 'each slot must be null, { tombstone: true } or { key, value }';
  }
  return null;
}