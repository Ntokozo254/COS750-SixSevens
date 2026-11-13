
import { Menu, ChevronRight, LogOut } from "lucide-react";

export default function Navbar({
  page,
  activeModule,
  onMenuOpen,
  user,
  onLogout
}) {
  const title =
    page === "Module" && activeModule
      ? activeModule.title
      : page;

  const initial = (user?.name || user?.email || "S").charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>HashLab</span>
        <ChevronRight size={15} />
        <strong>{title}</strong>
      </div>

      <div className="topbar-right">
        <div className="course-tag">
          <span className="status-pulse" />
          COS212 · DATA STRUCTURES
        </div>

        <div className="avatar" title={user?.email}>{initial}</div>

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
