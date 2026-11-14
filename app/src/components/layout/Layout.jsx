
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({
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
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
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
          onMenuOpen={onMenuOpen}
          user={user}
          onLogout={onLogout}
        />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
