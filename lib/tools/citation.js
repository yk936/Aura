/**
 * Citation Formatting Engine for AURA
 */

/**
 * Formats citations array into clean Markdown list
 * @param {Array<{ title: string, url: string, domain: string }>} sources
 * @returns {string} Formatted markdown citations block
 */
export function formatCitations(sources = []) {
  if (!Array.isArray(sources) || sources.length === 0) return "";

  const uniqueSources = [];
  const seenUrls = new Set();

  for (const src of sources) {
    if (src.url && !seenUrls.has(src.url)) {
      seenUrls.add(src.url);
      uniqueSources.push(src);
    }
  }

  if (uniqueSources.length === 0) return "";

  let markdown = "\n\n### Sources & References\n";
  uniqueSources.forEach((src, idx) => {
    const title = src.title || src.domain || `Source ${idx + 1}`;
    markdown += `${idx + 1}. [${title}](${src.url}) - *${src.domain || "web"}*\n`;
  });

  return markdown;
}
