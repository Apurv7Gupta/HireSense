import React, { useCallback, useMemo } from "react";

const MAX_LENGTH = 8000;

const JobDescriptionForm = ({ jobDescription, setJobDescription }) => {
  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length <= MAX_LENGTH) {
        setJobDescription(value);
      }
    },
    [setJobDescription],
  );

  const characterCount = useMemo(() => jobDescription.length, [jobDescription]);

  return (
    /* Changed 'card' to 'sidebar-section' to match your Sidebar styles */
    <section
      className="sidebar-section"
      aria-labelledby="job-description-label"
    >
      <div className="form-group">
        {/* The <h4> here will now inherit your uppercase, letter-spaced sidebar header style */}
        <h4 id="job-description-label">Job Description</h4>

        <textarea
          id="job-description"
          name="jobDescription"
          value={jobDescription}
          onChange={handleChange}
          placeholder="Paste the full job description here..."
          required
          rows={10} // Reduced rows slightly for better sidebar fit
          maxLength={MAX_LENGTH}
          aria-describedby="job-description-meta"
        />

        <div
          id="job-description-meta"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "0.75rem",
            fontSize: "0.75rem",
            fontWeight: "500",
            color: "var(--text-muted)",
          }}
        >
          <span>Character Limit</span>
          <span>
            {characterCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
};

export default React.memo(JobDescriptionForm);
