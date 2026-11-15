export const LOAD_FACTOR_TOPIC = {
  id: 6,
  title: 'Clustering and Load Factor',
  introduction: 'A hash table has m slots and stores n entries. Load factor describes how full it is. Clustering describes where occupied slots gather. Together, these ideas help explain the work done by linear probing.',
  scenario: 'A course portal stores numeric task IDs in a hash table. As more tasks arrive, some IDs share a home slot. Explore why two equally full tables can take different numbers of probes to find the same missing ID.',
  outcomes: [
    'Calculate load factor as the number of stored entries divided by table capacity.',
    'Identify occupied clusters, including a cluster that wraps through slot zero.',
    'Trace a specific search or insertion and relate its probes to occupancy and layout.',
    'Explain how resizing and rehashing create space and recompute home slots.',
  ],
  sections: [
    {
      title: 'Measure how full the table is',
      content: 'An entry is one stored key. A slot is one array position. Write n for the number of entries and m for the number of slots. The load factor is α = n / m. Read α as alpha. Empty slots contribute to capacity, while occupied slots contribute to the entry count.',
      example: 'Five entries in ten slots give α = 5 / 10 = 0.5. The table is 50% occupied. Three entries in eight slots give α = 3 / 8 = 0.375.',
    },
    {
      title: 'Follow occupied runs',
      content: 'In linear probing, a collision moves a key forward one slot at a time. Neighbouring occupied slots form a cluster. A later key that hashes into that run can extend it. This tendency for runs to grow is called primary clustering. The probe sequence wraps around, so occupied slots at the end and beginning can belong to one cluster.',
      example: 'In a ten-slot table, occupied slots 8, 9, 0, and 1 form one cluster of length 4. A completely full table forms one cluster of length 10.',
    },
    {
      title: 'Count a concrete probe sequence',
      content: 'One inspected slot is one probe. Count the successful slot or the empty stopping slot too. Higher occupancy generally increases expected probing under standard hashing assumptions, because fewer empty stopping positions remain. The layout and the requested key determine the actual work in a particular search.',
      example: 'Both example tables have five entries in ten slots. Searching for absent key 50 takes 2 probes in [0, empty, 2, empty, 4, empty, 6, empty, 8, empty], and 6 probes in [0, 10, 20, 30, 40, empty, empty, empty, empty, empty].',
    },
    {
      title: 'Make space, then rehash',
      content: 'Resizing changes m, which changes the hash calculation. Allocate a larger empty table and insert each existing key using the new capacity. This is rehashing. An implementation chooses a threshold based on its performance needs. A threshold such as 0.7 is a design choice. Prime capacity alone still allows collisions.',
      example: 'With key mod m, key 32 has home slot 2 when m = 10, and home slot 12 when m = 20. Recompute home slots and resolve any new collisions during the move.',
    },
    {
      title: 'Know which table model you are using',
      content: 'Our open-addressed table stores at most one entry in each slot, so 0 ≤ α ≤ 1. A new distinct key needs free capacity. At α = 1, search and insertion still stop after at most m probes. Separate chaining can store multiple entries per bucket, so its load factor can exceed 1. Deleted markers continue a probe sequence and may increase work even as the live-entry count falls.',
      example: 'Twelve entries in eight chaining buckets give α = 1.5. Our eight-slot linear-probing table can hold at most eight live entries.',
    },
  ],
  warmup: {
    question: 'A linear-probing table has 10 slots and 3 stored entries. Which number counts occupied slots?',
    options: ['3', '7', '10'],
    correctAnswer: 0,
    explanation: 'The 3 entries occupy 3 slots. Capacity counts all 10 positions, including the 7 empty ones. This gives α = 3 / 10 = 0.3.',
    hints: ['Count the stored entries first.', 'Three entries occupy three slots. Use all ten slots as the denominator when calculating load factor.'],
  },
  concepts: {
    ratio: {
      title: 'Calculate entries divided by capacity',
      hints: ['Count live entries as n and all slots as m.', 'Use α = n / m. For five entries and ten slots, divide 5 by 10 to get 0.5.'],
      review: 'learn',
    },
    cluster: {
      title: 'Join occupied slots across the table boundary',
      hints: ['Follow neighbouring occupied slots, wrapping after the last index.', 'Slots 8 → 9 → 0 → 1 are one run of four occupied positions. Count each slot once.'],
      review: 'explore',
    },
    'probe-cost': {
      title: 'Count the actual inspected slots',
      hints: ['Begin at key mod m, then follow linear probing.', 'Include the matching or empty stopping slot. Equal load factors can produce different paths for a given key.'],
      review: 'practice',
    },
    rehash: {
      title: 'Recompute home slots after resizing',
      hints: ['Changing the capacity changes the divisor in key mod m.', 'Insert each existing key into the new empty table, using the new hash result and resolving collisions.'],
      review: 'explore',
    },
    'occupancy-model': {
      title: 'Relate load factor to the storage model',
      hints: ['Our linear-probing table has one entry per slot.', 'Separate chaining allows several entries in a bucket, so α can exceed 1 for that model.'],
      review: 'learn',
    },
  },
  questionSets: [
    [
      {
        id: 'lo6-ratio-a', objective: 'LO6', concept: 'ratio',
        question: 'A linear-probing table stores 5 entries in 10 slots. What is its load factor?',
        options: ['0.2', '0.5', '2', '5'], correctAnswer: 1,
        explanation: 'Load factor is entries divided by capacity. Here α = 5 / 10 = 0.5.',
      },
      {
        id: 'lo6-cluster-a', objective: 'LO6', concept: 'cluster',
        question: 'Only slots 8, 9, 0, and 1 are occupied in a ten-slot table. What is the longest cyclic cluster?',
        options: ['2 slots', '3 slots', '4 slots', '10 slots'], correctAnswer: 2,
        explanation: 'Probing wraps from 9 to 0. The run 8 → 9 → 0 → 1 contains four occupied slots in one cluster.',
      },
      {
        id: 'lo6-probes-a', objective: 'LO6', concept: 'probe-cost',
        question: 'Use key mod 10. A spread table has keys at slots 0, 2, 4, 6, 8. A clustered table has keys at slots 0–4. How many probes find that key 50 is absent?',
        options: ['5 in both tables', '2 in the spread table and 6 in the clustered table', '1 in both tables', '6 in the spread table and 2 in the clustered table'], correctAnswer: 1,
        explanation: 'Both searches start at slot 0. The spread table reaches empty slot 1 after two probes. The clustered table reaches empty slot 5 after six probes. Both load factors are 0.5.',
      },
      {
        id: 'lo6-rehash-a', objective: 'LO6', concept: 'rehash',
        question: 'A table uses key mod m and grows from 10 to 20 slots. What is the new home slot of key 32?',
        options: ['2', '10', '12', '32'], correctAnswer: 2,
        explanation: 'Recompute using the new capacity. The remainder of 32 / 20 is 12, so the new home slot is 12.',
      },
      {
        id: 'lo6-full-a', objective: 'LO6', concept: 'occupancy-model',
        question: 'Our linear-probing table has α = 1 and every slot holds a live entry. What happens when inserting a new distinct key?',
        options: ['A bounded scan reports full until capacity is freed or increased.', 'It can overwrite an arbitrary entry.', 'It keeps probing forever.', 'It always creates another bucket automatically.'], correctAnswer: 0,
        explanation: 'With one live entry in every slot, a new distinct key has no free position. After inspecting at most m slots, insertion reports full. The implementation can then resize and rehash.',
      },
    ],
    [
      {
        id: 'lo6-ratio-b', objective: 'LO6', concept: 'ratio',
        question: 'A table stores 3 entries in 8 slots. What is α?',
        options: ['0.375', '0.625', '3', '8'], correctAnswer: 0,
        explanation: 'Divide 3 entries by 8 slots. The load factor is 0.375, meaning 37.5% occupancy.',
      },
      {
        id: 'lo6-cluster-b', objective: 'LO6', concept: 'cluster',
        question: 'All four slots in a four-slot table are occupied. How should its cyclic occupied cluster be counted?',
        options: ['Four separate clusters', 'Two clusters of length 4', 'One cluster of length 4', 'One cluster of length 8'], correctAnswer: 2,
        explanation: 'Every occupied slot belongs to one connected run around the table. Count its four positions once, giving one cluster of length 4.',
      },
      {
        id: 'lo6-probes-b', objective: 'LO6', concept: 'probe-cost',
        question: 'Two tables both have α = 0.5. What determines the exact probes for a particular search?',
        options: ['The load factor guarantees an identical count.', 'The requested key and occupied layout matter alongside load factor.', 'The count is always half the capacity.', 'Only the number of table rows on screen matters.'], correctAnswer: 1,
        explanation: 'Load factor records occupancy. The hash result, layout, and stopping position determine the actual path for the selected key.',
      },
      {
        id: 'lo6-rehash-b', objective: 'LO6', concept: 'rehash',
        question: 'Why are existing keys inserted again when a table is resized?',
        options: ['Their numeric values must change.', 'Every key must be sorted first.', 'A prime capacity eliminates every collision.', 'Home slots must be recomputed using the new capacity.'], correctAnswer: 3,
        explanation: 'Resizing changes the hash divisor. Recompute each key’s home slot and resolve collisions while populating the new empty table. Different keys can still share a remainder.',
      },
      {
        id: 'lo6-model-b', objective: 'LO6', concept: 'occupancy-model',
        question: 'Separate chaining stores 12 entries in 8 buckets, so α = 1.5. Why can this exceed the limit for our linear-probing table?',
        options: ['Chaining can store multiple entries in each bucket.', 'Load factor always ignores half the entries.', 'Our linear-probing slots can each hold unlimited entries.', 'A capacity of 8 creates exactly 12 positions.'], correctAnswer: 0,
        explanation: 'A chaining bucket can contain several entries. Our open-addressed model stores one live entry per slot and has α ≤ 1.',
      },
    ],
  ],
  refresher: [
    'Count entries, then divide by all slots. Five entries in ten slots give α = 0.5.',
    'A cluster is a consecutive occupied run along the cyclic probe path. Join the last and first slots when both are occupied.',
    'Start at key mod m and count every inspected slot, including the empty stopping position. A full table still has a bounded m-slot scan.',
    'To grow a table, allocate more slots and reinsert each key using the new capacity. Compare actual paths for a chosen key before and after.',
  ],
  reflectionPrompt: 'Explain how two tables with α = 0.5 can take different numbers of probes for the same missing key. Then explain what must happen to existing keys when the table grows.',
}

export const LOAD_FACTOR_PRACTICE = [
  {
    id: 'ratio-ten', type: 'load',
    table: [0, null, 2, null, 4, null, 6, null, null, null],
    question: 'This table has 4 entries in 10 slots. What is its load factor?',
    options: ['0.4', '0.6', '2.5'], correctAnswer: 0,
    explanation: 'Count four stored keys and ten total positions. Divide 4 by 10 to obtain α = 0.4.',
    hints: ['The numerator counts occupied slots.', 'Use α = n / m = 4 / 10.'],
  },
  {
    id: 'wrapped-cluster', type: 'cluster',
    table: [12, null, null, null, 4, 5],
    question: 'What is the length of the longest occupied cluster in this six-slot table?',
    options: ['2', '3', '6'], correctAnswer: 1,
    explanation: 'The run crosses the boundary. Occupied slots 4 → 5 → 0 form one cluster of length 3.',
    hints: ['The last slot and slot zero are neighbours along the probe path.', 'Trace 4 → 5 → 0, then stop at empty slot 1.'],
  },
  {
    id: 'clustered-search', type: 'search', key: 50,
    table: [0, 10, 20, 30, 40, null, null, null, null, null],
    question: 'Using key mod 10, how many probes show that key 50 is absent?',
    options: ['5', '1', '6'], correctAnswer: 2,
    explanation: 'Start at 50 mod 10 = 0. Inspect slots 0, 1, 2, 3, 4, and empty slot 5. The stopping slot counts, giving six probes.',
    hints: ['Start at slot zero and move one slot at a time.', 'Count the five occupied positions and the empty stopping position.'],
  },
  {
    id: 'ratio-eight', type: 'load',
    table: [0, null, 2, null, 4, null, null, null],
    question: 'A fresh table has 3 entries in 8 slots. What is its load factor?',
    options: ['0.625', '0.375', '3'], correctAnswer: 1,
    explanation: 'There are three occupied positions and eight total slots. The quotient 3 / 8 is 0.375.',
    hints: ['Capacity includes every empty slot too.', 'Divide 3 by 8. The percentage is 37.5%.'],
  },
  {
    id: 'full-search', type: 'search', key: 8,
    table: [0, 1, 2, 3],
    question: 'How many probes does searching for absent key 8 take in this full four-slot table?',
    options: ['0', '4', '8'], correctAnswer: 1,
    explanation: 'The home slot is 8 mod 4 = 0. Inspect slots 0 → 1 → 2 → 3 once, then report the key absent after four probes.',
    hints: ['A full table still has a fixed stopping bound.', 'Inspect each of the four slots once.'],
  },
  {
    id: 'resize-home', type: 'rehash', key: 13, newCapacity: 20,
    table: [null, null, null, 3, 13, 23, null, null, null, null],
    question: 'This table grows to 20 slots. With key mod m, what is the new home slot of key 13?',
    options: ['4', '3', '13'], correctAnswer: 2,
    explanation: 'Use the new capacity in the hash function. Since 13 mod 20 = 13, the key’s new home slot is 13. Rehash all existing keys as the table grows.',
    hints: ['Recompute the home slot using the new divisor.', 'Divide 13 by 20. The remainder is 13.'],
  },
]
