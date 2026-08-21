/**
 * AURA Tool/Action Layer Architecture (Future Capabilities)
 *
 * This module establishes the registry and interface for future tool integrations
 * such as web search, weather, calculator, file operations, calendar, PC/Phone controls.
 */

export const registeredTools = [];

/**
 * Execute a tool call request
 * @param {string} toolName
 * @param {object} args
 */
export async function executeTool(toolName, args = {}) {
  const tool = registeredTools.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool '${toolName}' is not registered in AURA Tool System.`);
  }
  return await tool.execute(args);
}

/**
 * Register a new tool definition into AURA
 * @param {object} toolDef - Tool definition containing name, description, parameters, and execute function
 */
export function registerTool(toolDef) {
  if (!toolDef || !toolDef.name || typeof toolDef.execute !== "function") {
    throw new Error("Invalid tool definition. Must include name and execute function.");
  }
  registeredTools.push(toolDef);
}
