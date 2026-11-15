import { PROBING_CONCEPTS, PROBING_QUESTION_SETS } from './probingQuestions.js'

const concepts = Object.fromEntries(
  Object.entries(PROBING_CONCEPTS).map(([id, concept]) => [
    id,
    {
      title: concept.title,
      hints: [
        id === 'collision'
          ? 'If a slot holds a different key, preserve that entry and inspect the next slot.'
          : concept.hint,
        {
          home: 'For key 32 in 10 slots, 32 = 3 × 10 + 2. Begin at slot 2.',
          collision: 'If the same key is already stored, report a duplicate. A new distinct key can continue probing until a free slot is found or the table is exhausted.',
          'probe-count': 'The stopping slot counts too. Passing three occupied slots and then finding an empty one takes four inspections.',
          wrap: 'For a 10-slot table, (9 + 1) mod 10 = 0. There is no slot 10.',
          full: 'A free slot found on the mth inspection still permits insertion. Report full when all m inspected slots are occupied by other keys.',
        }[id],
      ],
      review: concept.review === 'trace' ? 'explore' : concept.review,
    },
  ]),
)

export const PROBING_TOPIC = {
  id: 4,
  title: 'Linear Probing',
  introduction: 'Linear probing stores a new key by following consecutive slots from its home position. See how it preserves existing entries, wraps around, and finishes with an insertion, a duplicate result, or a full-table result.',
  scenario: 'A student-record table has 10 slots. Key 12 already occupies slot 2, and the system receives a different record under key 22. Both keys have home slot 2. Where can 22 go so both records remain accessible?',
  outcomes: [
    'Calculate the first slot using key mod table size.',
    'Trace insertion through different occupied keys while preserving their entries.',
    'Apply wrap-around and count every inspected slot, including the stopping slot.',
    'Distinguish successful insertion, a duplicate key, and a bounded full-table result.',
  ],
  warmup: {
    question: 'A 10-slot table uses key mod 10. Slot 2 holds 12, and slot 3 is empty. Predict where a new key 22 will be stored.',
    options: ['Slot 2, replacing 12', 'Slot 3', 'Slot 9', 'Slot 10'],
    correctAnswer: 1,
    explanation: '22 mod 10 = 2. Preserve key 12 at slot 2, then use empty slot 3. Both keys remain stored.',
    hints: [
      'Calculate the home slot first. Modulo gives the remainder after division.',
      '22 = 2 × 10 + 2. Slot 2 is occupied by another key, so inspect the next slot, index 3.',
    ],
  },
  sections: [
    {
      title: 'A starting slot for each key',
      content: 'A key identifies an entry, such as a student record. A slot is one array position. A table with m slots has indices from 0 to m − 1. Our hash function calculates key mod m, the remainder after division. This gives the home slot where insertion starts.',
      example: '32 = 3 × 10 + 2, so 32 mod 10 = 2. Key 32 begins at slot 2 in a 10-slot table.',
    },
    {
      title: 'Check before moving',
      content: 'An empty slot can store the new key. If the slot holds the same key, report a duplicate request and preserve its existing entry. If it holds a different key, keep that entry and inspect the next slot. A collision between different keys can therefore lead to another storage position.',
      example: '12 mod 10 = 2 and 22 mod 10 = 2. These different keys collide. Receiving key 12 again repeats one key and produces a duplicate result.',
    },
    {
      title: 'One slot at a time',
      content: 'The next-slot rule is (index + 1) mod m. Every move advances by one position, whatever the key value. After the last index, continue from slot 0. These demonstration tables start empty and use insertions only.',
      example: 'In 7 slots, keys 6, 13, and 20 all hash to slot 6. Inserting in that order puts them at slots 6, 0, and 1.',
    },
    {
      title: 'A worked table you can search later',
      content: 'The first worked trace inserts 12, 22, 32, 9, and 19 into 10 slots. Follow each home-slot calculation and inspect every occupied position along the path. This creates the same table used by Module 5 when it demonstrates searching.',
      example: '12 goes to slot 2. Key 22 continues to slot 3, and 32 continues to slot 4. Key 9 uses slot 9. Key 19 also starts at 9, then wraps to empty slot 0.',
    },
    {
      title: 'Correct a tempting prediction',
      content: 'A learner predicts that 22 should replace 12 because both hash to slot 2. That would lose the first record. Keep 12 at slot 2 and look at the next slot. If slot 3 is empty, store 22 there. Recompute the home slot and identify which entry must stay when a prediction goes wrong.',
      example: 'The home slot for 22 is still 2, while its final storage position is 3. Search later retraces the same probe path to find it.',
    },
    {
      title: 'Finish after at most one circuit',
      content: 'Count the home slot, each occupied slot passed, and the stopping slot. A free position found on the mth inspection is usable. When every one of the m inspected slots holds another key, report the table full and preserve the stored entries. Increasing capacity requires rehashing, which Module 6 explains.',
      example: 'After inserting 5, 10, and 15 into 3 slots, key 20 starts at slot 2 and checks 2 → 0 → 1. Every slot is occupied, so it reports full after 3 inspections.',
    },
    {
      title: 'Connect inspections with running time',
      content: 'Suitable key distribution and controlled occupancy support expected O(1) probe cost. A long occupied run can make insertion inspect all m slots, giving O(m) worst-case probe cost. A collision can be resolved when another slot is available. A full table can reject the new distinct key.',
      example: 'With entries at slots 2, 3, and 4, inserting 42 checks those three positions and empty slot 5. The insertion takes 4 slot inspections.',
    },
  ],
  concepts,
  questionSets: PROBING_QUESTION_SETS,
  assessmentTitle: 'Can you insert with linear probing?',
  masteryMessage: 'Use the same hash calculation and probe path when searching for a displaced key in Module 5.',
  refresher: [
    'Calculate the home slot. In 10 slots, 32 mod 10 = 2.',
    'If slot 2 holds 12 and slot 3 holds 22, preserve both different keys and continue to slot 4.',
    'If slot 4 is empty, store 32 there. This takes three inspections, including the empty stopping slot.',
    'After the final index, wrap to 0. Report a duplicate when the same key is found, and report full when all m inspected slots hold other keys.',
  ],
}
