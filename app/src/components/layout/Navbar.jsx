
import { Menu, ChevronRight, Home , LogOut } from "lucide-react";

export default function Navbar({
  page,
  activeModule,
  onNavigate,
  displayName = "",
  onMenuOpen,
  user,
  onLogout
}) {
  const title =
    page === "Module" && activeModule
      ? activeModule.title
      : page;
  // "John" + "Doe" -> "JD". Falls back to the email's first letter, then "S".
  const profileName = displayName.trim() || [user?.name, user?.surname].filter(Boolean).join(" ");
  const initials =
    profileName.trim().split(/\s+/).filter(Boolean)
      .slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() ||
    [user?.name, user?.surname]
      .map((part) => part?.trim().charAt(0) ?? "")
      .join("")
      .toUpperCase() ||
    (user?.email || "S").charAt(0).toUpperCase();
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
          aria-label={profileName ? `Open profile settings for ${profileName}` : "Open profile settings"}
          title="Profile settings"
        >
          {initials}
        </button>

        {onLogout && (
          <button className="logout-button" onClick={onLogout} title="Log out">
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        )}
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
