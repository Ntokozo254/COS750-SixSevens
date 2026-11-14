import ArrayDragVisual from "../components/learning/visuals/ArrayDragVisual"
import ArrayInsertVisual from "../components/learning/visuals/ArrayInsertVisual"
import ArraySearchDeleteVisual from "../components/learning/visuals/ArraySearchDeleteVisual"
import HashingExampleVisual from "../components/learning/visuals/HashingExampleVisual"
import HashSearchVisual from "../components/learning/visuals/HashSearchVisual"
import CollisionVisual from "../components/learning/visuals/CollisonVisual"
import ChainingPointersVisual from "../components/learning/visuals/ChainingPointersVisual"
import TerminologyVisual from "../components/learning/visuals/TerminologyVisual"
import TimeComplexityVisual from "../components/learning/visuals/TimeComplexityVisual"
import HashFunctionVisual from "../components/learning/visuals/HashFunctionVisual"
import HashCalculatorVisual from "../components/learning/visuals/HashCalculatorVisual"
import GoodHashVisual from "../components/learning/visuals/GoodHashVisual"
import HashQuizVisual from "../components/learning/visuals/HashQuizVisual"
import CollisionTraceVisual from "../components/learning/visuals/CollisionTraceVisual"
import CollisionSpotVisual from "../components/learning/visuals/CollisionSpotVisual"
import PigeonholeVisual from "../components/learning/visuals/PigeonholeVisual"
import CollisionQuizVisual from "../components/learning/visuals/CollisionQuizVisual"

// ...one import per visual

export const lessonCards = {
  1: [
    {
       id: 1,
       title: "What is a hash table?",
       description: "Hash tables are fundamentally built on top of arrays because arrays offer O(1) (constant time) random access memory.",
       Visual: ArrayDragVisual,
     },
    {
        id: 2,
        title: "The Array Inspo",
        description: "These are arrays as you already know them.  Arrays mainly fall short in two areas: Inserting an element in the middle of an array requires us to shift other elements in our array,which is O(n) (linear time).  ",
        Visual: ArrayInsertVisual,
      },
       {
          id: 3,
          title: "The Array Inspo(continued)",
          description: "Second problem: Searching or deleting from an array requires us to traverse all elements in the array until target is found .",
          Visual: ArraySearchDeleteVisual,
        },
        {
    id: 4,
    title: "Hash Tables as a solution",
    description: "At its lowest level, a hash table is just a fixed-size array of slots (often called 'buckets'). If you know the exact integer index of an array slot, the computer can jump to that memory location instantly. However, humans want to look up data using keys like strings (e.g., 'john_doe'), objects, or non-sequential IDs. An array cannot use a string as an index directly.",
Visual: HashFunctionVisual,
  },
   {
    id: 5,
    title: "The Hash Function  ",
    description: "To bridge this gap, the hash table uses a mathematical formula called a hash function. The hash function takes the custom key and performs two quick steps. Because they map keys to specific array indices using a hash function, they achieve an average time complexity of O(1) (constant time) for searches, insertions, and deletions.",
    Visual: HashFunctionVisual,
  },
   {
      id: 6,
      title: "The Hash Function(continued)  ",
      description: "Using our example from slide 4, Step 1: Hashing: It converts the key into a large integer (the 'hash code'). For example, 'john_doe' might become 4829103 . Step 2:Modulo Compression: Since the underlying array has a fixed size (let's say 10 slots), the large integer is squeezed down to fit the array's boundaries using the modulo (%) operator. ",
  
      Visual: HashingExampleVisual,
    },
     {
        id: 7,
        title: "The Hash Function(continued)  ",
        description: "The previous slide showed how a key is hashed and stored. Now, let us see how searching becomes easier.",
    
        Visual: HashSearchVisual,
      },
       {
          id: 8,
          title: "Hash Collisions  ",
          description: "When two keys hash to the same bucket - a collision happens. 2 simple collison techniques exist: Separate chaining: = each bucket holds a small list, and colliding keys are appended to it. As long as the table isn't too full (a low load factor) and the hash spreads keys well, chains stay short and insert, lookup, and delete are O(1) on average. Linear Probing:=linear probing resolves the conflict by searching for the next sequentially available slot (index + 1, index + 2, index + 3, and so on) until an empty one is found.",
      
          Visual: CollisionVisual,
        },
         {
            id: 9,
            title: "Linked Lists AS Inspo",
            description: "Linear probing is simple. Seperate chaining uses the same idea from linked lists, Instead of storing a single key-value pair directly in a bucket, each bucket stores a pointer to the head of a linked list (or chain). If a bucket is empty, its pointer is NULL ",
        
            Visual: ChainingPointersVisual,
          },
            {
            id: 10,
            title: "Some Important Hash Terminology  ",
            description: "When working with Hash Tables, it is important to understand what each term means.",
        
            Visual: TerminologyVisual,
          },
             {
            id: 11,
            title: "Time complexity of Hash Tables  ",
            description: "Time complexity describes how the time taken for an operation changes as the amount of data grows. For hash tables, we’re usually interested in how long it takes to add a new item (insert), remove an item (delete), or find an item (search). The good news is that the general time complexity applies similarly to all these key operations.",
        
            Visual: TimeComplexityVisual,
          },
  ],
  2: [
    {
      id: 1,
      title: "The rule: key mod m",
      description:
        "A hash function turns a key into a slot number. The simplest one is h(k) = k mod m: divide the key by the table size m and keep the remainder. The remainder is always between 0 and m − 1, so it is always a valid slot. Press Play to watch three keys being hashed.",
      Visual: HashFunctionVisual,
    },
    {
      id: 2,
      title: "Try it yourself",
      description:
        "Before you type, predict where the key will land. Then check. Change the table size and see how the same key moves to a different slot.",
      Visual: HashCalculatorVisual,
    },
    {
      id: 3,
      title: "What makes a good hash function?",
      description:
        "A good hash function is deterministic (the same key always gives the same slot), fast to compute, and spreads keys evenly across the table. The table size matters: if keys share a pattern, a size like 10 can send them all to the same slot. A prime size is a common fix. Switch between m = 10 and m = 7.",
      Visual: GoodHashVisual,
    },
    {
      id: 4,
      title: "Quick check",
      description:
        "Four short questions. Every answer explains why, so a wrong answer is still useful. Get 3 out of 4 and you're ready for Module 3: collisions.",
      Visual: HashQuizVisual,
    },
  ],
  3: [
    {
      id: 1,
      title: "Two keys, one slot",
      description:
        "A collision happens when two different keys hash to the same slot. The slot is already taken, so the new key cannot simply go there. Step through five inserts and watch for the keys that hit a taken slot.",
      Visual: CollisionTraceVisual,
    },
    {
      id: 2,
      title: "Spot the collision",
      description:
        "The table already holds four keys. For each new key, work out k mod 10 in your head, check that slot, and decide: collision or not? You can always see the table, so look before you answer.",
      Visual: CollisionSpotVisual,
    },
    {
      id: 3,
      title: "Why collisions can't be avoided",
      description:
        "There are far more possible keys than slots, so some keys must share. If you put 11 keys into 10 slots, at least two share a slot. This is the pigeonhole principle. In practice collisions start much sooner than that. Add keys one at a time and see when the first one happens.",
      Visual: PigeonholeVisual,
    },
    {
      id: 4,
      title: "Quick check",
      description:
        "Four short questions. Every answer explains why. Get 3 out of 4 and you're ready for Module 4, where you'll learn what to do with a key that collides.",
      Visual: CollisionQuizVisual,
    },
  ],
}