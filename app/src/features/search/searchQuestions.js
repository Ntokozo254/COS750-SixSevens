export const SEARCH_CONCEPT_GUIDANCE = {
  'probe-order': {
    title: 'Follow the same probe sequence',
    hints: [
      'Calculate the home slot using key mod table size.',
      'Inspect consecutive slots. After the final slot, continue at index 0.',
    ],
    review: 'explore',
  },
  'stop-empty': {
    title: 'Stop at a truly empty slot',
    hints: [
      'A different occupied key means keep probing.',
      'A truly empty slot ends the sequence. The target would have occupied an available slot along this path when inserted.',
    ],
    review: 'practice',
  },
  'skip-tombstone': {
    title: 'Continue past deleted markers',
    hints: [
      'A deleted marker means a key previously occupied this slot.',
      'A later key may depend on that probe path. Continue until a match, a truly empty slot, or one complete traversal.',
    ],
    review: 'explore',
  },
  'full-exhaustion': {
    title: 'Bound the search by table capacity',
    hints: [
      'Count each slot inspection, including occupied slots and deleted markers.',
      'After m inspections in a table of capacity m, every possible slot has been checked. An absent search can finish.',
    ],
    review: 'practice',
  },
  cost: {
    title: 'Separate expected cost from the worst case',
    hints: [
      'Expected O(1) probing assumes a suitable hash function and controlled effective occupancy, including deleted markers.',
      'A search can inspect all m slots in the worst case. Its probe cost is O(m), where m is capacity.',
    ],
    review: 'learn',
  },
}

export const SEARCH_QUESTION_SETS = [
  [
    {
      id: 'lo5-probe-order-a',
      objective: 'LO5',
      concept: 'probe-order',
      question:
        'A table has 10 slots. Slots 2, 3, and 4 hold keys 12, 22, and 32. Using key mod 10 and linear probing, which slots are inspected when searching for 32?',
      options: ['4 only', '2, 4', '2, 3, 4', '0, 1, 2, 3, 4'],
      correctAnswer: 2,
      explanation:
        '32 mod 10 = 2. Inspect slot 2, then slot 3, then find 32 at slot 4. This takes three inspections.',
      scenario: {
        table: [null, null, 12, 22, 32, null, null, null, null, null],
        key: 32,
        visited: [2, 3, 4],
        reason: 'found',
        answerValue: '2, 3, 4',
      },
    },
    {
      id: 'lo5-stop-empty-a',
      objective: 'LO5',
      concept: 'stop-empty',
      question:
        'A 10-slot table holds 12, 22, and 32 at slots 2, 3, and 4. Slot 5 is truly empty. Using key mod 10, a search for 42 has inspected slots 2, 3, and 4 without a match. What happens next?',
      options: [
        'Return 32 because it shares the home slot.',
        'Inspect empty slot 5 and report 42 absent.',
        'Continue until every table slot has been inspected.',
        'Restart at slot 2 immediately.',
      ],
      correctAnswer: 1,
      explanation:
        '42 mod 10 = 2. After passing 12, 22, and 32, the search reaches truly empty slot 5. It can report 42 absent after four inspections.',
      scenario: {
        table: [null, null, 12, 22, 32, null, null, null, null, null],
        key: 42,
        visited: [2, 3, 4, 5],
        reason: 'empty',
        answerValue: 'Inspect empty slot 5 and report 42 absent.',
      },
    },
    {
      id: 'lo5-skip-tombstone-a',
      objective: 'LO5',
      concept: 'skip-tombstone',
      question:
        'Slot 2 holds 12, slot 3 is marked deleted, and slot 4 holds 32. A search for 32 starts at slot 2. What should happen at slot 3?',
      options: [
        'Report 32 absent.',
        'Return the deleted marker.',
        'Continue to slot 4 and compare its key.',
        'Move 12 into the deleted slot.',
      ],
      correctAnswer: 2,
      explanation:
        'The deleted marker preserves the probe path to later keys. Continue past slot 3 and find 32 at slot 4.',
      scenario: {
        table: [null, null, 12, { tombstone: true }, 32, null, null, null, null, null],
        key: 32,
        visited: [2, 3, 4],
        reason: 'found',
        answerValue: 'Continue to slot 4 and compare its key.',
      },
    },
    {
      id: 'lo5-full-exhaustion-a',
      objective: 'LO5',
      concept: 'full-exhaustion',
      question:
        'A 5-slot table is full, holding keys 0, 1, 2, 3, and 4 at their matching indices. Searching for absent key 9 starts at slot 4. When can it finish?',
      options: [
        'After inspecting slot 4 only.',
        'After inspecting 4, 0, 1, 2, and 3 once each.',
        'Only after an empty slot appears.',
        'After repeatedly circling the table.',
      ],
      correctAnswer: 1,
      explanation:
        'The probe inspects every slot once. After five inspections, every possible location has been checked and 9 is reported absent.',
      scenario: {
        table: [0, 1, 2, 3, 4],
        key: 9,
        visited: [4, 0, 1, 2, 3],
        reason: 'exhausted',
        answerValue: 'After inspecting 4, 0, 1, 2, and 3 once each.',
      },
    },
    {
      id: 'lo5-cost-a',
      objective: 'LO5',
      concept: 'cost',
      question: 'Which conditions support expected O(1) search with linear probing?',
      options: [
        'All keys share the same home slot.',
        'A suitable hash function spreads keys and effective occupancy stays under control.',
        'Every slot is occupied or marked deleted.',
        'The keys are stored in numerical order.',
      ],
      correctAnswer: 1,
      explanation:
        'Good distribution and controlled effective occupancy keep expected probe sequences short. A large number of occupied slots or deleted markers can lengthen a search.',
    },
  ],
  [
    {
      id: 'lo5-probe-order-b',
      objective: 'LO5',
      concept: 'probe-order',
      question:
        'A 10-slot table has key 9 at slot 9 and key 19 at slot 0. Using key mod 10, which slots are inspected when searching for 19?',
      options: ['0 only', '9, 0', '9, 8, 7, 0', '1, 9'],
      correctAnswer: 1,
      explanation:
        '19 mod 10 = 9. Slot 9 holds another key, so the probe wraps to index 0 and finds 19.',
      scenario: {
        table: [19, null, null, null, null, null, null, null, null, 9],
        key: 19,
        visited: [9, 0],
        reason: 'found',
        answerValue: '9, 0',
      },
    },
    {
      id: 'lo5-stop-empty-b',
      objective: 'LO5',
      concept: 'stop-empty',
      question:
        'In a 10-slot table, slot 9 holds 9, slot 0 holds 19, and slot 1 is truly empty. What happens when searching for 29?',
      options: [
        'Return 19 because its home slot is also 9.',
        'Stop at slot 9 because a different key is there.',
        'Inspect 9, 0, then empty slot 1, and report 29 absent.',
        'Inspect only slot 1.',
      ],
      correctAnswer: 2,
      explanation:
        '29 mod 10 = 9. The search follows slots 9 and 0, then reaches truly empty slot 1. It finishes with an absent result after three inspections.',
      scenario: {
        table: [19, null, null, null, null, null, null, null, null, 9],
        key: 29,
        visited: [9, 0, 1],
        reason: 'empty',
        answerValue: 'Inspect 9, 0, then empty slot 1, and report 29 absent.',
      },
    },
    {
      id: 'lo5-skip-tombstone-b',
      objective: 'LO5',
      concept: 'skip-tombstone',
      question:
        'In a 10-slot table, slot 9 is marked deleted and slot 0 holds 19. Searching for 19 begins at slot 9. What should the search do?',
      options: [
        'Continue past the deleted marker, wrap to slot 0, and find 19.',
        'Stop at slot 9 and report 19 absent.',
        'Return the deleted marker as 19.',
        'Restart at slot 1.',
      ],
      correctAnswer: 0,
      explanation:
        'A deleted marker allows probing to continue. Advancing from slot 9 wraps to slot 0, where 19 is found.',
      scenario: {
        table: [19, null, null, null, null, null, null, null, null, { tombstone: true }],
        key: 19,
        visited: [9, 0],
        reason: 'found',
        answerValue: 'Continue past the deleted marker, wrap to slot 0, and find 19.',
      },
    },
    {
      id: 'lo5-full-exhaustion-b',
      objective: 'LO5',
      concept: 'full-exhaustion',
      question:
        'A 4-slot table holds [0, 1, 2, 3] and has no empty slots. Using key mod 4, how many slots are inspected before an absent search for 6 finishes?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 3,
      explanation:
        'The home slot is 6 mod 4 = 2. The search inspects 2, 3, 0, and 1. Four inspections exhaust the table.',
      scenario: {
        table: [0, 1, 2, 3],
        key: 6,
        visited: [2, 3, 0, 1],
        reason: 'exhausted',
        answerValue: '4',
      },
    },
    {
      id: 'lo5-cost-b',
      objective: 'LO5',
      concept: 'cost',
      question:
        'A hash table has capacity m. What is the worst-case probe cost of a bounded linear-probing search?',
      options: ['O(1) in every case', 'O(log m)', 'O(m)', 'An unlimited number of inspections'],
      correctAnswer: 2,
      explanation:
        'A bounded search can inspect all m slots once before reporting an absent result. The worst-case probe cost is O(m), with m equal to table capacity.',
    },
  ],
  [
    {
      id: 'lo5-probe-order-c',
      objective: 'LO5',
      concept: 'probe-order',
      question:
        'A 5-slot table uses key mod 5. Keys 4, 9, and 14 occupy slots 4, 0, and 1. Which slots are inspected when searching for 14?',
      options: ['1 only', '4, 1', '4, 0, 1', '0, 1, 4'],
      correctAnswer: 2,
      explanation: '14 mod 5 = 4. Inspect slot 4, wrap to slot 0, then find 14 at slot 1.',
      scenario: {
        table: [9, 14, null, null, 4],
        key: 14,
        visited: [4, 0, 1],
        reason: 'found',
        answerValue: '4, 0, 1',
      },
    },
    {
      id: 'lo5-stop-empty-c',
      objective: 'LO5',
      concept: 'stop-empty',
      question:
        'In a 5-slot table, keys 4 and 9 occupy slots 4 and 0. Slot 1 is truly empty. Why can a search for 14 stop at slot 1?',
      options: [
        '14 must be larger than every stored key.',
        'The insertion path for 14 would have used this available slot.',
        'Every slot after index 1 must also be empty.',
        'Wrapping around always means failure.',
      ],
      correctAnswer: 1,
      explanation:
        'Search follows the same probe sequence as insertion. After inspecting slots 4 and 0, a truly empty slot at 1 establishes that 14 was never placed farther along this sequence.',
      scenario: {
        table: [9, null, null, null, 4],
        key: 14,
        visited: [4, 0, 1],
        reason: 'empty',
        answerValue: 'The insertion path for 14 would have used this available slot.',
      },
    },
    {
      id: 'lo5-skip-tombstone-c',
      objective: 'LO5',
      concept: 'skip-tombstone',
      question:
        'In a 5-slot table, slot 1 holds 1, slot 2 is marked deleted, and slot 3 is truly empty. Which slots are inspected when searching for absent key 11?',
      options: ['1 only', '1, 2', '1, 2, 3', '0, 1, 2, 3, 4'],
      correctAnswer: 2,
      explanation:
        '11 mod 5 = 1. Pass the different key at slot 1, continue through the deleted marker at 2, then stop at truly empty slot 3.',
      scenario: {
        table: [null, 1, { tombstone: true }, null, null],
        key: 11,
        visited: [1, 2, 3],
        reason: 'empty',
        answerValue: '1, 2, 3',
      },
    },
    {
      id: 'lo5-full-exhaustion-c',
      objective: 'LO5',
      concept: 'full-exhaustion',
      question:
        'A 4-slot table holds [0, deleted, 2, 3]. There are no truly empty slots. How many slots are inspected before searching for absent key 5 finishes?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 3,
      explanation:
        '5 mod 4 = 1. Continue through the deleted marker and inspect slots 1, 2, 3, and 0. All four slots have been checked, so the search finishes.',
      scenario: {
        table: [0, { tombstone: true }, 2, 3],
        key: 5,
        visited: [1, 2, 3, 0],
        reason: 'exhausted',
        answerValue: '4',
      },
    },
    {
      id: 'lo5-cost-c',
      objective: 'LO5',
      concept: 'cost',
      question: 'Why can many collisions or deleted markers make a hash-table search slow?',
      options: [
        'They force the search to sort the table.',
        'They can lengthen the probe sequence up to all m slots.',
        'They change the table into a linked list.',
        'They make wrapping around impossible.',
      ],
      correctAnswer: 1,
      explanation:
        'Hashing chooses the starting slot. The search can then pass a long sequence of occupied slots and deleted markers, inspecting up to the table capacity m.',
    },
  ],
]

export function markSearchAttempt(questions, answers) {
  if (
    !Array.isArray(questions) ||
    questions.length !== 5 ||
    !Array.isArray(answers) ||
    answers.length !== 5
  ) {
    throw new TypeError('Mark a complete attempt with five questions and five submitted answers.')
  }

  if (
    questions.some((question, index) => {
      const answer = answers[index]
      return !Number.isInteger(answer) || answer < 0 || answer >= question.options.length
    })
  ) {
    throw new TypeError('Every submitted answer must identify one of its question options.')
  }

  const missedConcepts = questions
    .filter((question, index) => answers[index] !== question.correctAnswer)
    .map((question) => question.concept)
  const correct = questions.length - missedConcepts.length
  const score = (correct / questions.length) * 100

  return { total: questions.length, correct, score, passed: score >= 80, missedConcepts }
}
