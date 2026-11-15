import { useCallback, useEffect, useId, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MotionConfig, useReducedMotion } from "motion/react"
import "./lesson.css"

export default function LessonCarousel({ cards, index, onIndexChange, reduceMotion = false }) {
  const carouselId = useId()
  const viewportRef = useRef(null)
  const deviceReducedMotion = useReducedMotion()
  const jump = reduceMotion || Boolean(deviceReducedMotion)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    // Interacting with a demonstration should not drag the lesson carousel.
    watchDrag: (_api, event) =>
      !(event.target instanceof Element) || !event.target.closest("[data-no-swipe]"),
  })
  const attachViewport = useCallback((node) => {
    viewportRef.current = node
    emblaRef(node)
  }, [emblaRef])

  useEffect(() => {
    const viewport = viewportRef.current
    const activeSlide = viewport?.querySelectorAll(".lesson-slide-wrapper")[index]
    if (!activeSlide) return
    const updateHeight = () => {
      if (activeSlide.offsetHeight) viewport.style.height = (activeSlide.offsetHeight + 2) + "px"
    }
    updateHeight()
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateHeight)
    observer?.observe(activeSlide)
    window.addEventListener("resize", updateHeight)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [index, cards])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => onIndexChange(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi, onIndexChange])

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== index) emblaApi.scrollTo(index, jump)
  }, [emblaApi, index, jump])

  function onKeyDown(event) {
    if (event.target !== event.currentTarget && event.target.closest("button, input, select, textarea, [data-no-swipe]")) return
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      emblaApi?.scrollPrev(jump)
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      emblaApi?.scrollNext(jump)
    }
  }

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <div className="lesson-carousel" role="region" aria-label="Lesson cards" aria-roledescription="carousel" tabIndex={0} onKeyDown={onKeyDown}>
        <div ref={attachViewport} className="lesson-carousel-viewport" id={carouselId}>
          <div className="lesson-carousel-track">
            {cards.map(({ id, title, description, Visual }, cardIndex) => (
              <div key={id} className="lesson-slide-wrapper" role="group" aria-roledescription="slide" aria-label={(cardIndex + 1) + " of " + cards.length} aria-hidden={cardIndex !== index} inert={cardIndex !== index ? true : undefined}>
                <section className="lesson-slide">
                  <header className="lesson-slide-copy">
                    <div className="eyebrow">UNDERSTAND THE CONCEPT</div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </header>
                  <div className="lesson-visual-stage">
                    <div className="lesson-visual-heading">INTERACTIVE EXAMPLE</div>
                    <div className="lesson-visual-content" data-no-swipe>
                      <Visual />
                    </div>
                  </div>
                </section>
              </div>
            ))}
          </div>
        </div>

        <div className="lesson-carousel-controls">
          <button type="button" className="secondary-button lesson-card-nav" aria-label="Previous card" aria-controls={carouselId} disabled={index === 0} onClick={() => emblaApi?.scrollPrev(jump)}>
            <ChevronLeft size={16} aria-hidden="true" /><span>Previous</span>
          </button>
          <div className="lesson-carousel-position">
            <span className="lesson-card-counter" role="status">Card {index + 1} of {cards.length}</span>
            <div className="lesson-carousel-dots" aria-label="Choose a lesson card">
              {cards.map((card, cardIndex) => (
                <button key={card.id} type="button" className="lesson-carousel-dot" aria-label={"Go to card " + (cardIndex + 1) + ": " + card.title.trim()} aria-current={cardIndex === index ? "step" : undefined} aria-controls={carouselId} onClick={() => emblaApi?.scrollTo(cardIndex, jump)}><span /></button>
              ))}
            </div>
          </div>
          <button type="button" className="secondary-button lesson-card-nav" aria-label="Next card" aria-controls={carouselId} disabled={index === cards.length - 1} onClick={() => emblaApi?.scrollNext(jump)}>
            <span>Next</span><ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </MotionConfig>
  )
}
