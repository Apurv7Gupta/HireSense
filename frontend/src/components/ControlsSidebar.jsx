import React from "react";

const ControlsSidebar = ({
  handleReset,
  handleFileChange,
  handleSubmit,
  isLoading,
  stagedFiles,
  jobDescription,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* SECTION: Global Actions */}
      <div className="sidebar-section">
        <h4>Actions</h4>
        <button
          className="btn-base"
          onClick={handleReset}
          style={{
            width: "100%",
            padding: "0.6rem",
            fontSize: "0.85rem",
            background: "transparent",
            border: "1px solid var(--border-color)",
            color: "var(--text-muted)",
          }}
        >
          Clear All Data
        </button>
      </div>

      {/* SECTION: File Upload Area */}
      <div className="sidebar-section">
        <h4>Upload Resumes</h4>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="resumes-input"
            className="file-input"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.docx"
            style={{ width: "100%", fontSize: "0.8rem" }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              marginBottom: 0,
            }}
          >
            PDF or DOCX accepted
          </p>
        </div>
      </div>

      {/* SECTION: Primary Execution Action */}
      <div
        className="sidebar-section"
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          boxShadow: "none",
        }}
      >
        <button
          className="btn-base submit-button"
          onClick={handleSubmit}
          disabled={isLoading || stagedFiles.length === 0 || !jobDescription}
          style={{
            height: "52px",
            fontSize: "1rem",
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
          }}
        >
          {isLoading ? (
            <>
              <div
                className="loader"
                style={{ width: "18px", height: "18px", borderWidth: "2px" }}
              ></div>
              Analyzing...
            </>
          ) : (
            `Analyze ${stagedFiles.length} ${stagedFiles.length === 1 ? "Resume" : "Resumes"}`
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlsSidebar;
