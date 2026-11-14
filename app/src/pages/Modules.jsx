
import { Search } from "lucide-react";
import ModuleCard from "../components/dashboard/ModuleCard";

export default function Modules({
  completed,
  onOpenModule,
  searchTerm,
  setSearchTerm,
  filteredModules
}) {
  return (
    <div className="content-wrap">
      <div className="page-intro">
        <div className="eyebrow">YOUR LEARNING PATH</div>
        <h1>Learning modules</h1>
        <p>
          Explore each topic and build your understanding
          of hash tables step by step.
        </p>
      </div>

      <div className="module-toolbar">
        <label className="search-box">
          <Search size={19} aria-hidden="true" />

          <input
            type="search"
            aria-label="Search learning modules"
            placeholder="Search learning modules..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <div className="module-list">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              completed={completed}
              onOpenModule={onOpenModule}
            />
          ))
        ) : (
          <p>No modules match your search.</p>
        )}
      </div>
    </div>
  );
}
