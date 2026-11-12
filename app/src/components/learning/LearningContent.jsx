
export default function LearningContent({
  title,
  content,
  example
}) {
  return (
    <section className="lesson-section">
      <h2>{title}</h2>

      <p>{content}</p>

      {example && (
        <div className="lesson-example">
          <strong>Example</strong>
          <p>{example}</p>
        </div>
      )}
    </section>
  );
}
