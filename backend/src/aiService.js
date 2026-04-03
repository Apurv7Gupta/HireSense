import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// --- SCHEMAS ---

const singleCandidateAnalysisSchema = z.object({
  candidateName: z
    .string()
    .describe("The name of the candidate, extracted from the resume."),
  score: z
    .number()
    .describe(
      "An initial score from 0-100 based on the job description match.",
    ),
  good_points: z
    .array(z.string())
    .describe(
      "A list of 3 to 5 key strengths and alignments with the job description.",
    ),
  bad_points: z
    .array(z.string())
    .describe(
      "A list of 3 to 5 key weaknesses or areas missing from the job description.",
    ),
  key_skills_found: z
    .array(z.string())
    .describe("List of technical skills from the JD found in the resume."),
  experience_summary: z
    .string()
    .describe("Brief summary of relevant experience."),
});

// Schema for final ranking
const rankedListSchema = z.object({
  ranked_candidates: z.array(
    z.object({
      fileName: z.string(),
      candidateName: z.string(),
      rank: z.number(),
      final_score: z.number(),
      reasoning: z
        .string()
        .describe(
          "Why this candidate was ranked in this position relative to others.",
        ),
    }),
  ),
});

// --- MODELS ---

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.1,
});

const singleAnalysisModel = model.withStructuredOutput(
  singleCandidateAnalysisSchema,
);
const rankingModel = model.withStructuredOutput(rankedListSchema);

// --- PROMPTS ---

const singleAnalysisPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert HR Analyst. Analyze the provided resume against the Job Description.
    Extract the candidate's name, identify key strengths and weaknesses, and provide an initial score (0-100) based on the fit.
    Be objective and critical. Look for evidence of skills, not just keywords.`,
  ],
  [
    "human",
    `JOB DESCRIPTION:
    {job_description}

    RESUME TEXT:
    {resume_text}`,
  ],
]);

const rankingPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a Lead Talent Acquisition Manager. You have received structured analysis for a batch of candidates.
    Your task is to compare them and produce a final ranked list.
    
    Review the scores and feedback provided for each candidate.
    Adjust the rankings based on a comparative analysis. A candidate with a slightly lower individual score might rank higher if their specific strengths are more critical for the role.
    
    Output a JSON object with the final ranking.`,
  ],
  [
    "human",
    `JOB DESCRIPTION SUMMARY:
    {job_description}

    CANDIDATE ANALYSES:
    {candidate_analyses}`,
  ],
]);

// --- CHAINS ---

const singleAnalysisChain = singleAnalysisPrompt.pipe(singleAnalysisModel);
const rankingChain = rankingPrompt.pipe(rankingModel);

// --- FUNCTIONS ---

/**
 
 * @param {string} jobDescription
 * @param {string} resumeText
 * @param {string} fileName
 */
export async function analyzeSingleResume(
  jobDescription,
  resumeText,
  fileName,
) {
  try {
    const result = await singleAnalysisChain.invoke({
      job_description: jobDescription,
      resume_text: resumeText,
    });
    return {
      ...result,
      fileName: fileName,
    };
  } catch (error) {
    console.error(`Error analyzing resume ${fileName}:`, error);
    throw error;
  }
}

/**
 *
 * @param {string} jobDescription
 * @param {Array} analyzedResumes
 */
export async function rankCandidates(jobDescription, analyzedResumes) {
  const candidatesString = analyzedResumes
    .map(
      (c) =>
        `Candidate: ${c.candidateName} (File: ${c.fileName})
        Score: ${c.score}
        Strengths: ${c.good_points.join(", ")}
        Weaknesses: ${c.bad_points.join(", ")}
        Experience: ${c.experience_summary}`,
    )
    .join("\n\n");

  try {
    const result = await rankingChain.invoke({
      job_description: jobDescription,
      candidate_analyses: candidatesString,
    });

    const finalResults = result.ranked_candidates.map((ranked) => {
      const original = analyzedResumes.find(
        (a) => a.fileName === ranked.fileName,
      );
      return {
        ...original,
        rank: ranked.rank,
        score: ranked.final_score,
        ranking_reasoning: ranked.reasoning,
      };
    });

    return finalResults.sort((a, b) => a.rank - b.rank);
  } catch (error) {
    console.error("Error in ranking candidates:", error);

    console.warn("Falling back to simple sorting based on initial scores.");
    return analyzedResumes
      .map((r, index) => ({ ...r, rank: index + 1 })) // Temporary rank
      .sort((a, b) => b.score - a.score)
      .map((r, index) => ({ ...r, rank: index + 1 })); // Re-assign rank after sort
  }
}
