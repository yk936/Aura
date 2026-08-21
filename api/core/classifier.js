/**
 * Lightweight, fast rule-based task classifier for user prompts
 */

export const TASK_TYPES = {
  GENERAL_CHAT: "general_chat",
  CODING: "coding",
  REASONING: "reasoning",
  ANALYSIS: "analysis",
  SUMMARIZATION: "summarization",
  RESEARCH: "research",
  VISION: "vision",
  TOOL_REQUEST: "tool_request",
};

/**
 * Classifies user text prompt into a task category
 * @param {string} prompt
 * @returns {string} Task category
 */
export function classifyTask(prompt = "") {
  if (!prompt || typeof prompt !== "string") {
    return TASK_TYPES.GENERAL_CHAT;
  }

  const text = prompt.toLowerCase();

  // Coding indicators
  if (
    text.includes("code") ||
    text.includes("function") ||
    text.includes("bug") ||
    text.includes("javascript") ||
    text.includes("python") ||
    text.includes("react") ||
    text.includes("css") ||
    text.includes("html") ||
    text.includes("sql") ||
    text.includes("git") ||
    text.includes("error") ||
    text.includes("refactor")
  ) {
    return TASK_TYPES.CODING;
  }

  // Summarization indicators
  if (text.includes("summarize") || text.includes("summary") || text.includes("tl;dr") || text.includes("briefly explain")) {
    return TASK_TYPES.SUMMARIZATION;
  }

  // Reasoning indicators
  if (text.includes("why") || text.includes("logic") || text.includes("calculate") || text.includes("prove") || text.includes("step by step")) {
    return TASK_TYPES.REASONING;
  }

  // Analysis indicators
  if (text.includes("analyze") || text.includes("compare") || text.includes("pros and cons") || text.includes("review")) {
    return TASK_TYPES.ANALYSIS;
  }

  // Research indicators
  if (text.includes("search") || text.includes("latest news") || text.includes("find out") || text.includes("who is")) {
    return TASK_TYPES.RESEARCH;
  }

  return TASK_TYPES.GENERAL_CHAT;
}
