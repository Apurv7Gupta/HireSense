import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import "dotenv/config";

import { parseResume } from "./resumeParser.js";
import { analyzeSingleResume, rankCandidates } from "./aiService.js";

const app = new Hono();
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "GET", "OPTIONS"],
  }),
);

app.post("/api/analyze", async (c) => {
  try {
    const formData = await c.req.formData();
    const jobDescription = formData.get("jobDescription");
    const resumeFiles = formData.getAll("resumes");

    if (!jobDescription || resumeFiles.length === 0) {
      return c.json(
        { error: "Job description and at least one resume are required." },
        400,
      );
    }

    // 1. Parse Resumes
    const parsingPromises = resumeFiles.map(async (file) => {
      try {
        const text = await parseResume(file);
        return { status: "fulfilled", fileName: file.name, text: text };
      } catch (e) {
        return { status: "rejected", fileName: file.name, error: e.message };
      }
    });

    const parsingResults = await Promise.all(parsingPromises);

    const successfullyParsedResumes = parsingResults.filter(
      (r) => r.status === "fulfilled",
    );
    const failedToParseResumes = parsingResults.filter(
      (r) => r.status === "rejected",
    );

    if (successfullyParsedResumes.length === 0) {
      return c.json(
        { error: "Could not parse any of the uploaded resumes." },
        400,
      );
    }

    // 2. Analyze Each Resume Individually (Map Step)
    const analysisPromises = successfullyParsedResumes.map(async (resume) => {
      try {
        const analysis = await analyzeSingleResume(
          jobDescription,
          resume.text,
          resume.fileName,
        );
        return { status: "fulfilled", data: analysis };
      } catch (e) {
        console.error(`Analysis failed for ${resume.fileName}:`, e);
        return {
          status: "rejected",
          fileName: resume.fileName,
          error: "AI Analysis Failed",
        };
      }
    });

    const analysisResults = await Promise.all(analysisPromises);

    const successfulAnalyses = analysisResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.data);

    const failedAnalyses = analysisResults
      .filter((r) => r.status === "rejected")
      .map((r) => ({ fileName: r.fileName, error: r.error }));

    if (successfulAnalyses.length === 0) {
      return c.json(
        { error: "AI analysis failed for all parsed resumes." },
        500,
      );
    }

    // 3. Rank Candidates (Reduce Step)
    const rankedCandidates = await rankCandidates(
      jobDescription,
      successfulAnalyses,
    );

    // 4. Combine Results
    // Combine ranked candidates with those that failed parsing or analysis
    const failedParseObjects = failedToParseResumes.map((f) => ({
      fileName: f.fileName,
      error: `File failed to be parsed: ${f.error}`,
    }));

    const finalResults = [
      ...rankedCandidates,
      ...failedAnalyses,
      ...failedParseObjects,
    ];

    // ranked ones are at the top, errors at the bottom
    finalResults.sort((a, b) => {
      if (a.rank && !b.rank) return -1;
      if (!a.rank && b.rank) return 1;
      return (a.rank || 999) - (b.rank || 999);
    });

    return c.json({ results: finalResults });
  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return c.json({ error: "An unexpected server error occurred." }, 500);
  }
});

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
