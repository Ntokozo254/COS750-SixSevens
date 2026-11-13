const collisionTable = Object.freeze([19, null, 12, 22, 32, null, null, null, null, 9])

export const SEARCH_EXAMPLES = [
  {
    id: 'found',
    label: 'Found after collisions',
    key: 32,
    table: collisionTable,
    purpose: 'Find a key that was displaced from its home slot by two collisions.',
  },
  {
    id: 'missing',
    label: 'Stop at an empty slot',
    key: 42,
    table: collisionTable,
    purpose: 'Follow the same cluster and explain why the first empty slot ends the search.',
  },
  {
    id: 'wrap',
    label: 'Wrap around the table',
    key: 29,
    table: Object.freeze([19, 29, null, null, null, null, null, null, null, 9]),
    purpose: 'Continue from slot 9 to slot 0, then find the displaced key at slot 1.',
  },
  {
    id: 'deleted',
    label: 'Continue past a deleted slot',
    key: 32,
    table: Object.freeze([
      19,
      null,
      12,
      Object.freeze({ tombstone: true }),
      32,
      null,
      null,
      null,
      null,
      9,
    ]),
    purpose: 'A tombstone marks a deleted entry. Keep probing so keys beyond it remain reachable.',
  },
  {
    id: 'full',
    label: 'Search a full table',
    key: 25,
    table: Object.freeze([0, 5, 10, 15, 20]),
    purpose: 'When every slot is occupied, a missing-key search ends after one complete circuit.',
  },
  {
    id: 'empty',
    label: 'Search an empty table',
    key: 12,
    table: Object.freeze(Array(10).fill(null)),
    purpose:
      'An empty table still has slots. The first empty slot establishes that the key is absent.',
  },
]

export const SEARCH_PSEUDOCODE = [
  'home = hash(key) mod m',
  'for checked = 0 to m − 1',
  '    index = (home + checked) mod m',
  '    if slot is EMPTY, return missing',
  '    if slot holds key, return index',
  '    continue past other keys and tombstones',
  'return missing',
]
