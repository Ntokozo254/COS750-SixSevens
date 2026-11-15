export const PRACTICE_STAGES = [
  {
    id: 'fundamentals',
    title: 'Calculate the basics',
    level: 'Beginner',
    description:
      'Connect keys with home slots and count occupied positions before implementing table operations.',
    challengeIds: ['home-slot', 'load-factor'],
  },
  {
    id: 'insertion',
    title: 'Store keys safely',
    level: 'Easy',
    description:
      'Use guided scaffolds to preserve entries, resolve collisions, and build a complete table.',
    challengeIds: ['insert-key', 'build-table'],
  },
  {
    id: 'searching',
    title: 'Follow the probe path',
    level: 'Intermediate',
    description:
      'Implement lookup and measure the exact work needed to reach a match or an absent result.',
    challengeIds: ['find-key', 'count-probes'],
  },
  {
    id: 'advanced',
    title: 'Rebuild and inspect',
    level: 'Advanced',
    description:
      'Combine the earlier ideas to rehash stored keys and recognise clusters that cross the table boundary.',
    challengeIds: ['rehash', 'longest-cyclic-cluster'],
  },
]

export const PRACTICE_CHALLENGES = [
  {
    id: 'home-slot',
    version: 1,
    stageId: 'fundamentals',
    title: 'Find the home slot',
    difficulty: 'Beginner',
    summary: 'Turn an integer key into a valid starting index.',
    prompt:
      'Implement solve(input). Given { key, size }, return the home-slot index produced by h(key) = key mod size. The home slot is the starting position for insertion and search.',
    objectives: ['Calculate a remainder.', 'Keep the result between 0 and size − 1.'],
    constraints: [
      'key is an integer from 0 to 1,000,000.',
      'size is an integer from 1 to 20.',
      'Return an integer index.',
    ],
    starterCode: `function solve(input) {
  const { key, size } = input;
  // Return the remainder after dividing key by size.
}`,
    workedCode: `function solve(input) {
  const groups = Math.floor(input.key / input.size);
  return input.key - groups * input.size;
}`,
    workedExplanation:
      'For key 23 and size 10, two complete groups use 20 and leave 3. This worked calculation uses subtraction. JavaScript also provides the remainder operator %.',
    hints: [
      'The table has indices 0 through size − 1.',
      'The amount left after complete groups of size is the home slot.',
      'Use key % size. An exact multiple has remainder 0, which is a valid index.',
    ],
    example: {
      input: { key: 23, size: 10 },
      output: 3,
      explanation: '23 = 2 × 10 + 3, so the home slot is 3.',
    },
    tests: [
      {
        name: 'Home slot · ordinary remainder',
        input: { key: 23, size: 10 },
        expected: 3,
        explanation: 'Two complete groups leave remainder 3.',
      },
      {
        name: 'Home slot · zero in one slot',
        input: { key: 0, size: 1 },
        expected: 0,
        explanation: 'Key 0 belongs at the only index, 0.',
      },
      {
        name: 'Home slot · exact multiple',
        input: { key: 42, size: 7 },
        expected: 0,
        explanation: 'An exact multiple leaves remainder 0.',
      },
      {
        name: 'Home slot · changed capacity',
        input: { key: 23, size: 7 },
        expected: 2,
        explanation: 'Using seven slots changes the remainder to 2.',
      },
      {
        name: 'Home slot · largest supported key',
        input: { key: 1_000_000, size: 20 },
        expected: 0,
        explanation: 'The maximum supported key is divisible by 20.',
      },
    ],
    solution: `function solve(input) {
  return input.key % input.size;
}`,
  },
  {
    id: 'load-factor',
    version: 1,
    stageId: 'fundamentals',
    title: 'Measure table occupancy',
    difficulty: 'Beginner',
    summary: 'Calculate the fraction of slots that hold keys.',
    prompt:
      'Implement solve(input). Given { table }, count the occupied slots and return the load factor n / m, where n is the occupied count and m is table.length. null means empty. Key 0 occupies a slot. Return the numeric ratio without rounding.',
    objectives: [
      'Distinguish an empty slot from key 0.',
      'Calculate occupied slots divided by capacity.',
    ],
    constraints: [
      'The table contains 1–20 slots.',
      'Each slot is null or a unique integer key from 0 to 1,000,000.',
      'Return a number between 0 and 1.',
    ],
    starterCode: `function solve(input) {
  const table = input.table;
  let occupied = 0;
  // Count slots whose value is not null.
  // Divide the occupied count by the table length.
}`,
    workedCode: `function solve(input) {
  let occupied = 0;
  for (const value of input.table) {
    if (value !== null) occupied += 1;
  }
  return occupied;
}`,
    workedExplanation:
      'This smaller worked task counts entries. For [0, null, 7, null], it returns 2, including key 0. Complete the load-factor challenge by dividing that count by the four available slots.',
    hints: [
      'Compare each value with null explicitly.',
      'A truthiness check would accidentally ignore key 0.',
      'Count value !== null, then return occupied / table.length without formatting or rounding.',
    ],
    example: {
      input: { table: [0, null, 7, null] },
      output: 0.5,
      explanation: 'Two occupied slots divided by four slots gives 0.5.',
    },
    tests: [
      {
        name: 'Load factor · empty table',
        input: { table: [null, null, null, null] },
        expected: 0,
        explanation: 'Zero of four slots are occupied.',
      },
      {
        name: 'Load factor · key zero counts',
        input: { table: [0, null, null, null] },
        expected: 0.25,
        explanation: 'Key 0 is one entry, so the ratio is 1 / 4.',
      },
      {
        name: 'Load factor · half occupied',
        input: { table: [0, null, 7, null] },
        expected: 0.5,
        explanation: 'Two of four slots are occupied.',
      },
      {
        name: 'Load factor · full table',
        input: { table: [0, 1, 2] },
        expected: 1,
        explanation: 'All three slots are occupied.',
      },
      {
        name: 'Load factor · unrounded fraction',
        input: { table: [null, 1, null] },
        expected: 1 / 3,
        explanation: 'Return the actual numeric division 1 / 3, rather than 0.33.',
      },
    ],
    solution: `function solve(input) {
  let occupied = 0;
  for (const value of input.table) {
    if (value !== null) occupied += 1;
  }
  return occupied / input.table.length;
}`,
  },
  {
    id: 'insert-key',
    version: 1,
    stageId: 'insertion',
    title: 'Insert one key',
    difficulty: 'Easy',
    summary: 'Resolve collisions while preserving stored entries.',
    prompt:
      'Implement solve(input). Given { table, key }, return a new table after inserting key with linear probing. Start at key % table.length, advance one slot at a time, and wrap to index 0. Preserve other entries. If the key already exists or the table is full, return a copy with the same contents.',
    objectives: [
      'Follow a bounded probe sequence.',
      'Handle wrap-around, duplicate requests, and a full table.',
    ],
    constraints: [
      'The input is a valid linear-probing table with 1–20 slots and unique stored keys.',
      'Each slot is null or an integer key from 0 to 1,000,000; key is in the same range.',
      'Inspect at most table.length slots.',
      'Return an array and leave the input table unchanged.',
    ],
    starterCode: `function solve(input) {
  const { key } = input;
  const table = [...input.table];
  const home = key % table.length;
  for (let checked = 0; checked < table.length; checked += 1) {
    const index = (home + checked) % table.length;
    // Preserve an existing match. Store at the first null slot.
  }
  return table;
}`,
    workedCode: `function solve(input) {
  const home = input.key % input.table.length;
  const path = [];
  for (let step = 0; step < input.table.length; step += 1) {
    path.push((home + step) % input.table.length);
  }
  return path;
}`,
    workedExplanation:
      'This helper lists probe indices. Key 9 in five slots produces [4, 0, 1, 2, 3]. Your insertion function must inspect those positions, stop at a matching key or a free slot, and return the resulting table.',
    hints: [
      'Make a copy before changing a slot.',
      'At each index, an equal key means stop, while null means store the key and stop.',
      'Compute (home + checked) % table.length for at most one circuit. If no slot is free, return the unchanged copy.',
    ],
    example: {
      input: { table: [null, null, 12, null, null], key: 7 },
      output: [null, null, 12, 7, null],
      explanation: '7 mod 5 = 2. Keep 12 at slot 2 and store 7 at empty slot 3.',
    },
    tests: [
      {
        name: 'Insert key · zero into empty storage',
        input: { table: [null, null, null, null, null], key: 0 },
        expected: [0, null, null, null, null],
        explanation: 'Key 0 occupies its home slot.',
      },
      {
        name: 'Insert key · preserve a colliding entry',
        input: { table: [null, null, 12, null, null], key: 7 },
        expected: [null, null, 12, 7, null],
        explanation: 'The occupied home slot sends the new key to slot 3.',
      },
      {
        name: 'Insert key · wrap through occupied slots',
        input: { table: [19, null, null, null, null, null, null, null, null, 9], key: 29 },
        expected: [19, 29, null, null, null, null, null, null, null, 9],
        explanation: 'Pass slots 9 and 0, then store at index 1.',
      },
      {
        name: 'Insert key · duplicate preserves contents',
        input: { table: [null, null, 12, 22, 32, null, null, null, null, null], key: 22 },
        expected: [null, null, 12, 22, 32, null, null, null, null, null],
        explanation: 'The existing key at slot 3 is preserved.',
      },
      {
        name: 'Insert key · full table preserves contents',
        input: { table: [0, 1, 2], key: 5 },
        expected: [0, 1, 2],
        explanation: 'After one complete circuit, no position is available.',
      },
    ],
    solution: `function solve(input) {
  const table = [...input.table];
  const home = input.key % table.length;
  for (let checked = 0; checked < table.length; checked += 1) {
    const index = (home + checked) % table.length;
    if (table[index] === input.key) return table;
    if (table[index] === null) {
      table[index] = input.key;
      return table;
    }
  }
  return table;
}`,
  },
  {
    id: 'build-table',
    version: 1,
    stageId: 'insertion',
    title: 'Build a table from keys',
    difficulty: 'Easy',
    summary: 'Apply insertion repeatedly in the supplied order.',
    prompt:
      'Implement solve(input). Given { keys, size }, start with size null slots and insert the keys in their listed order using linear probing. Ignore a key already stored. If the table is full, leave its contents unchanged for that key and continue. Return the final table.',
    objectives: [
      'Build on the single-key insertion procedure.',
      'Preserve input order while ignoring duplicates and overflow.',
    ],
    constraints: [
      'size is an integer from 1 to 20.',
      'keys contains 0–30 integer keys from 0 to 1,000,000.',
      'Duplicate keys are ignored.',
      'Return exactly size slots containing keys or null.',
    ],
    starterCode: `function solve(input) {
  const table = Array(input.size).fill(null);
  for (const key of input.keys) {
    // Probe from this key's home slot.
    // Stop on a duplicate or after placing the key.
  }
  return table;
}`,
    workedCode: `function solve(input) {
  const table = Array(input.size).fill(null);
  if (input.keys.length > 0) {
    const firstKey = input.keys[0];
    table[firstKey % input.size] = firstKey;
  }
  return table;
}`,
    workedExplanation:
      'This worked starting point stores only the first key in an empty table. For [12, 22] and size 5, it stores 12 at index 2. Extend that idea to all keys, using probing when another entry already occupies the home.',
    hints: [
      'Allocate a fresh array filled with null.',
      'For each key, start a new probe sequence and stop on an equal key or the first empty slot.',
      'Use an inner loop bounded by size. A full circuit leaves the table unchanged for that key, so later keys can still be considered.',
    ],
    example: {
      input: { keys: [0, 5, 10], size: 5 },
      output: [0, 5, 10, null, null],
      explanation: 'All three keys hash to 0 and occupy consecutive free slots.',
    },
    tests: [
      {
        name: 'Build table · no input keys',
        input: { keys: [], size: 5 },
        expected: [null, null, null, null, null],
        explanation: 'An empty key list leaves every slot empty.',
      },
      {
        name: 'Build table · zero and collisions',
        input: { keys: [0, 5, 10], size: 5 },
        expected: [0, 5, 10, null, null],
        explanation: 'The shared home slot produces a run beginning with key 0.',
      },
      {
        name: 'Build table · wrapped cluster',
        input: { keys: [9, 19, 29], size: 10 },
        expected: [19, 29, null, null, null, null, null, null, null, 9],
        explanation: 'Keys 19 and 29 wrap past slot 9.',
      },
      {
        name: 'Build table · ignore repeated keys',
        input: { keys: [12, 22, 12, 32], size: 10 },
        expected: [null, null, 12, 22, 32, null, null, null, null, null],
        explanation: 'The second 12 creates no extra entry.',
      },
      {
        name: 'Build table · full table and later duplicate',
        input: { keys: [0, 3, 6, 9, 3], size: 3 },
        expected: [0, 3, 6],
        explanation: 'Key 9 has no free slot, and the later 3 already exists.',
      },
    ],
    solution: `function solve(input) {
  const table = Array(input.size).fill(null);
  for (const key of input.keys) {
    const home = key % input.size;
    for (let checked = 0; checked < input.size; checked += 1) {
      const index = (home + checked) % input.size;
      if (table[index] === key) break;
      if (table[index] === null) {
        table[index] = key;
        break;
      }
    }
  }
  return table;
}`,
  },
  {
    id: 'find-key',
    version: 1,
    stageId: 'searching',
    title: 'Find a stored key',
    difficulty: 'Intermediate',
    summary: 'Retrace insertion until a match or a stopping condition.',
    prompt:
      'Implement solve(input). Given { table, key }, search with linear probing from key % table.length. Return the matching slot index. Return -1 after reaching null or after inspecting every slot once. Index 0 is a valid successful result.',
    objectives: [
      'Follow the same probe sequence as insertion.',
      'Handle empty storage, wrap-around, and a full unsuccessful search.',
    ],
    constraints: [
      'The input is a valid linear-probing table with 1–20 slots and unique stored keys.',
      'Slots contain null or integer keys from 0 to 1,000,000; key is in the same range.',
      'These exercises use insertions only, so there are no deleted-slot markers.',
      'Leave the input unchanged and return an integer index or -1.',
    ],
    starterCode: `function solve(input) {
  const { table, key } = input;
  // Follow the insertion path and return the match index.
}`,
    workedCode: `function solve(input) {
  const home = input.key % input.table.length;
  return input.table[home] === input.key;
}`,
    workedExplanation:
      'This helper checks only whether the target is at its home. For key 0 in [0, null, null], it returns true. A full search must continue through other keys and return the actual index, including 0, or -1 when absent.',
    hints: [
      'Begin at the target key’s home slot.',
      'Compare the stored key, then check whether the slot is null. Other keys mean continue.',
      'Inspect at most table.length positions using wrap-around. Return an index immediately on a match and -1 at an empty slot or after the full circuit.',
    ],
    example: {
      input: { table: [null, null, 12, 22, 32, null, null, null, null, null], key: 32 },
      output: 4,
      explanation: 'The search follows slots 2, 3, and 4 and returns index 4.',
    },
    tests: [
      {
        name: 'Find key · zero at index zero',
        input: { table: [0, null, null, null, null], key: 0 },
        expected: 0,
        explanation: 'Return index 0 as a successful match.',
      },
      {
        name: 'Find key · displaced target',
        input: { table: [null, null, 12, 22, 32, null, null, null, null, null], key: 32 },
        expected: 4,
        explanation: 'The target is found after two different keys.',
      },
      {
        name: 'Find key · wrapped target at zero',
        input: { table: [19, null, null, null, null, null, null, null, null, 9], key: 19 },
        expected: 0,
        explanation: 'Start at 9 and wrap to index 0.',
      },
      {
        name: 'Find key · empty table',
        input: { table: [null, null, null], key: 2 },
        expected: -1,
        explanation: 'The first empty slot establishes absence.',
      },
      {
        name: 'Find key · absent from full table',
        input: { table: [0, 1, 2], key: 5 },
        expected: -1,
        explanation: 'Every slot is inspected once, then the search terminates.',
      },
    ],
    solution: `function solve(input) {
  const { table, key } = input;
  const home = key % table.length;
  for (let checked = 0; checked < table.length; checked += 1) {
    const index = (home + checked) % table.length;
    if (table[index] === key) return index;
    if (table[index] === null) return -1;
  }
  return -1;
}`,
  },
  {
    id: 'count-probes',
    version: 1,
    stageId: 'searching',
    title: 'Count search inspections',
    difficulty: 'Intermediate',
    summary: 'Measure every inspected slot, including the stopping slot.',
    prompt:
      'Implement solve(input). Given { table, key }, return how many slots a linear-probing search inspects. Count the home slot and the final matching or null slot. If the key is absent from a full table, return table.length after one circuit.',
    objectives: [
      'Distinguish probe count from the result index.',
      'Include the final inspection and bound unsuccessful searches.',
    ],
    constraints: [
      'The input is a valid linear-probing table with 1–20 slots and unique stored keys.',
      'Slots contain null or integer keys from 0 to 1,000,000; key is in the same range.',
      'The table uses insertions only.',
      'Return an integer between 1 and table.length and leave the input unchanged.',
    ],
    starterCode: `function solve(input) {
  // Return the number of inspected slots.
}`,
    workedCode: `function solve(input) {
  const index = input.key % input.table.length;
  return { index, value: input.table[index], probes: 1 };
}`,
    workedExplanation:
      'The first inspection already counts as one, even when that home slot is empty. This helper reports that first step. Your search must continue through other keys and return the final count as a number.',
    hints: [
      'Count an inspection before deciding whether to stop.',
      'A found or empty slot contributes one to the count.',
      'At probe offset checked, return checked + 1 when you reach the key or null. If all slots were inspected, return the table length.',
    ],
    example: {
      input: { table: [null, null, 12, 22, 32, null, null, null, null, null], key: 42 },
      output: 4,
      explanation: 'Inspect slots 2, 3, 4, and empty slot 5. The empty slot counts.',
    },
    tests: [
      {
        name: 'Count probes · key zero at home',
        input: { table: [0, null, null, null, null], key: 0 },
        expected: 1,
        explanation: 'The matching home slot takes one inspection.',
      },
      {
        name: 'Count probes · initially empty storage',
        input: { table: [null, null, null], key: 2 },
        expected: 1,
        explanation: 'Inspecting the first empty slot takes one probe.',
      },
      {
        name: 'Count probes · target after collisions',
        input: { table: [null, null, 12, 22, 32, null, null, null, null, null], key: 32 },
        expected: 3,
        explanation: 'Count both different keys and the final match.',
      },
      {
        name: 'Count probes · wrapped target',
        input: { table: [19, 29, null, null, null, null, null, null, null, 9], key: 29 },
        expected: 3,
        explanation: 'Slots 9, 0, and 1 are inspected.',
      },
      {
        name: 'Count probes · final empty slot',
        input: { table: [null, null, 12, 22, 32, null, null, null, null, null], key: 42 },
        expected: 4,
        explanation: 'Three occupied slots followed by one empty slot take four inspections.',
      },
      {
        name: 'Count probes · bounded full scan',
        input: { table: [0, 1, 2], key: 5 },
        expected: 3,
        explanation: 'The absent search visits each of the three slots once.',
      },
    ],
    solution: `function solve(input) {
  const { table, key } = input;
  const home = key % table.length;
  for (let checked = 0; checked < table.length; checked += 1) {
    const index = (home + checked) % table.length;
    if (table[index] === key || table[index] === null) return checked + 1;
  }
  return table.length;
}`,
  },
  {
    id: 'rehash',
    version: 1,
    stageId: 'advanced',
    title: 'Rehash into a larger table',
    difficulty: 'Advanced',
    summary: 'Recompute home positions and rebuild the layout.',
    prompt:
      'Implement solve(input). Given { table, newSize }, allocate a new table filled with null. Scan the old table from index 0 upward. Skip null and reinsert each key using key % newSize and linear probing. Ignore repeated keys. Return the new table with exactly newSize slots.',
    objectives: [
      'Recompute homes using the new capacity.',
      'Reuse insertion while preserving distinct keys in a deterministic scan order.',
    ],
    constraints: [
      'table has 1–19 slots, each null or an integer key from 0 to 1,000,000.',
      'newSize is an integer greater than table.length and at most 20.',
      'Scan existing slots in ascending index order and ignore repeated keys.',
      'Leave the old table unchanged.',
    ],
    starterCode: `function solve(input) {
  // Rebuild into a fresh, larger table.
}`,
    workedCode: `function solve(input) {
  const homes = [];
  for (const key of input.table) {
    if (key !== null) homes.push({ key, home: key % input.newSize });
  }
  return homes;
}`,
    workedExplanation:
      'This helper recomputes home slots before arranging the entries. A key 10 in a five-slot table starts at 0; with ten slots its new home is also 0, while key 5 changes from 0 to 5. Your solution must use these new homes to build the actual larger array and resolve any remaining collisions.',
    hints: [
      'Copying entries into their old indices can break later searches.',
      'Allocate newSize null slots and scan old slots in index order.',
      'For each non-null key, probe from key % newSize. Stop on an equal key or place it in the first null slot. The larger table has enough capacity for the distinct entries.',
    ],
    example: {
      input: { table: [0, 5, 10, null, null], newSize: 10 },
      output: [0, 10, null, null, null, 5, null, null, null, null],
      explanation:
        'Reinsert 0, then 5, then 10. Key 5 moves to its new home 5, and 10 probes from 0 to slot 1.',
    },
    tests: [
      {
        name: 'Rehash · recompute homes and collide again',
        input: { table: [0, 5, 10, null, null], newSize: 10 },
        expected: [0, 10, null, null, null, 5, null, null, null, null],
        explanation: 'The new layout follows recalculated homes and the old-table scan order.',
      },
      {
        name: 'Rehash · empty old table',
        input: { table: [null, null, null], newSize: 6 },
        expected: [null, null, null, null, null, null],
        explanation: 'No keys need reinsertion.',
      },
      {
        name: 'Rehash · previously wrapped entries',
        input: { table: [19, 29, null, null, null, null, null, null, null, 9], newSize: 20 },
        expected: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          29,
          9,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          19,
        ],
        explanation: 'Scan 19, then 29, then 9. Their new homes are 19, 9, and 9.',
      },
      {
        name: 'Rehash · full old table',
        input: { table: [0, 3, 6], newSize: 7 },
        expected: [0, null, null, 3, null, null, 6],
        explanation: 'All three keys survive in a table with additional free positions.',
      },
      {
        name: 'Rehash · normalise repeated keys',
        input: { table: [0, 3, 0], newSize: 5 },
        expected: [0, null, null, 3, null],
        explanation: 'The second occurrence of key 0 creates no extra entry.',
      },
    ],
    solution: `function solve(input) {
  const result = Array(input.newSize).fill(null);
  for (const key of input.table) {
    if (key === null) continue;
    const home = key % input.newSize;
    for (let checked = 0; checked < input.newSize; checked += 1) {
      const index = (home + checked) % input.newSize;
      if (result[index] === key) break;
      if (result[index] === null) {
        result[index] = key;
        break;
      }
    }
  }
  return result;
}`,
  },
  {
    id: 'longest-cyclic-cluster',
    version: 1,
    stageId: 'advanced',
    title: 'Measure a wrapped cluster',
    difficulty: 'Advanced',
    summary: 'Join occupied runs across the final and first slots.',
    prompt:
      'Implement solve(input). Given { table }, return the largest number of consecutive occupied slots when the indices form a ring. The final slot is adjacent to slot 0. null ends a run, while key 0 is occupied. Return 0 for an empty table and table.length for a full table. Count each slot at most once in a cluster.',
    objectives: [
      'Recognise a cluster crossing the array boundary.',
      'Handle empty and full rings with bounded scanning.',
    ],
    constraints: [
      'The table has 1–20 slots.',
      'Each slot is null or a unique integer key from 0 to 1,000,000.',
      'Return an integer from 0 through table.length.',
      'Leave the input unchanged.',
    ],
    starterCode: `function solve(input) {
  // Return the longest cyclic occupied run.
}`,
    workedCode: `function solve(input) {
  let run = 0;
  let longest = 0;
  for (const value of input.table) {
    run = value === null ? 0 : run + 1;
    longest = Math.max(longest, run);
  }
  return longest;
}`,
    workedExplanation:
      'This worked scan measures ordinary runs and resets at null. In [0, 1, null, 3, 4], it returns 2. On a ring, the tail [3, 4] joins the head [0, 1], giving a cluster of 4. Extend the approach to recognise that boundary without counting a full table twice.',
    hints: [
      'Inspect the relationship between the last and first slots.',
      'If there is an empty slot, start just after it so any wrapped cluster appears in one scan.',
      'Return the capacity for a full table. Otherwise scan exactly one circuit from an empty-slot boundary, resetting the run at null and recording the largest run.',
    ],
    example: {
      input: { table: [0, 1, null, 3, 4] },
      output: 4,
      explanation: 'Slots 3, 4, 0, and 1 form one occupied run on the ring.',
    },
    tests: [
      {
        name: 'Longest cluster · empty ring',
        input: { table: [null, null, null, null] },
        expected: 0,
        explanation: 'Every slot is empty.',
      },
      {
        name: 'Longest cluster · one occupied zero',
        input: { table: [0] },
        expected: 1,
        explanation: 'Key 0 fills the single slot, counted once.',
      },
      {
        name: 'Longest cluster · full ring',
        input: { table: [0, 1, 2, 3] },
        expected: 4,
        explanation: 'The full ring has one cluster equal to capacity.',
      },
      {
        name: 'Longest cluster · ordinary internal run',
        input: { table: [null, 1, 2, 3, null, 5, null] },
        expected: 3,
        explanation: 'Slots 1 through 3 make the largest run.',
      },
      {
        name: 'Longest cluster · joined tail and head',
        input: { table: [0, 1, null, 3, 4] },
        expected: 4,
        explanation: 'The final two and first two occupied slots join.',
      },
      {
        name: 'Longest cluster · separated equal runs',
        input: { table: [0, null, 2, 3, null, 5] },
        expected: 2,
        explanation: 'The wrapped pair 5 → 0 and internal pair 2 → 3 each have length 2.',
      },
    ],
    solution: `function solve(input) {
  const table = input.table;
  const empty = table.indexOf(null);
  if (empty === -1) return table.length;
  let run = 0;
  let longest = 0;
  for (let offset = 1; offset <= table.length; offset += 1) {
    const value = table[(empty + offset) % table.length];
    run = value === null ? 0 : run + 1;
    longest = Math.max(longest, run);
  }
  return longest;
}`,
  },
]
