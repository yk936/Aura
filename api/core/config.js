/**
 * AURA Provider & AI Core Central Configuration
 */

export const DEFAULT_PROVIDER = "gemini";
export const DEFAULT_MODEL = "gemini-3.6-flash";

export const PROVIDER_CONFIGS = {
  gemini: {
    name: "Google Gemini",
    defaultModel: "gemini-3.6-flash",
    envKey: "GEMINI_API_KEY",
  },
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o",
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    name: "Anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    envKey: "ANTHROPIC_API_KEY",
  },
};
