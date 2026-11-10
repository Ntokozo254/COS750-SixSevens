import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle2,
  ChevronRight, CircleHelp, Clock3, Code2, Command, Compass, GraduationCap,
  Hash, Home, LayoutDashboard, Lightbulb, ListChecks, LockKeyhole, Menu,
  Network, Play, Search, Settings, Sparkles, Target, Trophy, Volume2,
  Workflow, X, Zap
} from "lucide-react";

const modules = [
  {
    id: 1, title: "Introduction to Hashing", short: "Why hashing is fast",
    objective: "Explain why a hash table can find an item faster than searching through a list.",
    bloom: "Understand", time: "5 min", icon: Zap, colour: "blue",
    description: "Discover how hashing transforms a key into a location, and compare direct lookup with checking items one by one.",
    activities: ["A list vs. a hash table", "The idea behind a hash function", "Quick concept check"]
  },
  {
    id: 2, title: "Hash Functions", short: "Calculate home slots",
    objective: "Calculate a key's home slot using key mod tableSize.",
    bloom: "Apply", time: "6 min", icon: Hash, colour: "violet",
    description: "Learn how the modulo operation maps a key to its first proposed position in a hash table.",
    activities: ["Meet the modulo operator", "Calculate home slots", "Try: where does 23 go?"]
  },
  {
    id: 3, title: "Understanding Collisions", short: "When keys meet",
    objective: "Identify when two keys map to the same slot.",
    bloom: "Understand", time: "5 min", icon: Target, colour: "orange",
    description: "Explore what happens when two different keys produce the same home slot.",
    activities: ["What is a collision?", "Spot the collision", "Check your understanding"]
  },
  {
    id: 4, title: "Linear Probing", short: "Resolve collisions",
    objective: "Insert a sequence of keys using linear probing, including wrap-around.",
    bloom: "Apply", time: "9 min", icon: Workflow, colour: "cyan",
    description: "Follow the table one slot at a time until an available position is found. Learn how probing wraps around.",
    activities: ["The probing rule", "Six-key worked example", "Guided insertion challenge"]
  },
  {
    id: 5, title: "Searching a Hash Table", short: "Trace a search",
    objective: "Trace a search and identify when an unsuccessful search stops.",
    bloom: "Apply", time: "7 min", icon: Search, colour: "green",
    description: "Trace the path taken by a search and understand why an empty slot can mean the key is not present.",
    activities: ["Follow a search path", "Successful vs. unsuccessful search", "Count the slots checked"]
  },
  {
    id: 6, title: "Performance Analysis", short: "Clustering and load factor",
    objective: "Describe how clustering and load factor affect hash table performance.",
    bloom: "Analyse", time: "7 min", icon: Activity, colour: "pink",
    description: "Compare hash tables and investigate how crowded tables and clusters can make operations slower.",
    activities: ["What is clustering?", "Understand load factor", "Compare two tables"]
  }
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Learning modules", icon: BookOpen },
  { label: "Visualiser", icon: Workflow },
  { label: "Practice lab", icon: Code2 },
  { label: "Assessment", icon: ListChecks }
];

function App() {
  const [page, setPage] = useState("Dashboard");
  const [activeModule, setActiveModule] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hashlab-completed-modules") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("hashlab-completed-modules", JSON.stringify(completed));
  }, [completed]);
  const [searchTerm, setSearchTerm] = useState("");

  const progress = Math.round((completed.length / modules.length) * 100);
  const filteredModules = useMemo(
    () => modules.filter((module) =>
      `${module.title} ${module.objective}`.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm]
  );

  function openModule(module) {
    setActiveModule(module);
    setPage("Module");
    setMobileOpen(false);
  }

  function navigate(label) {
    setPage(label);
    setActiveModule(null);
    setMobileOpen(false);
  }

  function completeModule(id) {
    setCompleted((current) => current.includes(id) ? current : [...current, id]);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Hash size={23} strokeWidth={2.7} /></div>
          <div>
            <div className="brand-name">HashLab</div>
            <div className="brand-subtitle">COS212 Learning Studio</div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>

        <div className="sidebar-label">LEARNING SPACE</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${page === label || (page === "Module" && label === "Learning modules") ? "active" : ""}`} onClick={() => navigate(label)}>
              <Icon size={19} />
              <span>{label}</span>
              {label === "Assessment" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="main-nav">
          <button className={`nav-item ${page === "My progress" ? "active" : ""}`} onClick={() => navigate("My progress")}><Activity size={19} /><span>My progress</span></button>
          <button className={`nav-item ${page === "Settings" ? "active" : ""}`} onClick={() => navigate("Settings")}><Settings size={19} /><span>Settings</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Lightbulb size={17} /></div>
            <div className="help-title">Need a little help?</div>
            <p>Take it one concept at a time. You’ve got this.</p>
            <button onClick={() => navigate("Learning modules")}>Explore lessons <ArrowRight size={14} /></button>
          </div>
          <div className="course-chip"><GraduationCap size={17} /><span>University of Pretoria</span></div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
            <div className="breadcrumb"><span>HashLab</span><ChevronRight size={14} /><strong>{page === "Module" ? activeModule?.title : page}</strong></div>
          </div>
          <div className="topbar-right">
            <div className="course-tag"><span className="status-pulse" /> COS212 · DATA STRUCTURES</div>
            <div className="avatar">S</div>
          </div>
        </header>

        <div className="page-content">
          {page === "Dashboard" && <Dashboard progress={progress} completed={completed} onOpenModule={openModule} onNavigate={navigate} />}
          {page === "Learning modules" && <ModulesPage completed={completed} onOpenModule={openModule} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredModules={filteredModules} />}
          {page === "Module" && activeModule && <ModulePage module={activeModule} completed={completed} onBack={() => navigate("Learning modules")} onComplete={completeModule} />}
          {page === "Visualiser" && <PlaceholderPage icon={Workflow} eyebrow="INTERACTIVE EXPLORATION" title="See hashing in action." description="Watch keys travel through a hash table, step through collisions and explore linear probing." tag="Visualiser" features={["Step forward and backward through an insertion", "See collisions and probing paths", "Explore wrap-around behaviour"]} />}
          {page === "Practice lab" && <PlaceholderPage icon={Code2} eyebrow="LEARN BY DOING" title="Your space to experiment." description="Put your understanding to work with guided challenges before trying the sandbox independently." tag="Practice lab" features={["Guided insertion exercises", "Instant feedback and hints", "Open sandbox for independent exploration"]} />}
          {page === "Assessment" && <PlaceholderPage icon={ListChecks} eyebrow="CHECK YOUR UNDERSTANDING" title="Ready to test what you know?" description="Answer questions mapped to all six learning objectives. Your responses will help identify where you may need more support." tag="Assessment" features={["Questions mapped to LO1–LO6", "Targeted feedback for misconceptions", "Retry with a scaffolded example"]} />}
          {page === "My progress" && <ProgressPage completed={completed} progress={progress} onOpenModule={openModule} />}
          {page === "Settings" && <PlaceholderPage icon={Settings} eyebrow="MAKE IT YOURS" title="Learning preferences." description="Accessibility and personalisation options will live here." tag="Settings" features={["Text-to-speech preferences", "Display and accessibility options", "Learning progress preferences"]} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ progress, completed, onOpenModule, onNavigate }) {
  const nextModule = modules.find((module) => !completed.includes(module.id)) || modules[0];
  return (
    <div className="content-wrap">
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><Sparkles size={14} /> YOUR PRE-LECTURE LEARNING SPACE</div>
          <h1>Make hashing <span>click.</span></h1>
          <p className="welcome-copy">Understand the ideas, explore the algorithms, and arrive at your COS212 lecture ready to go.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="floating-node node-a">23</div><div className="floating-node node-b">43</div>
          <div className="floating-node node-c">13</div>
          <div className="art-hash"><Hash size={43} /></div>
          <div className="art-caption">KEY → SLOT</div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard icon={BookOpen} label="Learning modules" value={`${completed.length} / 6`} note="Modules completed" tone="blue" />
        <StatCard icon={Activity} label="Your progress" value={`${progress}%`} note="Overall completion" tone="purple" />
        <StatCard icon={Clock3} label="Learning time" value="~39 min" note="Estimated total time" tone="orange" />
        <StatCard icon={Trophy} label="Achievements" value={completed.length ? completed.length : "—"} note="Badges earned" tone="green" />
      </section>

      <section className="dashboard-grid">
        <div className="primary-column">
          <div className="section-heading">
            <div><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2>Your learning journey</h2></div>
            <button className="text-button" onClick={() => onNavigate("Learning modules")}>All modules <ArrowRight size={15} /></button>
          </div>
          <div className="continue-card">
            <div className="continue-top">
              <div className="module-icon blue"><nextModule.icon size={22} /></div>
              <span className="pill pill-blue">UP NEXT</span>
            </div>
            <div className="continue-title">{nextModule.title}</div>
            <p>{nextModule.description}</p>
            <div className="continue-meta"><span><Clock3 size={14} /> {nextModule.time}</span><span><Brain size={14} /> {nextModule.bloom}</span></div>
            <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
            <div className="continue-footer"><span>{completed.length} of 6 modules complete</span><button className="primary-button" onClick={() => onOpenModule(nextModule)}>Continue learning <ArrowRight size={16} /></button></div>
          </div>

          <div className="section-heading module-heading">
            <div><div className="eyebrow">YOUR COURSE CONTENT</div><h2>Explore the modules</h2></div>
          </div>
          <div className="module-list">
            {modules.slice(0, 3).map((module) => <ModuleRow key={module.id} module={module} done={completed.includes(module.id)} onClick={() => onOpenModule(module)} />)}
          </div>
        </div>

        <aside className="secondary-column">
          <div className="side-card challenge-card">
            <div className="side-card-heading"><div className="mini-icon"><CircleHelp size={17} /></div><span>QUICK THINK</span></div>
            <h3>Can you spot the collision?</h3>
            <p>Two keys are mapped to the same home slot. What happens next?</p>
            <div className="mini-table">
              {[{i:0,v:"",s:"empty"},{i:1,v:"",s:"empty"},{i:2,v:"12",s:"filled"},{i:3,v:"",s:"empty"},{i:4,v:"",s:"empty"}].map((slot) => <div className={`mini-slot ${slot.s}`} key={slot.i}><small>{slot.i}</small>{slot.v}</div>)}
            </div>
            <button className="secondary-button" onClick={() => onOpenModule(modules[2])}>Explore collisions <ArrowRight size={15} /></button>
          </div>
          <div className="side-card ready-card">
            <div className="ready-icon"><GraduationCap size={21} /></div>
            <h3>Small steps. Big progress.</h3>
            <p>Work through each concept at your own pace. Your progress stays saved in this browser.</p>
            <div className="ready-note"><LockKeyhole size={14} /> Private to this device</div>
          </div>
        </aside>
      </section>
      <footer className="page-footer"><span>HashLab · COS212 Learning Studio</span><span>Built for curious minds <span className="footer-heart">♥</span></span></footer>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

function ModuleRow({ module, done, onClick }) {
  return <button className="module-row" onClick={onClick}>
    <div className={`module-icon ${module.colour}`}><module.icon size={20} /></div>
    <div className="module-row-copy"><strong>{String(module.id).padStart(2, "0")} · {module.title}</strong><span>{module.short}</span></div>
    {done ? <CheckCircle2 className="done-icon" size={20} /> : <ChevronRight className="row-chevron" size={19} />}
  </button>;
}

function ModulesPage({ completed, onOpenModule, searchTerm, setSearchTerm, filteredModules }) {
  return <div className="content-wrap">
    <div className="page-intro"><div className="eyebrow">YOUR LEARNING PATH</div><h1>Learning modules<span>.</span></h1><p>Six small steps to build a strong understanding of hash tables.</p></div>
    <div className="module-toolbar"><div className="search-box"><Search size={17} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Find a learning module..." /></div><div className="module-count">{completed.length} of 6 completed</div></div>
    <div className="module-grid">
      {filteredModules.map((module) => {
        const Icon = module.icon;
        const done = completed.includes(module.id);
        return <button className="module-card" key={module.id} onClick={() => onOpenModule(module)}>
          <div className="module-card-top"><div className={`module-icon ${module.colour}`}><Icon size={22} /></div>{done ? <span className="pill pill-green"><Check size={12} /> COMPLETE</span> : <span className="module-number">MODULE {String(module.id).padStart(2, "0")}</span>}</div>
          <h3>{module.title}</h3><p>{module.description}</p>
          <div className="objective"><Target size={14} /><span>{module.objective}</span></div>
          <div className="module-card-footer"><span><Clock3 size={14} /> {module.time}</span><span className="bloom-tag">{module.bloom}</span><span className="card-arrow"><ArrowRight size={17} /></span></div>
        </button>;
      })}
      {filteredModules.length === 0 && <div className="empty-state">No modules match that search. Try another keyword.</div>}
    </div>
  </div>;
}

function ModulePage({ module, completed, onBack, onComplete }) {
  const [showDetails, setShowDetails] = useState(false);
  const done = completed.includes(module.id);
  const Icon = module.icon;
  return <div className="content-wrap">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to modules</button>
    <div className="module-hero">
      <div className={`module-icon large ${module.colour}`}><Icon size={28} /></div>
      <div className="eyebrow">MODULE {String(module.id).padStart(2, "0")} · {module.bloom.toUpperCase()}</div>
      <h1>{module.title}<span>.</span></h1>
      <p>{module.description}</p>
      <div className="hero-meta"><span><Clock3 size={15} /> {module.time}</span><span><Target size={15} /> Learning objective {module.id}</span></div>
    </div>
    <div className="lesson-layout">
      <div className="lesson-main">
        <div className="lesson-card">
          <div className="lesson-card-header"><div><div className="eyebrow">WHAT YOU'LL LEARN</div><h2>Your learning objective</h2></div><span className="pill pill-blue">LO{module.id}</span></div>
          <p className="objective-large">{module.objective}</p>
          <div className="learning-placeholder">
            <div className="placeholder-symbol"><Icon size={31} /></div>
            <div className="placeholder-label">LEARNING CONTENT PLACEHOLDER</div>
            <h3>Your lesson starts here.</h3>
            <p>This space is reserved for the explanation, worked examples, animations and interactive activities for this learning objective.</p>
            <button className="secondary-button" onClick={() => setShowDetails(!showDetails)}>{showDetails ? "Hide lesson outline" : "View lesson outline"} <ChevronRight size={15} /></button>
          </div>
          {showDetails && <div className="activity-outline">{module.activities.map((activity, index) => <div className="activity-item" key={activity}><span>{index + 1}</span>{activity}<span className="coming-soon">PLANNED</span></div>)}</div>}
          <div className="lesson-actions"><button className="secondary-button" onClick={onBack}>Back to modules</button><button className="primary-button" onClick={() => onComplete(module.id)}>{done ? "Module completed" : "Mark as complete"} {done ? <Check size={16} /> : <ArrowRight size={16} />}</button></div>
        </div>
      </div>
      <aside className="lesson-aside">
        <div className="side-card"><div className="side-card-heading"><div className="mini-icon"><Target size={16} /></div><span>LEARNING CHECKPOINT</span></div><h3>How you'll know you've got it</h3><p>At the end of this module, a short assessment will check your understanding of the learning objective.</p><div className="checkpoint-row"><CheckCircle2 size={16} /> Objective-based question</div><div className="checkpoint-row"><CheckCircle2 size={16} /> Feedback and hints</div><div className="checkpoint-row"><CheckCircle2 size={16} /> Retry with extra support</div></div>
        <div className="side-card support-card"><Lightbulb size={20} /><h3>Learning tip</h3><p>Take your time. You can revisit any lesson and replay an example whenever you need to.</p></div>
      </aside>
    </div>
  </div>;
}

function PlaceholderPage({ icon: Icon, eyebrow, title, description, tag, features }) {
  return <div className="content-wrap">
    <div className="page-intro"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
    <div className="feature-placeholder">
      <div className="feature-icon"><Icon size={30} /></div><span className="pill pill-blue">{tag.toUpperCase()}</span>
      <h2>This space is ready for your next build.</h2><p>The main interface is in place. Your group can now connect the learning logic and interactive components here.</p>
      <div className="feature-list">{features.map((feature) => <div key={feature}><CheckCircle2 size={17} />{feature}</div>)}</div>
      <div className="build-note"><Command size={16} /> COMPONENT PLACEHOLDER · IMPLEMENTATION PENDING</div>
    </div>
  </div>;
}

function ProgressPage({ completed, progress, onOpenModule }) {
  return <div className="content-wrap">
    <div className="page-intro"><div className="eyebrow">YOUR LEARNING JOURNEY</div><h1>My progress<span>.</span></h1><p>Every concept you understand is a step closer to mastering hashing.</p></div>
    <div className="progress-overview"><div><div className="eyebrow">OVERALL COMPLETION</div><div className="progress-number">{progress}<span>%</span></div><p>{completed.length} of 6 learning objectives completed</p></div><div className="progress-ring" style={{ "--progress": `${progress}%` }}><div>{progress}%</div></div></div>
    <div className="progress-module-list">{modules.map((module) => <ModuleRow key={module.id} module={module} done={completed.includes(module.id)} onClick={() => onOpenModule(module)} />)}</div>
  </div>;
}

export default App;
