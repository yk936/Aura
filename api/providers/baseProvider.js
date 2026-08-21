/**
 * Base Provider Adapter Interface
 */

export class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Returns whether the required environment configuration/API key is present
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }

  /**
   * Generate content response from provider
   * @param {object} options
   * @param {Array} options.contents - Processed conversation contents array
   * @param {string} options.systemInstruction - System instruction string
   * @param {string} options.model - Model identifier
   * @returns {Promise<{ reply: string }>}
   */
  async generateResponse({ contents, systemInstruction, model }) {
    throw new Error(`generateResponse not implemented for provider '${this.name}'`);
  }
}
