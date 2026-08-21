/**
 * Source Processing & Web Content Fetcher Layer
 * Extracts clean factual evidence while treating untrusted external webpage content safely.
 */

/**
 * Clean HTML and extract text content safely
 * Strips script tags, style tags, and dangerous prompt injection attempts
 * @param {string} htmlContent
 * @returns {string} Cleaned plain text
 */
export function sanitizeWebpageText(htmlContent = "") {
  if (!htmlContent || typeof htmlContent !== "string") return "";

  // Strip script and style elements
  let cleaned = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Strip HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Neutralize common prompt injection patterns inside untrusted web content
  cleaned = cleaned.replace(/ignore\s+previous\s+instructions/gi, "[Filtered Prompt Injection]");
  cleaned = cleaned.replace(/system\s+prompt/gi, "[Filtered Pattern]");
  cleaned = cleaned.replace(/reveal\s+api\s+key/gi, "[Filtered Pattern]");

  return cleaned.substring(0, 2000); // Limit snippet size for prompt efficiency
}

/**
 * Process and sanitize a list of search result items
 * @param {Array} searchResults
 * @returns {Array} Processed evidence items
 */
export function processSourceEvidence(searchResults = []) {
  if (!Array.isArray(searchResults)) return [];

  return searchResults.map((item, idx) => {
    const cleanSnippet = sanitizeWebpageText(item.snippet || item.title || "");
    return {
      id: item.id || idx + 1,
      title: item.title || "External Source",
      url: item.url || "",
      domain: item.domain || "web",
      snippet: cleanSnippet,
    };
  });
}
