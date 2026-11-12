
import { CheckCircle2, Clock3, ChevronRight } from "lucide-react";

export default function ModuleCard({
  module,
  completed,
  onOpenModule
}) {
  const Icon = module.icon;
  const isCompleted = completed.includes(module.id);

  return (
    <button
      type="button"
      className="module-row"
      onClick={() => onOpenModule(module)}
    >
      <div className="module-icon blue">
        <Icon size={21} />
      </div>

      <div className="module-row-copy">
        <strong>{module.title}</strong>
        <span>{module.objective}</span>
      </div>

      {isCompleted ? (
        <CheckCircle2 size={19} className="done-icon" />
      ) : (
        <span className="module-row-duration">
          <Clock3 size={13} />
          {module.duration}
        </span>
      )}

      <ChevronRight size={17} className="row-chevron" />
    </button>
  );
}
