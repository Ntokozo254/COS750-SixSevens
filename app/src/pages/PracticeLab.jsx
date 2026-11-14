
import { Code2, Lightbulb, Target } from "lucide-react";

export default function PracticeLab() {
  return (
    <div className="content-wrap">
      <div className="page-intro">
        <div className="eyebrow">LEARN BY DOING</div>
        <h1>Your practice space.</h1>
        <p>
          Apply what you have learned through guided
          challenges and independent experimentation.
        </p>
      </div>

      <div className="feature-placeholder">
        <div className="feature-icon">
          <Code2 size={30} />
        </div>

        <span className="pill pill-blue">PRACTICE LAB</span>

        <h2>Put your understanding to work.</h2>

        <p>
          Complete guided exercises before experimenting
          independently with hash tables.
        </p>

        <div className="feature-list">
          <div><Target size={17} /> Guided insertion exercises</div>
          <div><Lightbulb size={17} /> Instant feedback and hints</div>
          <div><Code2 size={17} /> Independent experimentation</div>
        </div>
      </div>
    </div>
  );
}
