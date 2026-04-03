import React from "react";

const LoadingSpinner = () => {
  return (
    <section
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 2rem",
        gap: "1.5rem",
      }}
    >
      <div className="loader"></div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--text-main)",
            letterSpacing: "-0.01em",
          }}
        >
          Analyzing Candidates...
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            maxWidth: "30ch",
          }}
        >
          The AI is reading and comparing every resume against your
          requirements.
        </p>
      </div>
    </section>
  );
};

export default LoadingSpinner;
