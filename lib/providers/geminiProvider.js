import { GoogleGenAI } from "@google/genai";
import { BaseProvider } from "./baseProvider.js";
import { PROVIDER_CONFIGS } from "../core/config.js";

export class GeminiProvider extends BaseProvider {
  constructor() {
    super("gemini");
  }

  isConfigured() {
    return Boolean(process.env[PROVIDER_CONFIGS.gemini.envKey]);
  }

  async generateResponse({ contents, systemInstruction, model = PROVIDER_CONFIGS.gemini.defaultModel }) {
    const apiKey = process.env[PROVIDER_CONFIGS.gemini.envKey];
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text?.trim() || "I'm sorry, I couldn't generate a response at this time.";
    return { reply: replyText };
  }
}
