
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate, useParams } from "react-router";
import Layout from "./components/layout/Layout";
import { modules } from "./data/modules";
import useProgress from "./hooks/useProgress";
import usePreferences from "./hooks/usePreferences";
import LearningCheckIn from "./components/onboarding/LearningCheckIn";

import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import Visualiser from "./pages/Visualiser";
import Assessment from "./pages/Assessment";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { loadUser, saveUser } from "./api/auth";
import { saveStudentNumber } from "./api/profile";

// Each page has its own route. The labels are what the sidebar, the breadcrumb and
// the existing onNavigate("Settings")-style calls use, so pages did not need to change.
const PAGES = [
  { label: "Dashboard", path: "/" },
  { label: "Learning modules", path: "/modules" },
  { label: "Visualiser", path: "/visualiser" },
  { label: "Assessment", path: "/assessment" },
  { label: "My progress", path: "/progress" },
  { label: "Settings", path: "/settings" }
];

const modulePath = (module) => `/modules/${module.id}`;
const findModule = (id) => modules.find((module) => String(module.id) === String(id)) ?? null;

// /modules/:id. Unknown ids go back to the module list. The key resets the
// lesson state when moving straight from one module to another.
function ModuleRoute(props) {
  const { moduleId } = useParams();
  const module = findModule(moduleId);
  if (!module) return <Navigate to="/modules" replace />;
  return <ModuleDetail key={module.id} module={module} {...props} />;
}

function App() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  // The mobile menu belongs to the page it was opened on, so it closes on any
  // navigation, including the browser's back and forward buttons.
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(loadUser);

  const { completed, progress, completeModule } = useProgress(user?.id);
  const { preferences, updatePreference, resetPreferences, storageAvailable } = usePreferences(user?.id);

  function finishCheckIn(preferredMode) {
    if (preferredMode) updatePreference("preferredMode", preferredMode);
    updatePreference("learningCheckInComplete", true);
  }

  function restartCheckIn() {
    updatePreference("learningCheckInComplete", false);
  }

  const mobileOpen = menuOpenOn === location.pathname;

  // What the breadcrumb, sidebar highlight and read-aloud see.
  const moduleMatch = matchPath("/modules/:moduleId", location.pathname);
  const activeModule = moduleMatch ? findModule(moduleMatch.params.moduleId) : null;
  const page = activeModule
    ? "Module"
    : PAGES.find((item) => item.path === location.pathname)?.label ?? "Dashboard";

  // New page: start at the top and name the browser tab after it.
  useEffect(() => {
    window.scrollTo(0, 0);
    const name = !user ? "Log in" : activeModule ? activeModule.title : page;
    document.title = `${name} · HashLab`;
  }, [location.pathname, page, activeModule, user]);

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
    routerNavigate(modulePath(module));
  }

  function navigate(label) {
    routerNavigate(PAGES.find((item) => item.label === label)?.path ?? "/");
  }

  function handleLogin(loggedIn) {
    saveUser(loggedIn);
    setUser(loggedIn);
    // Back to the page they first asked for, or the dashboard.
    routerNavigate(location.state?.from ?? "/", { replace: true });
  }

  // Saves the student number on the account and keeps the signed-in copy in step.
  async function handleSaveStudentNumber(value) {
    const saved = await saveStudentNumber(user.id, value);
    const updated = { ...user, studentNumber: saved };
    saveUser(updated);
    setUser(updated);
    return saved;
  }

  function handleLogout() {
    saveUser(null);
    setUser(null);
    routerNavigate("/login", { replace: true });
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="*"
          element={<Navigate to="/login" replace state={{ from: location.pathname }} />}
        />
      </Routes>
    );
  }

  if (!preferences.learningCheckInComplete) {
    return <LearningCheckIn onComplete={finishCheckIn} onSkip={() => finishCheckIn()} />;
  }

  return (
    <Layout
      preferences={preferences}
      page={page}
      user={user}
      onLogout={handleLogout}
      activeModule={activeModule}
      mobileOpen={mobileOpen}
      onNavigate={navigate}
      onMenuOpen={() => setMenuOpenOn(location.pathname)}
      onMenuClose={() => setMenuOpenOn(null)}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              preferences={preferences}
              progress={progress}
              completed={completed}
              onOpenModule={openModule}
              onNavigate={navigate}
            />
          }
        />
        <Route
          path="/modules"
          element={
            <Modules
              completed={completed}
              onOpenModule={openModule}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredModules={filteredModules}
            />
          }
        />
        <Route
          path="/modules/:moduleId"
          element={
            <ModuleRoute
              preferences={preferences}
              completed={completed}
              onBack={() => navigate("Learning modules")}
              onComplete={completeModule}
            />
          }
        />
        <Route path="/visualiser" element={<Visualiser />} />
        <Route path="/assessment" element={<Assessment onOpenModule={openModule} />} />
        <Route
          path="/progress"
          element={<Progress completed={completed} progress={progress} onOpenModule={openModule} />}
        />
        <Route
          path="/settings"
          element={
            <Settings
              key={user.id}
              studentNumber={user.studentNumber ?? ""}
              onSaveStudentNumber={handleSaveStudentNumber}
              preferences={preferences}
              onPreferenceChange={updatePreference}
              onResetPreferences={resetPreferences}
              onRetakeCheckIn={restartCheckIn}
              storageAvailable={storageAvailable}
            />
          }
        />
        {/* Already logged in, or an unknown address: go home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
