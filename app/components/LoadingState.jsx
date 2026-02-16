export default function LoadingState({ tab = "history" }) {
  const blocks = tab === "report" ? 6 : tab === "scan" ? 5 : 4;
  return (
    <section className="loading-wrap" aria-live="polite" aria-busy="true">
      <div className="loading-head shimmer" />
      <div className="loading-grid">
        {Array.from({ length: blocks }).map((_, i) => (
          <article key={`loader-${tab}-${i}`} className="loading-card">
            <div className="loading-line lg shimmer" />
            <div className="loading-line md shimmer" />
            <div className="loading-line sm shimmer" />
          </article>
        ))}
      </div>
    </section>
  );
}
