
import { Menu, ChevronRight, Home } from "lucide-react";

export default function Navbar({
  page,
  activeModule,
  onNavigate,
  onMenuOpen
}) {
  const title =
    page === "Module" && activeModule
      ? activeModule.title
      : page;

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

        <div className="avatar">S</div>
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
