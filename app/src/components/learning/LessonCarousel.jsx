import { useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const navButton =
  "grid size-11 flex-none place-items-center rounded-full bg-white text-n;ue-700 shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-50 disabled:opacity-40"

export default function LessonCarousel({ cards, index, onIndexChange }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    // don't let the carousel steal drags that start on a visual
    watchDrag: (api, evt) =>
      !(evt.target instanceof Element) || !evt.target.closest("[data-no-swipe]"),
  })

  // carousel -> page
  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => onIndexChange(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi, onIndexChange])

  // page -> carousel (when the outline is clicked)
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== index) emblaApi.scrollTo(index)
  }, [emblaApi, index])

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") emblaApi?.scrollPrev()
    if (e.key === "ArrowRight") emblaApi?.scrollNext()
  }

  return (
    <div
      className="lesson-scope @container"
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {cards.map(({ id, title, description, Visual }, i) => (
            <div key={id} className="min-w-0 shrink-0 grow-0 basis-full p-2 @lg:p-3">
              <section className="grid h-full gap-4 rounded-2xl bg-ink p-4 text-white shadow-xl shadow-blue-950/30 @lg:p-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] @3xl:items-center @3xl:gap-6">
                <header>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                    Card {i + 1} of {cards.length}
                  </p>
                  <h3 className="mt-2 font-heading text-xl font-extrabold @3xl:text-2xl">{title}</h3>
                  <div className="mt-2 text-sm leading-relaxed text-blue-100">{description}</div>
                </header>

                {/* The stage: visuals were designed for about 30rem, so keep them centred at that width */}
                <div className="mx-auto w-full max-w-[30rem]">
                  <Visual />
                </div>
              </section>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <button type="button" aria-label="Previous card" disabled={index === 0}
          onClick={() => emblaApi?.scrollPrev()} className={navButton}>
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {cards.map((card, i) => (
            <button key={card.id} type="button" aria-label={`Go to card ${i + 1}`}
              aria-current={i === index} onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-blue-600" : "w-2 bg-blue-200 hover:bg-blue-300"
              }`} />
          ))}
        </div>

        <button type="button" aria-label="Next card" disabled={index === cards.length - 1}
          onClick={() => emblaApi?.scrollNext()} className={navButton}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}