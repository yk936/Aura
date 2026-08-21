/**
 * Lightweight, fast rule-based task classifier for user prompts
 */

export const TASK_TYPES = {
  GENERAL_CHAT: "general_chat",
  CODING: "coding",
  REASONING: "reasoning",
  ANALYSIS: "analysis",
  SUMMARIZATION: "summarization",
  WEB_SEARCH: "web_search",
  DEEP_RESEARCH: "deep_research",
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

  // Explicit Deep Research trigger
  if (
    text.includes("deep research") ||
    text.includes("research this") ||
    text.includes("research the current") ||
    text.includes("comprehensive research") ||
    (text.includes("research") && text.includes("compare"))
  ) {
    return TASK_TYPES.DEEP_RESEARCH;
  }

  // Explicit or implicit Web Search trigger
  if (
    text.includes("search the web") ||
    text.includes("search web") ||
    text.includes("search online") ||
    text.includes("search right now") ||
    text.includes("look this up") ||
    text.includes("find the latest") ||
    text.includes("use current information") ||
    text.includes("do a web search") ||
    text.includes("google search") ||
    text.includes("latest stable") ||
    text.includes("latest news") ||
    text.includes("latest major") ||
    text.includes("latest model") ||
    text.includes("latest releases") ||
    text.includes("current price") ||
    text.includes("current market") ||
    text.includes("current specs") ||
    text.includes("recent releases") ||
    text.includes("what happened today") ||
    text.includes("latest version")
  ) {
    return TASK_TYPES.WEB_SEARCH;
  }

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

  return TASK_TYPES.GENERAL_CHAT;
}
