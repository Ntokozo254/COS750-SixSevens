
import { Lightbulb } from "lucide-react";

export default function ScaffoldingPanel({
  title = "Need a little help?",
  hints = []
}) {
  return (
    <div className="scaffolding-panel">
      <div className="scaffolding-heading">
        <Lightbulb size={20} />
        <h3>{title}</h3>
      </div>

      {hints.map((hint, index) => (
        <div className="scaffolding-hint" key={index}>
          <span>{index + 1}</span>
          <p>{hint}</p>
        </div>
      ))}
    </div>
  );
}
