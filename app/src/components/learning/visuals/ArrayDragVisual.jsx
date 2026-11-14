import { motion } from "motion/react"

const values = [12, 7, 25, 3, 18, 9]

export default function ArrayDragVisual() {
  return (
    // data-no-swipe tells the carousel not to start a swipe from in here
    <div data-no-swipe className="lesson-visual select-none">
      <div className="flex justify-center gap-2 sm:gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex flex-1 max-w-16 flex-col items-center gap-2">
            {/* The slot: a crosshair like the Motion drag example */}
            <div className="lesson-visual-surface relative aspect-square w-full rounded-xl">
              <div className="absolute inset-x-0 top-1/2 h-px bg-[#dce5f3]" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-[#dce5f3]" />

              {/* The draggable block */}
              <motion.div
                drag
                dragDirectionLock
                dragSnapToOrigin
                dragElastic={0.6}
                dragTransition={{ bounceStiffness: 500, bounceDamping: 25 }}
                whileDrag={{ scale: 1.15, zIndex: 20 }}
                whileHover={{ scale: 1.05 }}
                className="lesson-visual-slot lesson-visual-slot--occupied absolute inset-1.5 flex cursor-grab items-center justify-center rounded-lg text-sm font-bold sm:text-lg active:cursor-grabbing"
              >
                {value}
              </motion.div>
            </div>

            {/* The array index */}
            <span className="lesson-visual-index">[{index}]</span>
          </div>
        ))}
      </div>

      <p className="lesson-visual-caption mt-4 text-center">
        The above figure is a simple  array of length six.
      </p>
    </div>
  )
}
