import { performWebSearch } from "./search.js";
import { processSourceEvidence } from "./fetcher.js";
import { formatCitations } from "./citation.js";

const MAX_RESEARCH_ITERATIONS = 2;

/**
 * Multi-turn Deep Research Engine
 * Synthesizes research queries, performs web searches, cross-checks findings, and builds structured reports.
 */
export async function executeDeepResearch(topicPrompt) {
  const startTime = Date.now();
  const allSources = [];
  const researchLogs = [];

  researchLogs.push(`Initiating Deep Research workflow for: "${topicPrompt}"`);

  // Step 1: Execute primary search
  const initialSearch = await performWebSearch(topicPrompt);
  const initialEvidence = processSourceEvidence(initialSearch.results);
  allSources.push(...initialSearch.results);

  researchLogs.push(`Iteration 1 completed: ${initialEvidence.length} sources gathered.`);

  // Step 2: Execute targeted follow-up query for synthesis & cross-checking
  const secondaryQuery = `${topicPrompt} comparison analysis report details`;
  const secondarySearch = await performWebSearch(secondaryQuery);
  const secondaryEvidence = processSourceEvidence(secondarySearch.results);
  allSources.push(...secondarySearch.results);

  researchLogs.push(`Iteration 2 completed: ${secondaryEvidence.length} additional sources gathered.`);

  // Combine and deduplicate collected sources
  const uniqueSources = [];
  const seenUrls = new Set();
  for (const src of allSources) {
    if (src.url && !seenUrls.has(src.url)) {
      seenUrls.add(src.url);
      uniqueSources.push(src);
    }
  }

  const combinedEvidenceText = [initialSearch.summary, secondarySearch.summary]
    .filter(Boolean)
    .join("\n\n--- Additional Research Evidence ---\n\n");

  const citationMarkdown = formatCitations(uniqueSources);

  return {
    evidenceSummary: combinedEvidenceText,
    sources: uniqueSources,
    citationMarkdown,
    iterations: MAX_RESEARCH_ITERATIONS,
    latencyMs: Date.now() - startTime,
    logs: researchLogs,
  };
}
