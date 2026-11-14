
import { Menu, ChevronRight, Home , LogOut } from "lucide-react";

export default function Navbar({
  page,
  activeModule,
  onNavigate,
  mobileOpen,
  onMenuOpen,
  displayName = "",
  user,
  onLogout
}) {
  const title =
    page === "Module" && activeModule
      ? activeModule.title
      : page;
  // Settings display name first, else "John" + "Doe" -> "JD", else the email's first letter, else "S".
  const profileName = (displayName ?? "").trim() || [user?.name, user?.surname].filter(Boolean).join(" ");
  const initials =
    profileName.split(/\s+/).filter(Boolean)
      .slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() ||
    (user?.email || "S").charAt(0).toUpperCase();
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>HashLab</span>
        <ChevronRight size={15} />
        <strong>{title}</strong>
      </div>

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

      <div className="topbar-right">
        <div className="avatar" title={profileName || user?.email}>{initials}</div>

        {onLogout && (
          <button type="button" className="logout-button" onClick={onLogout} title="Log out">
            <LogOut size={15} aria-hidden="true" />
            <span>Log out</span>
          </button>
        )}

        <button
          type="button"
          className="mobile-menu"
          onClick={onMenuOpen}
          aria-label="Open navigation"
          aria-controls="main-navigation"
          aria-expanded={mobileOpen}
          title="Open navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
