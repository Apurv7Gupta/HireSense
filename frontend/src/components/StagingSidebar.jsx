import React from "react";

const StagingSidebar = ({ stagedFiles, handleRemoveFile, formatFileSize }) => {
  return (
    <aside className="staging-sidebar">
      <div className="sidebar-sticky-content">
        {/* Inherits h4 styling and padding from .sidebar-section */}
        <div className="sidebar-section">
          <h4>Staged Files ({stagedFiles.length})</h4>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {stagedFiles.length > 0 ? (
              stagedFiles.map((file, index) => (
                <div
                  key={file.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--border-radius-md)",
                    animation: "slideUp 300ms ease-out", // Uses your slideUp animation
                  }}
                >
                  <div style={{ fontSize: "1.2rem" }}>📄</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formatFileSize(file.size)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      padding: "0 0.25rem",
                      lineHeight: 1,
                      transition: "color var(--transition-base)",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--status-error)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-muted)")
                    }
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  margin: "1rem 0",
                }}
              >
                Upload one or more resumes to begin.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StagingSidebar;
