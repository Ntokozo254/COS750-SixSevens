
import { hashFunction } from "./hashing";

export function insertLinearProbing(table, key) {
  const tableSize = table.length;

  if (tableSize === 0) {
    throw new Error("The hash table cannot be empty.");
  }

  const steps = [];
  const homeSlot = hashFunction(key, tableSize);

  let index = homeSlot;

  for (let checked = 0; checked < tableSize; checked++) {
    steps.push({
      type: "check",
      index,
      key,
      table: [...table],
      message: `Checking slot ${index}.`
    });

    if (table[index] === null || table[index] === undefined) {
      table[index] = key;

      steps.push({
        type: "insert",
        index,
        key,
        table: [...table],
        message: `Key ${key} inserted into slot ${index}.`
      });

      return {
        success: true,
        table,
        steps
      };
    }

    if (table[index] === key) {
      return {
        success: false,
        table,
        steps,
        message: `Key ${key} already exists in the table.`
      };
    }

    steps.push({
      type: "collision",
      index,
      key,
      table: [...table],
      message: `Collision at slot ${index}. Checking the next slot.`
    });

    index = (index + 1) % tableSize;
  }

  return {
    success: false,
    table,
    steps,
    message: "The hash table is full."
  };
}
