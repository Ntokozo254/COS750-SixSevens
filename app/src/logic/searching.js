
import { hashFunction } from "./hashing";

export function searchLinearProbing(table, key) {
  const tableSize = table.length;

  if (tableSize === 0) {
    throw new Error("The hash table cannot be empty.");
  }

  const steps = [];
  let index = hashFunction(key, tableSize);

  for (let checked = 0; checked < tableSize; checked++) {
    steps.push({
      index,
      key,
      value: table[index],
      table: [...table],
      type: "check",
      message: `Checking slot ${index}.`
    });

    if (table[index] === key) {
      return {
        found: true,
        index,
        steps,
        message: `Key ${key} found at slot ${index}.`
      };
    }

    if (table[index] === null || table[index] === undefined) {
      return {
        found: false,
        index: -1,
        steps,
        message: `Key ${key} was not found. An empty slot was reached.`
      };
    }

    index = (index + 1) % tableSize;
  }

  return {
    found: false,
    index: -1,
    steps,
    message: `Key ${key} was not found after checking the table.`
  };
}
