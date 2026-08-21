import { GoogleGenAI } from "@google/genai";
import { categorizeError, sanitizeString } from "../core/diagnostics.js";

/**
 * Direct Web Search Service using Gemini Google Search Grounding Tool
 */
export async function performWebSearch(query) {
  if (!query || typeof query !== "string") {
    return {
      results: [],
      summary: "",
      provider: "google_search_grounding",
      success: false,
      errorCategory: "invalid_request",
      error: "Query must be a non-empty string.",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      results: [],
      summary: "",
      provider: "google_search_grounding",
      success: false,
      status: 401,
      errorCategory: "auth_failure",
      error: "GEMINI_API_KEY environment variable is not configured for search.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Search the web for current, up-to-date information to answer this query: "${query}".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    const results = [];
    if (Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk, index) => {
        if (chunk.web) {
          const uri = chunk.web.uri || "";
          let domain = "";
          try {
            domain = new URL(uri).hostname.replace(/^www\./, "");
          } catch (e) {
            domain = "web";
          }

          results.push({
            id: index + 1,
            title: chunk.web.title || `Source ${index + 1}`,
            url: uri,
            domain,
            snippet: response.text ? response.text.substring(0, 300) : "",
          });
        }
      });
    }

    const uniqueResults = [];
    const seenUrls = new Set();
    for (const res of results) {
      if (res.url && !seenUrls.has(res.url)) {
        seenUrls.add(res.url);
        uniqueResults.push(res);
      }
    }

    const success = uniqueResults.length > 0 || Boolean(candidate?.groundingMetadata);

    return {
      results: uniqueResults,
      summary: response.text || "",
      provider: "google_search_grounding",
      success,
      errorCategory: success ? null : "search_failure",
      error: success ? null : "No grounding sources were retrieved from web search.",
    };
  } catch (err) {
    console.error("[AURA Web Search Error]:", err);
    const category = categorizeError(err);
    const sanitizedMsg = sanitizeString(err.message || "Web search execution failed.");
    return {
      results: [],
      summary: "",
      error: sanitizedMsg,
      status: err.status || err.statusCode || null,
      provider: "google_search_grounding",
      errorCategory: category,
      retryAfter: err.retryAfter || (err.headers && typeof err.headers.get === "function" ? err.headers.get("retry-after") : null),
      success: false,
    };
  }
}
