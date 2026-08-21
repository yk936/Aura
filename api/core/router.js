import { DEFAULT_PROVIDER, DEFAULT_MODEL, PROVIDER_CONFIGS } from "./config.js";
import { getProvider, getConfiguredProviders } from "../providers/index.js";

/**
 * Route request to selected provider and model based on task category and available configured credentials.
 * @param {string} taskCategory
 * @returns {{ provider: import("../providers/baseProvider.js").BaseProvider, model: string, providerName: string, fallbackAvailable: boolean }}
 */
export function routeRequest(taskCategory) {
  const configured = getConfiguredProviders();

  // Try default primary provider
  let primary = getProvider(DEFAULT_PROVIDER);

  if (!primary || !primary.isConfigured()) {
    // If primary provider is not configured, check if any configured fallback provider exists
    if (configured.length > 0) {
      primary = configured[0];
    } else {
      throw new Error("No configured AI providers found.");
    }
  }

  const providerName = primary.name;
  const model = PROVIDER_CONFIGS[primary.name]?.defaultModel || DEFAULT_MODEL;
  const fallbackAvailable = configured.length > 1;

  return {
    provider: primary,
    model,
    providerName,
    taskCategory,
    fallbackAvailable,
  };
}
