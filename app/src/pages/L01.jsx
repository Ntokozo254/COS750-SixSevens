import { Link } from "react-router"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
// these are all our visuals seperated so we can update them individually

import ArrayDragVisual from "@/components/learning/visuals/ArrayDragVisual"
import ArrayInsertVisual from "@/components/learning/visuals/ArrayInsertVisual"
import ArraySearchDeleteVisual from "@/components/learning/visuals/ArraySearchDeleteVisual"
import HashingExampleVisual from "@/components/learning/visuals/HashingExampleVisual"
import HashSearchVisual from "@/components/learning/visuals/HashSearchVisual"
import CollisionVisual from "@/components/learning/visuals/CollisonVisual"
import ChainingPointersVisual from "@/components/learning/visuals/ChainingPointersVisual"
import TerminologyVisual from "@/components/learning/visuals/TerminologyVisual"
import TimeComplexityVisual from "@/components/learning/visuals/TimeComplexityVisual"
// Temporary stand-in until the real animation components exist.
function Placeholder({ label = "Simple hash function: h(k) mod N where N is the size of the hash table" }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg bg-blue-600/60 text-sm text-blue-100">
      {label}
    </div>
  )
}

// Each card carries its own title, description and Visual component.
// Later: import ArrayVisual from "@/components/visuals/ArrayVisual" and use Visual: ArrayVisual
const cards = [
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
    Visual: Placeholder,
  },
    {
    id: 5,
    title: "The Hash Function  ",
    description: "To bridge this gap, the hash table uses a mathematical formula called a hash function. The hash function takes the custom key and performs two quick steps. Because they map keys to specific array indices using a hash function, they achieve an average time complexity of O(1) (constant time) for searches, insertions, and deletions.",
    Visual: Placeholder,
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
  // ...add the rest the same way as above bruh
]

export default function L01() {
  return (
    <main className="min-h-screen bg-blue-600 px-4 py-12 text-white">
      <div className="mx-auto mb-6 max-w-5xl">
  <Link
    to="/"
    className="text-sm text-blue-100 underline-offset-4 hover:text-white hover:underline"
  >
    ← Back to lessons
  </Link>
</div>
      <header className="mx-auto mb-6 max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Fundamentals of Hash Tables</h1>
        <p className="mt-2 text-blue-100">Swipe or use the arrows to move through the cards.</p>
      </header>

      <div className="mx-auto max-w-2xl px-12">
        <Carousel opts={{ 
            align: "center",
            //do not let carousel steal drags on our visuals
            watchDrag: (api, evt) => !evt.target.closest("[data-no-swipe]"),
             }}>
          <CarouselContent className="ml-0">
            {cards.map(({ id, title, description, Visual }) => (
              <CarouselItem key={id} className="p-8">
                <Card className="h-full border-0 bg-blue-500 text-white shadow-2xl shadow-blue-950/60 ring-0">
                  <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription className="text-blue-100">{description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Visual />
                  </CardContent>

                  <CardFooter className="border-0 bg-transparent text-sm text-blue-100">
                    {id} / {cards.length}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="border-0 bg-white text-blue-700 hover:bg-blue-50" />
          <CarouselNext className="border-0 bg-white text-blue-700 hover:bg-blue-50" />
        </Carousel>
      </div>
    </main>
  )
}