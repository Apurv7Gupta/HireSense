const ResultsDisplay = ({
  analysisResults,
  handleReset,
  handleDownloadReport,
}) => {
  return (
    <section
      id="results-section"
      style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: "800",
            letterSpacing: "-0.02em",
          }}
        >
          Ranked Shortlist
        </h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn-base"
            style={{
              padding: "0.85rem 1.25rem",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
            }}
            onClick={handleReset}
          >
            Start Over
          </button>
          <button
            className="btn-base submit-button"
            style={{ padding: "0.85rem 1.25rem" }}
            onClick={handleDownloadReport}
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {analysisResults.map((result, index) => (
          <div key={index} className="result-card">
            <div className="result-header" style={{ marginBottom: "0.5rem" }}>
              <div className="result-title" style={{ fontSize: "1.2rem" }}>
                <span
                  style={{
                    color: "var(--brand-primary)",
                    fontWeight: "800",
                    marginRight: "0.75rem",
                  }}
                >
                  #{result.rank || index + 1}
                </span>
                {result.candidateName || result.fileName}
              </div>
              {!result.error && (
                <div className="score-badge">
                  <span
                    style={{
                      fontSize: "1rem",
                      opacity: 0.9,
                      marginRight: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Score
                  </span>
                  {result.score}
                </div>
              )}
            </div>

            {result.error ? (
              <div className="error-message">{result.error}</div>
            ) : (
              <div
                className="points-container"
                style={{ alignItems: "flex-start" }}
              >
                <div className="good-points" style={{ flex: 1 }}>
                  <h4>Strengths</h4>
                  <ul>
                    {result.good_points.map((p, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bad-points" style={{ flex: 1 }}>
                  <h4>Weaknesses</h4>
                  <ul>
                    {result.bad_points.map((p, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultsDisplay;
