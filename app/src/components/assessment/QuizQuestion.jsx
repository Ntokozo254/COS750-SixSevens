
export default function QuizQuestion({
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
  onSubmit
}) {
  return (
    <div className="quiz-question">
      <h2>{question}</h2>

      <div className="quiz-options">
        {options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${selectedAnswer === index ? "selected" : ""}`}
            onClick={() => onSelectAnswer(index)}
          >
            <span className="quiz-option-letter">
              {String.fromCharCode(65 + index)}
            </span>

            {option}
          </button>
        ))}
      </div>

      <button
        className="primary-button"
        onClick={onSubmit}
        disabled={selectedAnswer === null}
      >
        Check answer
      </button>
    </div>
  );
}
