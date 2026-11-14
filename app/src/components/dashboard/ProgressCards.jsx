
import { BookOpen, Activity, Clock3, Trophy } from "lucide-react";

function StatCard({ icon: Icon, label, value, description, colour }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colour}`}>
        <Icon size={21} />
      </div>

      <div>
        <span className="stat-label">{label}</span>
        <h2 className="stat-value">{value}</h2>
        <p className="stat-note">{description}</p>
      </div>
    </div>
  );
}

export default function ProgressCards({
  progress,
  completed,
  total,
  modules
}) {
  const totalMinutes = modules.reduce((totalTime, module) => {
    const minutes = parseInt(module.duration, 10);
    return totalTime + (Number.isNaN(minutes) ? 0 : minutes);
  }, 0);

  return (
    <div className="stats-grid">
      <StatCard
        icon={BookOpen}
        label="Learning modules"
        value={`${completed.length} / ${total}`}
        description="Modules completed"
        colour="blue"
      />

      <StatCard
        icon={Activity}
        label="Your progress"
        value={`${progress}%`}
        description="Overall completion"
        colour="purple"
      />

      <StatCard
        icon={Clock3}
        label="Learning time"
        value={`~${totalMinutes} min`}
        description="Estimated total time"
        colour="orange"
      />

      <StatCard
        icon={Trophy}
        label="Achievements"
        value={completed.length}
        description="Modules completed"
        colour="green"
      />
    </div>
  );
}
