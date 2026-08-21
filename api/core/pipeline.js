import { classifyTask } from "./classifier.js";
import { routeRequest } from "./router.js";
import { AURA_SYSTEM_INSTRUCTION } from "../personality.js";

const MAX_HISTORY_MESSAGES = 12;

/**
 * Format conversation history into contents array for AI Providers
 */
function buildConversationContents(messages, currentMessage) {
  const contents = [];

  if (Array.isArray(messages) && messages.length > 0) {
    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

    for (const msg of recentMessages) {
      if (!msg || !msg.text) continue;
      const role = msg.sender === "user" ? "user" : "model";
      const text = msg.text.trim();
      if (!text) continue;

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${text}`;
      } else {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    }
  }

  if (currentMessage && currentMessage.trim()) {
    const trimmedMessage = currentMessage.trim();
    if (
      contents.length === 0 ||
      contents[contents.length - 1].role !== "user" ||
      !contents[contents.length - 1].parts[0].text.endsWith(trimmedMessage)
    ) {
      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents[contents.length - 1].parts[0].text += `\n${trimmedMessage}`;
      } else {
        contents.push({
          role: "user",
          parts: [{ text: trimmedMessage }],
        });
      }
    }
  }

  return contents;
}

/**
 * Sanitizes errors to ensure secrets or sensitive stack traces are never sent to the client.
 */
function sanitizeAuraError(err) {
  const message = err?.message || "";

  if (message.includes("429") || message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("quota")) {
    return "AURA is experiencing high demand right now. Please wait a moment and try again.";
  }
  if (message.includes("401") || message.includes("403") || message.toLowerCase().includes("api key") || message.toLowerCase().includes("auth")) {
    return "Authentication issue encountered while connecting to AURA intelligence core.";
  }
  if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("network") || message.toLowerCase().includes("econnreset")) {
    return "Network timeout occurred while reaching AURA services. Please check your connection.";
  }

  return "AURA encountered an issue generating a response. Please try sending your message again.";
}

/**
 * Executes the full AURA Response Pipeline
 * User Input -> Context -> Instructions -> Classifier -> Router -> Provider -> Response & Metadata
 */
export async function executeAuraPipeline({ message, messages }) {
  const startTime = Date.now();

  let userPrompt = "";
  if (typeof message === "string") {
    userPrompt = message.trim();
  }

  const contents = buildConversationContents(messages, userPrompt);
  if (!contents || contents.length === 0) {
    throw new Error("No message provided in request body.");
  }

  // 1. Task Classification
  const taskCategory = classifyTask(userPrompt);

  // 2. Model Router Selection
  const route = routeRequest(taskCategory);

  try {
    // 3. Provider Execution
    const response = await route.provider.generateResponse({
      contents,
      systemInstruction: AURA_SYSTEM_INSTRUCTION,
      model: route.model,
    });

    const latencyMs = Date.now() - startTime;

    // Return result along with safe metadata
    return {
      reply: response.reply,
      metadata: {
        provider: route.providerName,
        model: route.model,
        taskCategory,
        latencyMs,
      },
    };
  } catch (err) {
    console.error(`[AURA Pipeline Error] Provider: ${route.providerName}, Task: ${taskCategory}`, err);
    const auraError = sanitizeAuraError(err);
    const errorObj = new Error(auraError);
    errorObj.isHandledAuraError = true;
    throw errorObj;
  }
}
