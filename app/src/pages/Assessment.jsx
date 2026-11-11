
import {
  ListChecks,
  Target,
  Lightbulb,
  RefreshCcw
} from "lucide-react";

export default function Assessment() {
  return (
    <div className="content-wrap">
      <div className="page-intro">
        <div className="eyebrow">CHECK YOUR UNDERSTANDING</div>
        <h1>Ready to test what you know?</h1>
        <p>
          Answer questions covering all six learning objectives.
          Use feedback to identify areas that need more practice.
        </p>
      </div>

      <div className="feature-placeholder">
        <div className="feature-icon">
          <ListChecks size={30} />
        </div>

        <span className="pill pill-blue">ASSESSMENT</span>

        <h2>Test your understanding.</h2>

        <p>
          Your assessment will include questions about hashing,
          collisions, linear probing, searching and clustering.
        </p>

        <div className="feature-list">
          <div><Target size={17} /> Questions mapped to LO1–LO6</div>
          <div><Lightbulb size={17} /> Feedback for misconceptions</div>
          <div><RefreshCcw size={17} /> Retry with guided support</div>
        </div>
      </div>
    </div>
  );
}
