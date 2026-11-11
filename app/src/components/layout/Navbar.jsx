
import { Menu, ChevronRight } from "lucide-react";

export default function Navbar({
  page,
  activeModule,
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
        <div className="course-tag">
          <span className="status-pulse" />
          COS212 · DATA STRUCTURES
        </div>

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
