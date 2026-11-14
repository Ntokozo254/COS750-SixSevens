
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ReadAloud from "../settings/ReadAloud";

export default function Layout({
  preferences,
  page,
  activeModule,
  mobileOpen,
  onNavigate,
  onMenuOpen,
  onMenuClose,
  user,
  onLogout,
  children
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      data-reading-size={preferences.readingSize}
      data-high-contrast={preferences.highContrast}
      data-reduce-motion={preferences.reduceMotion}
    >
      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={onMenuClose}
          aria-label="Close navigation"
        />
      )}

      <Sidebar
        page={page}
        mobileOpen={mobileOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() =>
          setSidebarCollapsed((current) => !current)
        }
        onNavigate={onNavigate}
        onClose={onMenuClose}
      />

      <main className="main-area">
        <Navbar
          page={page}
          activeModule={activeModule}
          onNavigate={onNavigate}
          mobileOpen={mobileOpen}
          onMenuOpen={onMenuOpen}
          displayName={preferences.displayName}
          user={user}
          onLogout={onLogout}
        />

        <ReadAloud preferences={preferences} page={page} activeModule={activeModule} />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
