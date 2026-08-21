import { GoogleGenAI } from "@google/genai";
import { AURA_SYSTEM_INSTRUCTION } from "./personality.js";

const MAX_HISTORY_MESSAGES = 12;

/**
 * Maps incoming frontend chat history to Gemini's content object array format.
 */
function buildGeminiContents(messages, currentMessage) {
  const contents = [];

  if (Array.isArray(messages) && messages.length > 0) {
    // Keep only the most recent N messages to maintain relevant context within limits
    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

    for (const msg of recentMessages) {
      if (!msg || !msg.text) continue;
      const role = msg.sender === "user" ? "user" : "model";
      const text = msg.text.trim();
      if (!text) continue;

      // Avoid consecutive duplicate roles if any, or append to last turn
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

  // Ensure current message is included as the final turn if not already appended
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
 * Format errors cleanly so sensitive stack traces or raw API keys are never leaked to client.
 */
function formatAuraError(err) {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
  }

  try {
    const { message, messages } = req.body || {};

    let userPrompt = "";
    if (typeof message === "string") {
      userPrompt = message.trim();
    }

    const contents = buildGeminiContents(messages, userPrompt);

    if (!contents || contents.length === 0) {
      return res.status(400).json({ error: "No message provided in request body." });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Request response from Gemini with AURA system instruction and conversation context
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: AURA_SYSTEM_INSTRUCTION,
      },
    });

    const replyText = response.text?.trim() || "I'm sorry, I couldn't generate a response at this time.";

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("Error in /api/chat handler (AURA Intelligence Core):", err);
    const auraErrorMessage = formatAuraError(err);
    return res.status(500).json({
      error: auraErrorMessage,
    });
  }
}
