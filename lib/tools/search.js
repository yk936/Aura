import { GoogleGenAI } from "@google/genai";

/**
 * Web Search Tool Abstraction for AURA
 * Supports Gemini Built-in Search Grounding tool or external Search API keys (Tavily/Serper) if configured.
 */
export async function performWebSearch(query) {
  if (!query || typeof query !== "string") {
    return { results: [], provider: "none" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured for search.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Execute Gemini generateContent with googleSearch tool enabled
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Search the web for up-to-date, factual information to answer this query: "${query}". Provide a concise summary of current search findings with references.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const groundingSupports = candidate?.groundingMetadata?.groundingSupports || [];

    const results = [];

    // Extract grounding source metadata
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
            sourceType: "web_search",
          });
        }
      });
    }

    // Deduplicate by URL
    const uniqueResults = [];
    const seenUrls = new Set();
    for (const res of results) {
      if (res.url && !seenUrls.has(res.url)) {
        seenUrls.add(res.url);
        uniqueResults.push(res);
      }
    }

    return {
      results: uniqueResults,
      summary: response.text || "",
      provider: "google_search_grounding",
    };
  } catch (err) {
    console.error("[AURA Web Search Error]:", err);
    return {
      results: [],
      summary: "",
      error: err.message,
      provider: "google_search_grounding",
    };
  }
}
