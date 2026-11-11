
import { ArrowRight, CheckCircle2, CircleHelp, Lightbulb, Target } from "lucide-react";
import { modules } from "../data/modules";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import ProgressCards from "../components/dashboard/ProgressCards";
import ModuleCard from "../components/dashboard/ModuleCard";

export default function Dashboard({
  progress,
  completed,
  onOpenModule,
  onNavigate
}) {
  const nextModule =
    modules.find((module) => !completed.includes(module.id)) || modules[0];

  const nextModuleCompleted =
    nextModule && completed.includes(nextModule.id);

  return (
    <div className="content-wrap">
      <WelcomeBanner onNavigate={onNavigate} />

      <ProgressCards
        progress={progress}
        completed={completed}
        total={modules.length}
        modules={modules}
      />

      <div className="dashboard-grid">
        <section className="dashboard-main-column">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
              <h2>Your learning journey</h2>
            </div>

            <button
              className="text-button"
              onClick={() => onNavigate("Learning modules")}
            >
              All modules
              <ArrowRight size={16} />
            </button>
          </div>

          {nextModule ? (
            <div className="continue-card">
              <div className="continue-top">
                <div className="module-icon blue">
                  {(() => {
                    const Icon = nextModule.icon;
                    return <Icon size={23} />;
                  })()}
                </div>

                <span className="pill pill-blue">
                  {nextModuleCompleted ? "COMPLETED" : "UP NEXT"}
                </span>
              </div>

              <div className="continue-title">{nextModule.title}</div>

              <p>{nextModule.objective}</p>

              <div className="continue-meta">
                <span>{nextModule.duration}</span>
                <span>
                  <Target size={13} />
                  Learning objective
                </span>
              </div>

              <div className="progress-line">
                <span
                  style={{
                    width: nextModuleCompleted ? "100%" : "0%"
                  }}
                />
              </div>

              <div className="continue-footer">
                <span>
                  {nextModuleCompleted
                    ? "You've completed this module"
                    : "Continue building your understanding"}
                </span>

                <button
                  className="primary-button"
                  onClick={() => onOpenModule(nextModule)}
                >
                  {nextModuleCompleted ? "Review module" : "Start learning"}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="continue-card">
              <CheckCircle2 size={28} className="done-icon" />
              <div className="continue-title">You've completed every module!</div>
              <p>Excellent work. You can revisit any module whenever you need a refresher.</p>
              <button
                className="secondary-button"
                onClick={() => onNavigate("Learning modules")}
              >
                Review modules
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          <div className="section-heading module-heading">
            <div>
              <div className="eyebrow">KEEP BUILDING YOUR KNOWLEDGE</div>
              <h2>Explore your modules</h2>
            </div>
          </div>

          <div className="module-list">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                completed={completed}
                onOpenModule={onOpenModule}
              />
            ))}
          </div>
        </section>

        <aside className="secondary-column">
          <div className="side-card challenge-card">
            <div className="side-card-heading">
              <span className="mini-icon">
                <CircleHelp size={18} />
              </span>
              QUICK THINK
            </div>

            <h3>Can you spot the collision?</h3>

            <p>
              Two keys are mapped to the same home slot. What happens when
              both keys are inserted into a hash table?
            </p>

            <div className="mini-table">
              <div className="mini-slot filled">
                <small>3</small>
                23
              </div>
              <div className="mini-slot">
                <small>4</small>
              </div>
              <div className="mini-slot filled">
                <small>5</small>
                43
              </div>
              <div className="mini-slot">
                <small>6</small>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={() => onNavigate("Practice lab")}
            >
              Try a practice challenge
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="side-card ready-card">
            <div className="ready-icon">
              <Lightbulb size={21} />
            </div>

            <h3>Ready for your COS212 lecture?</h3>

            <p>
              Take one concept at a time. Work through the lessons and
              arrive at your lecture feeling prepared.
            </p>

            <div className="ready-note">
              <CheckCircle2 size={14} />
              Learn at your own pace
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
