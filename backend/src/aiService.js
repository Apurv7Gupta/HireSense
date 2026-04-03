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

      improvement_suggestions: z
        .array(z.string())
        .optional()
        .describe(
          "3 specific tips to improve this specific resume for this JD.",
        ),
    }),
  ),

  top_candidate_cold_mail: z
    .string()
    .describe(
      "A professional cold email written for the #1 ranked candidate to send to a recruiter.",
    ),
  target_companies: z
    .array(z.string())
    .describe(
      "List of 3-5 real-world companies likely to hire someone with the top candidate's profile.",
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

ADDITIONALLY:
1. For candidates ranked lower, provide 3 actionable resume improvement suggestions.
2. For the #1 ranked candidate, write a high-conversion cold email to a recruiter.
3. Based on the #1 candidate's profile, list 3-5 companies currently known for hiring this stack.

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
      fileName,
    };
  } catch (error) {
    console.error(`Error analyzing resume ${fileName}:`, error);
    throw error;
  }
}

export async function rankCandidates(jobDescription, analyzedResumes) {
  const candidatesString = analyzedResumes
    .map(
      (c) => `Candidate: ${c.candidateName} (File: ${c.fileName})
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
        improvement_suggestions: ranked.improvement_suggestions || [],
      };
    });

    if (finalResults.length > 0) {
      const sorted = finalResults.sort((a, b) => a.rank - b.rank);

      sorted[0].cold_mail = result.top_candidate_cold_mail;
      sorted[0].target_companies = result.target_companies;

      return sorted;
    }

    return finalResults;
  } catch (error) {
    console.error("Error in ranking candidates:", error);

    console.warn("Falling back to simple sorting based on initial scores.");

    // fallback logic
    return analyzedResumes
      .map((r, index) => ({ ...r, rank: index + 1 }))
      .sort((a, b) => b.score - a.score)
      .map((r, index) => ({ ...r, rank: index + 1 }));
  }
}
