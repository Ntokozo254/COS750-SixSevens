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

import HashSearchVisual from "@/components/visuals/HashSearchVisual"
import ChainSearchVisual from "@/components/visuals/ChainSearchVisual"
import ProbeSearchVisual from "@/components/visuals/ProbeSearchVisual"
import SearchCodeVisual from "@/components/visuals/SearchCodeVisual"
import TimeComplexityVisual from "@/components/visuals/TimeComplexityVisual"

const cards = [
  {
    id: 1,
    title: "Searching: the big idea",
    description: "Searching a hash table uses the exact same hash function as inserting. Hash the key, compress it with % N, and you know which slot to look in. No scanning the whole array.",
    Visual: HashSearchVisual,
  },
  {
    id: 2,
    title: "Searching with separate chaining",
    description: "Because of collisions, the slot we jump to might hold other keys too. So a search has two parts: (1) jump to the bucket the key hashes to, (2) compare keys until we find a match or prove the key is missing. With chaining, step 2 means walking down that bucket's list until we hit NULL.",
    Visual: ChainSearchVisual,
  },
  {
    id: 3,
    title: "Searching with linear probing",
    description: "With linear probing, a key may have been pushed forward to a later slot. So we start at the hashed slot and check slot after slot. We stop when we find the key, or when we reach an empty slot: an empty slot means the key was never stored.",
    Visual: ProbeSearchVisual,
  },
  {
    id: 4,
    title: "The search algorithm",
    description: "Here is the linear probing search written as pseudocode. Step through it line by line and match each line to what you saw on the previous card.",
    Visual: SearchCodeVisual,
  },
  {
    id: 5,
    title: "How fast is searching?",
    description: "If the keys are spread out, we check only one or two slots, so search is O(1) on average. If many keys collide, we may have to check every key, which is O(n) in the worst case. A good hash function and a low load factor keep us close to O(1).",
    Visual: TimeComplexityVisual,
  },
]

export default function L02() {
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
        <h1 className="text-4xl font-bold tracking-tight">Searching in Hash Tables</h1>
        <p className="mt-2 text-blue-100">Swipe or use the arrows to move through the cards.</p>
      </header>

      <div className="mx-auto max-w-2xl px-12">
        <Carousel
          opts={{
            align: "center",
            // do not let carousel steal drags on our visuals
            watchDrag: (api, evt) => !evt.target.closest("[data-no-swipe]"),
          }}
        >
          <CarouselContent className="ml-0">
            {cards.map(({ id, title, description, Visual }) => (
              <CarouselItem key={id} className="p-8">
                <Card className="h-full border-0 bg-blue-500 text-white shadow-2xl shadow-blue-950/60 ring-0">
                  <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription className="text-blue-100">{description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* stepped: Prev / Next controls instead of autoplay */}
                    <Visual stepped />
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
