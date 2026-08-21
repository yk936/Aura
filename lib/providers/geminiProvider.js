import { GoogleGenAI } from "@google/genai";
import { BaseProvider } from "./baseProvider.js";
import { PROVIDER_CONFIGS } from "../core/config.js";
import { formatCitations } from "../tools/citation.js";

export class GeminiProvider extends BaseProvider {
  constructor() {
    super("gemini");
  }

  isConfigured() {
    return Boolean(process.env[PROVIDER_CONFIGS.gemini.envKey]);
  }

  async generateResponse({ contents, systemInstruction, model = PROVIDER_CONFIGS.gemini.defaultModel, enableSearch = false }) {
    const apiKey = process.env[PROVIDER_CONFIGS.gemini.envKey];
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const config = {
      systemInstruction,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    const extractedSources = [];
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

          extractedSources.push({
            id: index + 1,
            title: chunk.web.title || `Source ${index + 1}`,
            url: uri,
            domain,
          });
        }
      });
    }

    // Deduplicate extracted sources
    const uniqueSources = [];
    const seenUrls = new Set();
    for (const src of extractedSources) {
      if (src.url && !seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        uniqueSources.push(src);
      }
    }

    const citationsMarkdown = formatCitations(uniqueSources);
    let replyText = response.text?.trim() || "";

    if (replyText && citationsMarkdown && !replyText.includes("### Sources & References")) {
      replyText += citationsMarkdown;
    }

    return {
      reply: replyText,
      groundingSources: uniqueSources,
      searchPerformed: enableSearch,
      searchSuccess: uniqueSources.length > 0 || (Boolean(candidate?.groundingMetadata) && enableSearch),
    };
  }
}
