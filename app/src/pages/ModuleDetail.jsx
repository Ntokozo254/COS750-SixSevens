
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Target,
  Lightbulb,
  BookOpen
} from "lucide-react";
//l02 additions
import LessonCarousel from "../components/learning/LessonCarousel";
import LessonOutline from "../components/learning/LessonOutline";
import { lessonCards } from "../data/LessonCards";



export default function ModuleDetail({
  module,
  completed,
  onBack,
  onComplete
}) {
  const Icon = module.icon;
  const isCompleted = completed.includes(module.id);

  //l01
  const cards = lessonCards[module.id] ;
  const [cardIndex , setCardIndex] = useState(0);

  return (
    <div className="content-wrap">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to learning modules
      </button>

      <section className="module-hero">
        <div className={`module-icon large ${module.color || "blue"}`}>
          <Icon size={27} />
        </div>

        <div className="eyebrow">
          MODULE {String(module.id).padStart(2, "0")} · UNDERSTAND
        </div>

        <h1>{module.title}<span>.</span></h1>

        <p>{module.description}</p>

        <div className="hero-meta">
          <span>
            <Clock3 size={16} />
            {module.duration}
          </span>

          <span>
            <Target size={16} />
            Learning objective {module.id}
          </span>
        </div>
      </section>

      <div className="lesson-layout">
        <section className="lesson-card">
          <div className="lesson-card-header">
            <div>
              <div className="eyebrow">WHAT YOU'LL LEARN</div>
              <h2>Your learning objective</h2>
            </div>

            <span className="pill pill-blue">
              LO{module.id}
            </span>
          </div>

          <p className="objective-large">
            {module.objective}
          </p>

          {cards ? (
            <LessonCarousel cards={cards} index={cardIndex} onIndexChange={setCardIndex} />
          ) : (
            <div className="learning-placeholder">
              <div className="placeholder-symbol">
                <Lightbulb size={35} />
              </div>

              <div className="placeholder-label">
                LEARNING CONTENT
              </div>

              <h3>Your lesson starts here.</h3>

              <p>
                This space is reserved for explanations, worked
                examples, animations and interactive activities
                for this learning objective.
              </p>

              <button className="secondary-button">
                <BookOpen size={15} />
                View lesson outline
              </button>
            </div>
          )}

          <div className="lesson-actions">
            <button
              className="primary-button"
              onClick={() => onComplete(module.id)}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 size={16} />
                  Module completed
                </>
              ) : (
                <>
                  Mark module as complete
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </section>

        <aside className="lesson-aside">
          {cards && <LessonOutline cards={cards} index={cardIndex} onSelect={setCardIndex} />}
          <div className="side-card">
            <div className="side-card-heading">
              <span className="mini-icon">
                <Target size={17} />
              </span>
              LEARNING CHECKPOINT
            </div>

            <h3>How you'll know you've got it</h3>

            <p>
              At the end of this module, a short assessment
              will check your understanding of the learning objective.
            </p>

            <div className="checkpoint-row">
              <CheckCircle2 size={17} />
              Objective-based question
            </div>

            <div className="checkpoint-row">
              <CheckCircle2 size={17} />
              Feedback and hints
            </div>

            <div className="checkpoint-row">
              <CheckCircle2 size={17} />
              Retry with extra support
            </div>
          </div>

          <div className="side-card support-card">
            <Lightbulb size={25} />

            <h3>Learning tip</h3>

            <p>
              Take your time. You can revisit any lesson
              and practise until you feel confident.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
