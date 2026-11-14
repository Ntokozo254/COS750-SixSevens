
import {
  LayoutDashboard,
  BookOpen,
  Workflow,
  Code2,
  ListChecks,
  ChartNoAxesCombined,
  Settings,
  Hash,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Learning modules", icon: BookOpen },
  { label: "Visualiser", icon: Workflow },
  { label: "Practice lab", icon: Code2 },
  { label: "Assessment", icon: ListChecks },
  { label: "My progress", icon: ChartNoAxesCombined },
  { label: "Settings", icon: Settings }
];

export default function Sidebar({
  page,
  mobileOpen,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onClose
}) {
  return (
    <aside id="main-navigation" className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Hash size={23} />
        </div>

        {!collapsed && (
          <div className="brand-copy">
            <h2>HashLab</h2>
            <span>COS212 Learning Studio</span>
          </div>
        )}

        <button
          className="collapse-button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>

        <button
          type="button"
          className="mobile-close"
          onClick={onClose}
          aria-label="Close navigation"
          title="Close navigation"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-section-label">
          LEARNING SPACE
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.label;

          return (
            <button
              key={item.label}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => onNavigate(item.label)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} />

              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-icon">
          <BookOpen size={18} />
        </div>

        {!collapsed && (
          <div className="sidebar-footer-copy">
            <strong>Keep learning</strong>
            <span>Small steps, better understanding.</span>
          </div>
        )}
      </div>
    </aside>
  );
}
