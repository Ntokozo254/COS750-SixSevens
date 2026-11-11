
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";

export default function FeedbackPanel({
  correct,
  message,
  explanation,
  hint
}) {
  return (
    <div className={`feedback-panel ${correct ? "feedback-correct" : "feedback-incorrect"}`}>
      <div className="feedback-heading">
        {correct ? (
          <CheckCircle2 size={20} />
        ) : (
          <XCircle size={20} />
        )}

        <strong>{message}</strong>
      </div>

      {explanation && <p>{explanation}</p>}

      {hint && (
        <div className="feedback-hint">
          <Lightbulb size={17} />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}
