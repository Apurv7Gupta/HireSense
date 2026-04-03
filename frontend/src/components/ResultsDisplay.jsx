import React from "react";

const ResultsDisplay = ({
  analysisResults,
  handleReset,
  handleDownloadReport,
}) => {
  const topCandidate =
    analysisResults.find((r) => r.rank === 1) || analysisResults[0];

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

      {/* Top Candidate Strategy */}
      {topCandidate && !topCandidate.error && (
        <div
          className="card"
          style={{
            borderLeft: "4px solid var(--brand-primary)",
            background: "var(--bg-secondary)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Top Candidate Strategy</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <h4
                style={{
                  color: "var(--brand-primary)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                }}
              >
                Recommended Companies
              </h4>
              <ul style={{ fontSize: "0.9rem", paddingLeft: "1.2rem" }}>
                {topCandidate.target_companies?.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                style={{
                  color: "var(--brand-primary)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                }}
              >
                Recruiter Cold Mail
              </h4>
              <textarea
                readOnly
                value={topCandidate.cold_mail}
                style={{
                  minHeight: "100px",
                  fontSize: "0.8rem",
                  background: "var(--bg-card)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {analysisResults.map((result, index) => (
          <div key={index} className="result-card">
            <div
              className="result-header"
              style={{ marginBottom: "0.5rem" }} // ✅ RESTORED spacing
            >
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
                      fontSize: "1rem", // ✅ RESTORED
                      opacity: 0.9, // ✅ RESTORED
                      marginRight: "4px", // ✅ RESTORED
                      textTransform: "uppercase", // ✅ RESTORED
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
              <>
                <div
                  className="points-container"
                  style={{ alignItems: "flex-start" }} // ✅ RESTORED alignment
                >
                  <div className="good-points" style={{ flex: 1 }}>
                    <h4>Strengths</h4>
                    <ul>
                      {result.good_points.map((p, i) => (
                        <li
                          key={i}
                          style={{ marginBottom: "4px" }} // ✅ RESTORED spacing
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bad-points" style={{ flex: 1 }}>
                    <h4>Weaknesses</h4>
                    <ul>
                      {result.bad_points.map((p, i) => (
                        <li
                          key={i}
                          style={{ marginBottom: "4px" }} // ✅ RESTORED spacing
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Resume Enhancement Tips */}
                {result.rank > 1 &&
                  result.improvement_suggestions?.length > 0 && (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        borderRadius: "8px",
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid var(--status-warning)",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          color: "var(--status-warning)",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Resume Enhancement Tips
                      </h4>
                      <ul
                        style={{
                          fontSize: "0.85rem",
                          margin: 0,
                          paddingLeft: "1.2rem",
                        }}
                      >
                        {result.improvement_suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultsDisplay;
