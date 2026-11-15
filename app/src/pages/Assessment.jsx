import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Lightbulb,
  ListChecks,
  RefreshCcw,
  Target,
  XCircle
} from "lucide-react";
import { modules } from "../data/modules";
import {
  PASS_MARK,
  buildAssessment,
  markAssessment,
  readBestScore,
  saveBestScore
} from "../features/assessment/assessmentLogic";
import "../features/assessment/assessment.css";

const LETTERS = ["A", "B", "C", "D", "E"];
const moduleTitle = (id) => modules.find((module) => module.id === id)?.title ?? `Module ${id}`;

export default function Assessment({ onOpenModule }) {
  const id = useId();
  const headingRef = useRef(null);
  const [stage, setStage] = useState("start"); // start | quiz | results
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [previousBest, setPreviousBest] = useState(() => readBestScore());
  const [best, setBest] = useState(() => readBestScore());

  const question = questions[index];
  const checked = answers.length > index;
  const correct = checked && answers[index] === question.correctAnswer;

  // Move focus to the new question so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (stage !== "start") headingRef.current?.focus({ preventScroll: false });
  }, [stage, index]);

  function start() {
    setQuestions(buildAssessment({ avoid: questions.map((q) => q.id) }));
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setResult(null);
    setStage("quiz");
  }

  function check() {
    if (selected === null || checked) return;
    setAnswers([...answers, selected]);
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    const marked = markAssessment(questions, answers);
    setPreviousBest(best);
    setBest(saveBestScore(marked.score));
    setResult(marked);
    setStage("results");
  }

  return (
    <div className="content-wrap assess-page">
      <div className="page-intro">
        <div className="eyebrow">CHECK YOUR UNDERSTANDING</div>
        <h1>Ready to test what you know<span>?</span></h1>
        <p>
          A mixed check across all six learning objectives. Use the feedback to see what to revisit
          before your COS212 lecture.
        </p>
      </div>

      {stage === "start" && (
        <div className="assess-layout">
          <section className="assess-card assess-start">
            <div className="feature-icon">
              <ListChecks size={30} />
            </div>
            <h2>Course assessment</h2>
            <p>
              <strong>12 questions</strong>, two for each learning objective, drawn from every
              module's knowledge check. You'll get a new mix each time.
            </p>
            <ul className="assess-facts">
              <li><Clock3 size={16} /> Untimed. Take as long as you need.</li>
              <li><Lightbulb size={16} /> Feedback after every answer.</li>
              <li><Target size={16} /> A breakdown by objective, with what to review.</li>
              <li><RefreshCcw size={16} /> Retry as often as you like. Nothing is graded.</li>
            </ul>
            <button type="button" className="primary-button assess-start-button" onClick={start}>
              Start assessment <ArrowRight size={15} />
            </button>
          </section>

          <aside className="assess-aside">
            <div className="side-card">
              <div className="side-card-heading">WHAT IT COVERS</div>
              <ol className="assess-objectives">
                {modules.map((module) => (
                  <li key={module.id}>
                    <span className="pill pill-blue">LO{module.id}</span>
                    <span>{module.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}

      {stage === "quiz" && question && (
        <section className="assess-card assess-quiz" aria-labelledby={`${id}-question`}>
          <div className="assess-quiz-top">
            <span className="assess-position">
              Question {index + 1} of {questions.length}
            </span>
            <span className="pill pill-blue">
              LO{question.moduleId} · {moduleTitle(question.moduleId)}
            </span>
          </div>
          <div
            className="assess-progress"
            role="progressbar"
            aria-label="Assessment progress"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={answers.length}
          >
            <span style={{ width: `${(answers.length / questions.length) * 100}%` }} />
          </div>

          <h2 id={`${id}-question`} ref={headingRef} tabIndex={-1}>
            {question.question}
          </h2>

          <div className="assess-options" role="radiogroup" aria-labelledby={`${id}-question`}>
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const isAnswer = optionIndex === question.correctAnswer;
              const state = checked
                ? isAnswer
                  ? "right"
                  : isSelected
                    ? "wrong"
                    : "muted"
                : isSelected
                  ? "selected"
                  : "";
              return (
                <button
                  key={optionIndex}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={checked}
                  className={`assess-option${state ? ` assess-option--${state}` : ""}`}
                  onClick={() => setSelected(optionIndex)}
                >
                  <span className="assess-letter">{LETTERS[optionIndex]}</span>
                  <span>{option}</span>
                  {checked && isAnswer && <CheckCircle2 size={17} className="assess-mark" aria-label="Correct answer" />}
                  {checked && isSelected && !isAnswer && <XCircle size={17} className="assess-mark" aria-label="Your answer" />}
                </button>
              );
            })}
          </div>

          <div aria-live="polite">
            {checked && (
              <div className={`assess-feedback ${correct ? "assess-feedback--right" : "assess-feedback--wrong"}`}>
                <strong>
                  {correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                  {correct ? "Correct." : `Not quite. The answer is ${LETTERS[question.correctAnswer]}.`}
                </strong>
                <p>{question.explanation}</p>
                {!correct && question.guidance && (
                  <p className="assess-hint">
                    <Lightbulb size={15} /> {question.guidance.hints[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="assess-actions">
            <button type="button" className="secondary-button" onClick={() => setStage("start")}>
              Leave assessment
            </button>
            {checked ? (
              <button type="button" className="primary-button" onClick={next}>
                {index === questions.length - 1 ? "See my results" : "Next question"}
                <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" className="primary-button" disabled={selected === null} onClick={check}>
                Check answer
              </button>
            )}
          </div>
        </section>
      )}

      {stage === "results" && result && (
        <div className="assess-layout">
          <section className="assess-card" aria-labelledby={`${id}-results`}>
            <div className={`assess-score ${result.passed ? "assess-score--pass" : ""}`}>
              <div className="assess-score-number">
                {result.score}
                <span>%</span>
              </div>
              <div>
                <h2 id={`${id}-results`} ref={headingRef} tabIndex={-1}>
                  {result.passed ? "You're ready for the lecture." : "Good effort. A little more practice will help."}
                </h2>
                <p>
                  {result.correct} of {result.total} correct.{" "}
                  {result.passed
                    ? `That's at or above the ${PASS_MARK}% mark.`
                    : `Aim for ${PASS_MARK}% or more. The modules below show where to focus.`}
                </p>
                {previousBest !== null && (
                  <p className="assess-compare">
                    {result.score > previousBest
                      ? `Up from your previous best of ${previousBest}%. Your effort is paying off.`
                      : `Your best is ${best}%. Each attempt uses new questions, so keep practising.`}
                  </p>
                )}
              </div>
            </div>

            <h3 className="assess-section-title">By learning objective</h3>
            <ol className="assess-breakdown">
              {result.byModule.map((row) => {
                const strong = row.correct === row.total;
                const module = modules.find((item) => item.id === row.moduleId);
                return (
                  <li key={row.moduleId} className={strong ? "assess-row--strong" : "assess-row--review"}>
                    <div className="assess-row-head">
                      <span className="pill pill-blue">LO{row.moduleId}</span>
                      <strong>{moduleTitle(row.moduleId)}</strong>
                      <span className={`pill ${strong ? "pill-green" : "assess-pill-review"}`}>
                        {row.correct}/{row.total} · {strong ? "Secure" : "Review"}
                      </span>
                    </div>
                    {row.review.map((guide) => (
                      <p key={guide.title} className="assess-row-hint">
                        <Lightbulb size={14} /> <strong>{guide.title}.</strong> {guide.hints[0]}
                      </p>
                    ))}
                    {!strong && module && onOpenModule && (
                      <button type="button" className="text-button" onClick={() => onOpenModule(module)}>
                        Review {module.title} <ArrowRight size={13} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>

            <details className="assess-review">
              <summary>
                <ClipboardList size={15} /> See every question and answer
              </summary>
              <ol>
                {questions.map((item, itemIndex) => {
                  const right = answers[itemIndex] === item.correctAnswer;
                  return (
                    <li key={item.id}>
                      <p className="assess-review-question">
                        {right ? <CheckCircle2 size={15} className="assess-yes" /> : <XCircle size={15} className="assess-no" />}
                        {item.question}
                      </p>
                      {!right && (
                        <p>
                          Your answer: {item.options[answers[itemIndex]]}
                        </p>
                      )}
                      <p>
                        Correct answer: <strong>{item.options[item.correctAnswer]}</strong>. {item.explanation}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </details>

            <div className="assess-actions">
              <button type="button" className="secondary-button" onClick={() => setStage("start")}>
                Back to start
              </button>
              <button type="button" className="primary-button" onClick={start}>
                <RefreshCcw size={15} /> Try a fresh set
              </button>
            </div>
          </section>

          <aside className="assess-aside">
            <div className="side-card support-card">
              <Lightbulb size={22} />
              <h3>Take it to the lecture</h3>
              <p>
                Note one question you got wrong and why the right answer works. Bring it to your
                COS212 lecture to discuss.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
