
export function hashFunction(key, tableSize) {
  if (!Number.isInteger(key)) {
    throw new Error("Key must be an integer.");
  }

  if (!Number.isInteger(tableSize) || tableSize <= 0) {
    throw new Error("Table size must be a positive integer.");
  }

  return ((key % tableSize) + tableSize) % tableSize;
}
