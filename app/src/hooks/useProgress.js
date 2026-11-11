
import { useEffect, useState } from "react";
import { modules } from "../data/modules";

export default function useProgress() {
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("hashlab-completed-modules") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "hashlab-completed-modules",
      JSON.stringify(completed)
    );
  }, [completed]);

  const progress = Math.round(
    (completed.length / modules.length) * 100
  );

  function completeModule(id) {
    setCompleted((current) =>
      current.includes(id) ? current : [...current, id]
    );
  }

  return {
    completed,
    progress,
    completeModule
  };
}
