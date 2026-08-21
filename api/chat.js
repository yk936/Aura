import { GoogleGenAI } from "@google/genai";

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

    if (typeof message === "string" && message.trim().length > 0) {
      userPrompt = message.trim();
    } else if (Array.isArray(messages) && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
      userPrompt = lastUserMsg ? lastUserMsg.text : messages[messages.length - 1].text;
    }

    if (!userPrompt) {
      return res.status(400).json({ error: "No message provided in request body." });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Using gemini-3.6-flash model
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response at this time.";

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("Error in /api/chat handler (Gemini API):", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred while communicating with Gemini API.",
    });
  }
}
