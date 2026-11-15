import { hashFunction } from '../../logic/hashing.js'

export const MAX_HASH_KEY = 1_000_000
export const MAX_HASH_TABLE_SIZE = 20

export function calculateHashExample(key, tableSize) {
  if (!Number.isSafeInteger(key) || key < 0 || key > MAX_HASH_KEY) {
    throw new RangeError('Use a whole-number key from 0 to 1,000,000.')
  }
  if (!Number.isInteger(tableSize) || tableSize < 1 || tableSize > MAX_HASH_TABLE_SIZE) {
    throw new RangeError('Use a table size from 1 to 20 whole-number slots.')
  }

  const quotient = Math.floor(key / tableSize)
  const remainder = hashFunction(key, tableSize)

  return {
    key,
    tableSize,
    quotient,
    remainder,
    homeIndex: remainder,
    steps: [
      {
        title: 'Read the key and the table size',
        explanation: `The key is ${key}. The table has ${tableSize} ${tableSize === 1 ? 'slot' : 'slots'}, indexed from 0 to ${tableSize - 1}. We use h(key) = key mod table size.`,
      },
      {
        title: 'Count complete groups',
        explanation: `${key} contains ${quotient} complete ${quotient === 1 ? 'group' : 'groups'} of ${tableSize}. Those groups use ${quotient} × ${tableSize} = ${quotient * tableSize}. The whole-number quotient is ${quotient}.`,
      },
      {
        title: 'Use the remainder as the home slot',
        explanation: `${key} − ${quotient * tableSize} = ${remainder}. This remainder is ${key} mod ${tableSize}, so the home slot is index ${remainder}.`,
      },
      {
        title: 'Keep the home slot and storage slot distinct',
        explanation: `Index ${remainder} is where insertion and lookup begin. Another key can share this home slot. If it is occupied, a collision-handling method determines the next location.`,
      },
    ],
  }
}
