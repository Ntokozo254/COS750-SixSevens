
import { useMemo, useState } from "react";
import Layout from "./components/layout/Layout";
import { modules } from "./data/modules";
import useProgress from "./hooks/useProgress";
import usePreferences from "./hooks/usePreferences";

import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import Visualiser from "./pages/Visualiser";
import PracticeLab from "./pages/PracticeLab";
import Assessment from "./pages/Assessment";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { loadUser, saveUser } from "./api/auth";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [activeModule, setActiveModule] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(loadUser);

  const { completed, progress, completeModule } = useProgress();
  const { preferences, updatePreference, resetPreferences, storageAvailable } = usePreferences();

  const filteredModules = useMemo(
    () =>
      modules.filter((module) =>
        `${module.title} ${module.objective}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
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

  function handleLogin(loggedIn) {
    saveUser(loggedIn);
    setUser(loggedIn);
    setPage("Dashboard");
  }

  function handleLogout() {
    saveUser(null);
    setUser(null);
  }

  function renderPage() {
    switch (page) {
      case "Dashboard":
        return (
          <Dashboard
            preferences={preferences}
            progress={progress}
            completed={completed}
            onOpenModule={openModule}
            onNavigate={navigate}
          />
        );

      case "Learning modules":
        return (
          <Modules
            completed={completed}
            onOpenModule={openModule}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredModules={filteredModules}
          />
        );

      case "Module":
        return activeModule ? (
          <ModuleDetail
            module={activeModule}
            completed={completed}
            onBack={() => navigate("Learning modules")}
            onComplete={completeModule}
          />
        ) : null;

      case "Visualiser":
        return <Visualiser />;

      case "Practice lab":
        return <PracticeLab />;

      case "Assessment":
        return <Assessment />;

      case "My progress":
        return (
          <Progress
            completed={completed}
            progress={progress}
            onOpenModule={openModule}
          />
        );

      case "Settings":
        return (
          <Settings
            preferences={preferences}
            onPreferenceChange={updatePreference}
            onResetPreferences={resetPreferences}
            storageAvailable={storageAvailable}
          />
        );

      default:
        return <Dashboard preferences={preferences} progress={progress} completed={completed} />;
    }
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Layout
      preferences={preferences}
      page={page}
      user={user}
      onLogout={handleLogout}
      activeModule={activeModule}
      mobileOpen={mobileOpen}
      onNavigate={navigate}
      onMenuOpen={() => setMobileOpen(true)}
      onMenuClose={() => setMobileOpen(false)}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
