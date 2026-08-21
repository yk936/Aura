import { executeAuraPipeline } from "../lib/core/pipeline.js";
import { buildSafeDiagnostics, sanitizeString } from "../lib/core/diagnostics.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    const diagnostics = buildSafeDiagnostics({
      httpStatus: 405,
      provider: "none",
      category: "invalid_request",
      requestStage: "http_method_check",
    });
    return res.status(405).json({
      error: "Method not allowed. Use POST.",
      diagnostics,
    });
  }

  try {
    const { message, messages } = req.body || {};

    const result = await executeAuraPipeline({ message, messages });

    return res.status(200).json({
      reply: result.reply,
      metadata: result.metadata,
    });
  } catch (err) {
    const auraDiagnostics = err?.diagnostics || buildSafeDiagnostics({
      err,
      provider: "gemini",
      requestStage: "api_handler_catch",
    });

    const statusCode = auraDiagnostics.httpStatus || (err?.isHandledAuraError ? 500 : 400);
    const errorMessage = sanitizeString(err?.message) || "An unexpected error occurred while communicating with AURA services.";

    return res.status(statusCode).json({
      error: errorMessage,
      diagnostics: auraDiagnostics,
    });
  }
}
