
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { modules } from "../data/modules";

export default function Progress({
  completed,
  progress,
  onOpenModule
}) {
  return (
    <div className="content-wrap">
      <div className="page-intro">
        <div className="eyebrow">YOUR ACHIEVEMENTS</div>
        <h1>My progress</h1>
        <p>Track your learning journey through HashLab.</p>
      </div>

      <div className="progress-overview">
        <div className="progress-number">{progress}%</div>
        <div>
          <h2>Your overall progress</h2>
          <p>
            You have completed {completed.length} of {modules.length} modules.
          </p>
        </div>
        <Trophy size={32} />
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="module-list">
        {modules.map((module) => {
          const isCompleted = completed.includes(module.id);
          const Icon = isCompleted ? CheckCircle2 : Circle;

          return (
            <button
              className="progress-module"
              key={module.id}
              onClick={() => onOpenModule(module)}
            >
              <Icon size={20} />
              <span>{module.title}</span>
              <span>{isCompleted ? "Completed" : "Not started"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
