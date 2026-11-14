
import { Menu, ChevronRight, Home } from "lucide-react";

export default function Navbar({
  page,
  activeModule,
  onNavigate,
  displayName = "",
  onMenuOpen
}) {
  const title =
    page === "Module" && activeModule
      ? activeModule.title
      : page;
  const initials = displayName.trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() || "S";

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>HashLab</span>
        <ChevronRight size={15} />
        <strong>{title}</strong>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="course-tag course-home"
          onClick={() => onNavigate("Dashboard")}
          aria-label="Go to the COS212 home dashboard"
          title="Go to home dashboard"
        >
          <Home size={15} aria-hidden="true" />
          <span>COS212 · DATA STRUCTURES</span>
        </button>

        <button
          type="button"
          className="avatar"
          onClick={() => onNavigate("Settings")}
          aria-label={displayName ? `Open profile settings for ${displayName}` : "Open profile settings"}
          title="Profile settings"
        >
          {initials}
        </button>
      </div>

      <button
        className="mobile-menu"
        onClick={onMenuOpen}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>
    </header>
  );
}
