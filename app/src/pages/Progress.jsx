import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock3, Trophy } from "lucide-react";
import { modules } from "../data/modules";
import "./progress.css";

const minutes = (module) => parseInt(module.duration, 10) || 0;

export default function Progress({ completed, progress, onOpenModule }) {
  const done = modules.filter((module) => completed.includes(module.id));
  const remaining = modules.filter((module) => !completed.includes(module.id));
  const nextModule = remaining[0] ?? null;
  const minutesLeft = remaining.reduce((total, module) => total + minutes(module), 0);
  const allDone = remaining.length === 0;

  return (
    <div className="content-wrap progress-page">
      <div className="page-intro">
        <div className="eyebrow">YOUR ACHIEVEMENTS</div>
        <h1>My progress<span>.</span></h1>
        <p>Track your learning journey through HashLab before your COS212 lecture.</p>
      </div>

      <section className="progress-overview" aria-labelledby="progress-overview-title">
        <div className="progress-overview-copy">
          <div className="eyebrow">OVERALL PROGRESS</div>
          <div className="progress-number" id="progress-overview-title">
            {progress}
            <span>%</span>
          </div>
          <p>
            {allDone
              ? "Every module is complete. You're ready for the lecture."
              : `You have completed ${done.length} of ${modules.length} modules.`}
          </p>
          <div
            className="progress-line"
            role="progressbar"
            aria-label="Modules completed"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          {nextModule && (
            <button type="button" className="primary-button" onClick={() => onOpenModule(nextModule)}>
              {done.length === 0 ? "Start" : "Continue with"} {nextModule.title}
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        <div className="progress-ring" style={{ "--progress": `${progress}%` }} aria-hidden="true">
          <div>
            {done.length}/{modules.length}
          </div>
        </div>
      </section>

      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <span className="stat-label">Completed</span>
          <h2 className="stat-value">{done.length}</h2>
          <p className="stat-note">Modules finished</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={21} />
          </div>
          <span className="stat-label">Remaining</span>
          <h2 className="stat-value">{remaining.length}</h2>
          <p className="stat-note">Modules to go</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock3 size={21} />
          </div>
          <span className="stat-label">Time left</span>
          <h2 className="stat-value">~{minutesLeft} min</h2>
          <p className="stat-note">Estimated study time</p>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <div className="eyebrow">MODULE BY MODULE</div>
          <h2>Your learning path</h2>
        </div>
      </div>

      <ol className="progress-module-list">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const isCompleted = completed.includes(module.id);
          const isNext = module === nextModule;
          const status = isCompleted ? "Completed" : isNext ? "Up next" : "Not started";

          return (
            <li key={module.id}>
              <button
                type="button"
                className={`module-row${isNext ? " progress-row-next" : ""}`}
                onClick={() => onOpenModule(module)}
                aria-label={`Module ${index + 1}: ${module.title}. ${status}.`}
              >
                <div className={`module-icon ${isCompleted ? "green" : "blue"}`}>
                  {isCompleted ? <CheckCircle2 size={21} /> : <Icon size={21} />}
                </div>

                <div className="module-row-copy">
                  <strong>
                    <span className="progress-row-number">{String(index + 1).padStart(2, "0")}</span>
                    {module.title}
                  </strong>
                  <span>{module.objective}</span>
                </div>

                <span
                  className={`pill ${
                    isCompleted ? "pill-green" : isNext ? "pill-blue" : "progress-pill-muted"
                  }`}
                >
                  {status}
                </span>

                <ChevronRight size={17} className="row-chevron" />
              </button>
            </li>
          );
        })}
      </ol>

      {allDone && (
        <div className="side-card ready-card progress-done">
          <div className="ready-icon">
            <Trophy size={21} />
          </div>
          <h3>All modules complete</h3>
          <p>
            Revisit any module to refresh your memory, and bring the questions you wrote down to
            your COS212 lecture.
          </p>
        </div>
      )}
    </div>
  );
}
