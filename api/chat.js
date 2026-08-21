import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY environment variable is not configured." });
  }

  try {
    const { message, messages } = req.body || {};

    let formattedInput = [];

    if (Array.isArray(messages) && messages.length > 0) {
      formattedInput = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text || "",
      }));
    } else if (typeof message === "string" && message.trim().length > 0) {
      formattedInput = [{ role: "user", content: message.trim() }];
    } else {
      return res.status(400).json({ error: "No message or messages provided in request body." });
    }

    const openai = new OpenAI({ apiKey });

    let replyText = "";

    if (openai.responses && typeof openai.responses.create === "function") {
      try {
        const response = await openai.responses.create({
          model: "gpt-4o-mini",
          input: formattedInput,
        });

        if (response.output_text) {
          replyText = response.output_text;
        } else if (Array.isArray(response.output) && response.output.length > 0) {
          const textItem = response.output.find((item) => item.type === "message" || item.text);
          if (textItem && textItem.content) {
            replyText = typeof textItem.content === "string" ? textItem.content : JSON.stringify(textItem.content);
          } else if (textItem && textItem.text) {
            replyText = textItem.text;
          }
        }
      } catch (responsesErr) {
        console.warn("Responses API error, falling back to Chat Completions API:", responsesErr.message);
      }
    }

    if (!replyText) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedInput,
      });
      replyText = completion.choices[0]?.message?.content || "";
    }

    if (!replyText) {
      replyText = "I'm sorry, I couldn't generate a response at this time.";
    }

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("Error in /api/chat handler:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred while communicating with OpenAI.",
    });
  }
}
