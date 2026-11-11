
import { Workflow, Play, ArrowRight } from "lucide-react";

export default function Visualiser() {
  return (
    <div className="content-wrap">
      <div className="page-intro">
        <div className="eyebrow">INTERACTIVE EXPLORATION</div>
        <h1>See hashing in action.</h1>
        <p>
          Explore how keys are inserted into a hash table,
          how collisions occur and how linear probing works.
        </p>
      </div>

      <div className="feature-placeholder">
        <div className="feature-icon">
          <Workflow size={30} />
        </div>

        <span className="pill pill-blue">VISUALISER</span>

        <h2>Your interactive hash table is coming next.</h2>

        <p>
          This is where students will be able to insert keys,
          observe collisions and follow the probing sequence.
        </p>

        <div className="feature-list">
          <div><Play size={17} /> Step through insertions</div>
          <div><ArrowRight size={17} /> Observe linear probing</div>
          <div><Workflow size={17} /> Explore wrap-around behaviour</div>
        </div>
      </div>
    </div>
  );
}
