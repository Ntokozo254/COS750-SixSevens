import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const arrowClass =
  "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-700 shadow-lg shadow-blue-950/30 hover:bg-blue-50"

export default function LessonCarousel({ cards }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    // don't let the carousel steal drags that start on a visual
    watchDrag: (api, evt) =>
      !(evt.target instanceof Element) || !evt.target.closest("[data-no-swipe]"),
  })

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
    if (e.key === "ArrowRight") emblaApi?.scrollNext()
  }

  return (
    <div
      className="lesson-scope relative mx-auto max-w-2xl px-12 text-white"
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {cards.map(({ id, title, description, Visual }, i) => (
            <div key={id} className="min-w-0 shrink-0 grow-0 basis-full p-6">
              <section className="h-full rounded-2xl bg-sky-900 p-6 shadow-2xl shadow-blue-950/50">
                <h3 className="font-heading text-xl font-extrabold">{title}</h3>
                <div className="mt-2 text-sm leading-relaxed text-blue-100">{description}</div>
                <div className="mt-5">
                  <Visual />
                </div>
                <p className="mt-5 text-sm text-blue-100">
                  {i + 1} / {cards.length}
                </p>
              </section>
            </div>
          ))}
        </div>
      </div>

      <button type="button" aria-label="Previous card" onClick={() => emblaApi?.scrollPrev()} className={`${arrowClass} left-0`}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" aria-label="Next card" onClick={() => emblaApi?.scrollNext()} className={`${arrowClass} right-0`}>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}