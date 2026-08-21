import { executeAuraPipeline } from "./core/pipeline.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { message, messages } = req.body || {};

    const result = await executeAuraPipeline({ message, messages });

    return res.status(200).json({
      reply: result.reply,
      metadata: result.metadata,
    });
  } catch (err) {
    const errorMessage = err?.message || "An unexpected error occurred while communicating with AURA services.";
    const statusCode = err?.isHandledAuraError ? 500 : 400;

    return res.status(statusCode).json({
      error: errorMessage,
    });
  }
}
