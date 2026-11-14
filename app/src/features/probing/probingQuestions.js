// LO4 knowledge check: two sets of five questions, one per concept.
// Questions with a `scenario` are checked against the real algorithm in the tests.

export const PROBING_CONCEPTS = {
  home: {
    title: 'Start at the home slot',
    hint: 'Work out key mod m. That remainder is the first slot linear probing checks.',
    review: 'learn',
  },
  collision: {
    title: 'A collision moves the key along',
    hint: 'If the slot is taken, the key is not rejected or swapped. Check the next slot, one at a time, until one is empty.',
    review: 'trace',
  },
  'probe-count': {
    title: 'Count every slot you check',
    hint: 'Count the home slot, each occupied slot you pass, and the empty slot where the key is finally stored.',
    review: 'practice',
  },
  wrap: {
    title: 'Wrap around after the last slot',
    hint: 'The next slot is (index + 1) mod m. After slot m - 1 comes slot 0.',
    review: 'trace',
  },
  full: {
    title: 'A full table stops the insert',
    hint: 'After m checks every slot has been tried. If none was empty, the table must be resized before the key can be stored.',
    review: 'trace',
  },
}

export const PROBING_QUESTION_SETS = [
  [
    {
      id: 'lo4-home-a',
      concept: 'home',
      question: 'A table has 10 slots and uses key mod 10. Which slot does key 47 check first?',
      options: ['Slot 4', 'Slot 7', 'Slot 47', 'Slot 0'],
      correctAnswer: 1,
      explanation: '47 mod 10 = 7, so 47 starts at slot 7.',
      scenario: { size: 10, entries: {}, key: 47, expect: 'home', value: 7 },
    },
    {
      id: 'lo4-collision-a',
      concept: 'collision',
      question: 'In a 10-slot table, slot 3 holds 13 and slot 4 is empty. Where is 23 stored?',
      options: ['Slot 3, replacing 13', 'Slot 4', 'Nowhere: the key is rejected', 'Slot 2'],
      correctAnswer: 1,
      explanation: '23 mod 10 = 3, but slot 3 is taken. Linear probing checks slot 4, which is empty, so 23 goes there.',
      scenario: { size: 10, entries: { 3: 13 }, key: 23, expect: 'slot', value: 4 },
    },
    {
      id: 'lo4-probe-count-a',
      concept: 'probe-count',
      question: 'Slots 2, 3 and 4 hold 12, 22 and 32, and slot 5 is empty. How many slots are checked when inserting 42?',
      options: ['1', '3', '4', '5'],
      correctAnswer: 2,
      explanation: '42 mod 10 = 2. Check slots 2, 3 and 4 (all taken), then slot 5 (empty). That is 4 checks.',
      scenario: { size: 10, entries: { 2: 12, 3: 22, 4: 32 }, key: 42, expect: 'checks', value: 4 },
    },
    {
      id: 'lo4-wrap-a',
      concept: 'wrap',
      question: 'A 10-slot table has 19 in slot 9, and slot 0 is empty. Where is 29 stored?',
      options: ['Slot 10', 'Slot 0', 'Slot 8', 'Nowhere: it is past the end'],
      correctAnswer: 1,
      explanation: '29 mod 10 = 9, which is taken. The next slot is (9 + 1) mod 10 = 0, which is empty.',
      scenario: { size: 10, entries: { 9: 19 }, key: 29, expect: 'slot', value: 0 },
    },
    {
      id: 'lo4-full-a',
      concept: 'full',
      question: 'A 5-slot table already holds 5 keys. What happens when you insert a sixth key?',
      options: [
        'It overwrites the key in its home slot',
        'It checks all 5 slots, finds none empty, and cannot be stored until the table is resized',
        'It is stored in slot 5',
        'It is added to a linked list in its home slot',
      ],
      correctAnswer: 1,
      explanation: 'Linear probing only ever uses empty slots in the array. After 5 checks every slot has been tried, so the table must grow first.',
    },
  ],
  [
    {
      id: 'lo4-home-b',
      concept: 'home',
      question: 'A table has 7 slots and uses key mod 7. Which slot does key 30 check first?',
      options: ['Slot 4', 'Slot 0', 'Slot 2', 'Slot 3'],
      correctAnswer: 2,
      explanation: '30 = 4 × 7 + 2, so 30 mod 7 = 2.',
      scenario: { size: 7, entries: {}, key: 30, expect: 'home', value: 2 },
    },
    {
      id: 'lo4-collision-b',
      concept: 'collision',
      question: 'In a 10-slot table, slot 6 holds 16, slot 7 holds 27 and slot 8 is empty. Where is 36 stored?',
      options: ['Slot 6', 'Slot 7', 'Slot 8', 'Slot 9'],
      correctAnswer: 2,
      explanation: '36 mod 10 = 6. Slots 6 and 7 are taken, so 36 moves on to slot 8.',
      scenario: { size: 10, entries: { 6: 16, 7: 27 }, key: 36, expect: 'slot', value: 8 },
    },
    {
      id: 'lo4-probe-count-b',
      concept: 'probe-count',
      question: 'In a 10-slot table, slots 4 and 5 hold 14 and 25, and slot 6 is empty. How many slots are checked when inserting 44?',
      options: ['1', '2', '3', '6'],
      correctAnswer: 2,
      explanation: '44 mod 10 = 4. Check slot 4 (taken), slot 5 (taken), then slot 6 (empty): 3 checks.',
      scenario: { size: 10, entries: { 4: 14, 5: 25 }, key: 44, expect: 'checks', value: 3 },
    },
    {
      id: 'lo4-wrap-b',
      concept: 'wrap',
      question: 'A 7-slot table (key mod 7) has 12 in slot 5 and 13 in slot 6. Where is 19 stored?',
      options: ['Slot 0', 'Slot 6', 'Slot 7', 'Slot 1'],
      correctAnswer: 0,
      explanation: '19 mod 7 = 5. Slots 5 and 6 are taken, and slot 6 is the last slot, so probing wraps to slot 0.',
      scenario: { size: 7, entries: { 5: 12, 6: 13 }, key: 19, expect: 'slot', value: 0 },
    },
    {
      id: 'lo4-full-b',
      concept: 'full',
      question: 'Why does linear probing stop after checking m slots in a table of m slots?',
      options: [
        'Because the hash function changes after m checks',
        'Because every slot has now been tried, so the table is full',
        'Because a key may only move once',
        'Because m is always an even number',
      ],
      correctAnswer: 1,
      explanation: 'The probe visits each slot once. After m checks there is nowhere left to try, so the insert fails until the table is resized.',
    },
  ],
]

export function markProbingAttempt(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
    throw new TypeError('Mark a complete attempt: one answer per question.')
  }
  const missedConcepts = questions
    .filter((question, index) => answers[index] !== question.correctAnswer)
    .map((question) => question.concept)
  const correct = questions.length - missedConcepts.length
  const score = Math.round((correct / questions.length) * 100)
  return { total: questions.length, correct, score, passed: score >= 80, missedConcepts }
}
