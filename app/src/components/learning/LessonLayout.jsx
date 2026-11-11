
export default function LessonLayout({
  title,
  description,
  children,
  sidebar
}) {
  return (
    <div className="lesson-layout">
      <main className="learning-content">
        <div className="page-intro">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children}
      </main>

      {sidebar && (
        <aside className="lesson-sidebar">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
