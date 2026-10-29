/** Placeholder landing (TKT-51). The real sections come from the database in TKT-54; no CV text lives in code. */
export default function Home() {
  return (
    <main className="page hero">
      <span className="tag">Under construction</span>
      <h1>Jamie Ho</h1>
      <p>Software engineer in London. This site is being built in public: a portfolio, a desktop of apps, and a home for side projects.</p>
      <div className="window" aria-label="Status">
        <div className="window-bar">
          <i />
          <i />
          <i />
          <span>status</span>
        </div>
        <div className="window-body">
          Skeleton is live. Health check: <a href="/api/health"><code>/api/health</code></a>
        </div>
      </div>
    </main>
  );
}
