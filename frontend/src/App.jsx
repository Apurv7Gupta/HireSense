import { useState } from "react";
import "./App.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Components
import Header from "./components/Header";
import JobDescriptionForm from "./components/JobDescriptionForm";
import ControlsSidebar from "./components/ControlsSidebar";
import StagingSidebar from "./components/StagingSidebar";
import ResultsDisplay from "./components/ResultsDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import ThemeToggleButton from "./components/ThemeBtn";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [stagedFiles, setStagedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setStagedFiles((prev) => [
      ...prev,
      ...newFiles.filter((nf) => !prev.some((pf) => pf.name === nf.name)),
    ]);
    e.target.value = null;
  };

  const handleRemoveFile = (indexToRemove) => {
    setStagedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleReset = () => {
    setJobDescription("");
    setStagedFiles([]);
    setAnalysisResults([]);
    setError("");
  };

  const handleDownloadReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("HireSense - Analysis Report", pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString(), pageWidth - 20, 20, {
        align: "right",
      });

      // Job Description
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Job Description:", 20, 40);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const jdLines = doc.splitTextToSize(jobDescription, pageWidth - 40);
      doc.text(jdLines, 20, 48);

      let currentY = doc.getTextDimensions(jdLines).h + 55;

      const tableHead = [
        [
          "Rank",
          "Candidate",
          "Score",
          "Strengths",
          "Weaknesses",
          "Improvements Needed",
        ],
      ];

      const tableBody = analysisResults
        .filter((res) => !res.error)
        .map((res) => [
          `#${res.rank}`,
          res.candidateName,
          res.score,
          res.good_points.map((p) => `- ${p}`).join("\n"),

          res.bad_points?.map((p) => `- ${p}`).join("\n") || "N/A",

          res.rank > 1
            ? res.improvement_suggestions?.map((s) => `* ${s}`).join("\n") ||
              "N/A"
            : "Top Match - See Strategy Below",
        ]);

      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: currentY,
        theme: "striped",

        headStyles: {
          fillColor: [79, 70, 229],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: "linebreak",
        },

        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 15 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
        },
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // Cold Mail
      const topCand = analysisResults.find((r) => r.rank === 1);
      if (topCand && topCand.cold_mail) {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Top Candidate Cold Email Strategy:", 20, currentY);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const mailLines = doc.splitTextToSize(
          topCand.cold_mail,
          pageWidth - 40,
        );
        doc.text(mailLines, 20, currentY + 8);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
          align: "right",
        });
      }

      doc.save("Hire-sense-report.pdf");
    } catch (e) {
      console.error("Error generating PDF:", e);
      setError("Failed to generate PDF report.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setAnalysisResults([]);

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    stagedFiles.forEach((file) => formData.append("resumes", file));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      setAnalysisResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 100,
        }}
      >
        <ThemeToggleButton />
      </div>

      <Header />

      <div className="app-layout">
        <aside className="actions-sidebar">
          <div className="sidebar-sticky-content">
            <ControlsSidebar
              handleReset={handleReset}
              handleFileChange={handleFileChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stagedFiles={stagedFiles}
              jobDescription={jobDescription}
            />

            {error && (
              <div className="error-message" style={{ marginTop: "1rem" }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </aside>

        <main className="main-content">
          {analysisResults.length > 0 ? (
            <ResultsDisplay
              analysisResults={analysisResults}
              handleReset={handleReset}
              handleDownloadReport={handleDownloadReport}
            />
          ) : isLoading ? (
            <div
              className="card"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "4rem",
              }}
            >
              <LoadingSpinner />
            </div>
          ) : (
            <JobDescriptionForm
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
            />
          )}
        </main>

        <StagingSidebar
          stagedFiles={stagedFiles}
          handleRemoveFile={handleRemoveFile}
          formatFileSize={formatFileSize}
        />
      </div>
    </div>
  );
}

export default App;
