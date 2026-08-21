import { GeminiProvider } from "./geminiProvider.js";

const providersRegistry = {
  gemini: new GeminiProvider(),
};

/**
 * Get provider instance by name
 * @param {string} providerName
 * @returns {import("./baseProvider.js").BaseProvider | null}
 */
export function getProvider(providerName) {
  return providersRegistry[providerName] || null;
}

/**
 * Get list of all currently configured and available providers
 * @returns {Array<import("./baseProvider.js").BaseProvider>}
 */
export function getConfiguredProviders() {
  return Object.values(providersRegistry).filter((p) => p.isConfigured());
}
