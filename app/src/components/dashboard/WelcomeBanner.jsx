
import { Sparkles, ArrowRight, Hash } from "lucide-react";

export default function WelcomeBanner({ onNavigate }) {
  return (
    <section className="welcome-row">
      <div className="welcome-text">
        <div className="eyebrow">
          <Sparkles size={15} />
          YOUR PRE-LECTURE LEARNING SPACE
        </div>

        <h1>
          Make hashing <span>click.</span>
        </h1>

        <p className="welcome-copy">
          Understand the ideas, explore the algorithms, and arrive at your
          COS212 lecture ready to go.
        </p>

        <button
          className="primary-button"
          onClick={() => onNavigate("Learning modules")}
        >
          Explore learning modules
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="welcome-art">
        <div className="orbit" />
        <div className="orbit orbit-two" />

        <div className="floating-node node-a">23</div>
        <div className="floating-node node-b">43</div>
        <div className="floating-node node-c">13</div>

        <div className="art-hash">
          <Hash size={48} strokeWidth={2.5} />
        </div>

        <span className="art-caption">KEY → SLOT</span>
      </div>
    </section>
  );
}
