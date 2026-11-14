
import { CheckCircle2, XCircle } from "lucide-react";

export default function AnswerFeedback({
  correct,
  explanation
}) {
  return (
    <div className={`answer-feedback ${correct ? "correct" : "incorrect"}`}>
      {correct ? (
        <CheckCircle2 size={21} />
      ) : (
        <XCircle size={21} />
      )}

      <div>
        <strong>{correct ? "Correct answer!" : "Not quite. Try again."}</strong>
        <p>{explanation}</p>
      </div>
    </div>
  );
}
