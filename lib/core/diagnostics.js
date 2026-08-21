/**
 * Utility for categorizing AURA errors, sanitizing sensitive strings,
 * and building safe diagnostic objects.
 */

export const ERROR_CATEGORIES = {
  RATE_LIMIT: "rate_limit",
  AUTH_FAILURE: "auth_failure",
  SEARCH_FAILURE: "search_failure",
  TIMEOUT: "timeout",
  SERVER_ERROR: "server_error",
  INVALID_REQUEST: "invalid_request",
};

/**
 * Sanitizes any raw string or message to remove potential API keys, authorization tokens, or secret headers.
 */
export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/AIzaSy[A-Za-z0-9_-]{33}/g, "[REDACTED_API_KEY]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/(key|token|secret|password|auth)=["']?[^&"'\s]+["']?/gi, "$1=[REDACTED]");
}

/**
 * Classifies an error into one of the standard AURA error categories.
 */
export function categorizeError(err) {
  const status = Number(err?.status || err?.statusCode || err?.response?.status || 0);
  const message = (err?.message || "").toLowerCase();
  const code = (err?.code || "").toString().toLowerCase();

  if (status === 429 || message.includes("429") || message.includes("rate limit") || message.includes("quota") || message.includes("resource_exhausted")) {
    return ERROR_CATEGORIES.RATE_LIMIT;
  }

  if (
    status === 401 ||
    status === 403 ||
    message.includes("401") ||
    message.includes("403") ||
    message.includes("api key") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("auth") ||
    message.includes("not configured") ||
    message.includes("no configured")
  ) {
    return ERROR_CATEGORIES.AUTH_FAILURE;
  }

  if (
    status === 408 ||
    status === 504 ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("network") ||
    code.includes("etimedout")
  ) {
    return ERROR_CATEGORIES.TIMEOUT;
  }

  if (status === 400 || message.includes("400") || message.includes("invalid argument") || message.includes("bad request") || message.includes("invalid")) {
    return ERROR_CATEGORIES.INVALID_REQUEST;
  }

  if (status >= 500 && status < 600) {
    return ERROR_CATEGORIES.SERVER_ERROR;
  }

  if (err?.isSearchFailure || message.includes("search") || message.includes("grounding")) {
    return ERROR_CATEGORIES.SEARCH_FAILURE;
  }

  return ERROR_CATEGORIES.SERVER_ERROR;
}

/**
 * Maps an error category to an appropriate HTTP status code.
 */
export function getHttpStatusForCategory(category) {
  switch (category) {
    case ERROR_CATEGORIES.RATE_LIMIT:
      return 429;
    case ERROR_CATEGORIES.AUTH_FAILURE:
      return 401;
    case ERROR_CATEGORIES.TIMEOUT:
      return 504;
    case ERROR_CATEGORIES.INVALID_REQUEST:
      return 400;
    case ERROR_CATEGORIES.SEARCH_FAILURE:
      return 502;
    case ERROR_CATEGORIES.SERVER_ERROR:
    default:
      return 500;
  }
}

/**
 * Maps an error category to a clear, distinct user-facing message.
 * Never collapses all errors into "high demand".
 */
export function getUserFacingErrorMessage(category, fallbackMsg = "") {
  const msgLower = (fallbackMsg || "").toLowerCase();
  if (msgLower.includes("gemini_api_key") || msgLower.includes("no configured ai providers")) {
    return "Provider 'gemini' is unconfigured or unavailable. Required environment variable: GEMINI_API_KEY.";
  }

  switch (category) {
    case ERROR_CATEGORIES.RATE_LIMIT:
      return "Rate limit or quota exceeded while connecting to AI provider (HTTP 429 / Resource Exhausted). Please wait a moment.";
    case ERROR_CATEGORIES.AUTH_FAILURE:
      return "Authentication failed while connecting to AURA intelligence core. Required environment variable: GEMINI_API_KEY.";
    case ERROR_CATEGORIES.TIMEOUT:
      return "Network timeout occurred while reaching AURA services (HTTP 504). Please check connection and try again.";
    case ERROR_CATEGORIES.INVALID_REQUEST:
      return "Invalid request format or parameters sent to AURA intelligence core (HTTP 400).";
    case ERROR_CATEGORIES.SEARCH_FAILURE:
      return "Live web search failed or returned no grounding sources (HTTP 502). Unable to fulfill live web search request.";
    case ERROR_CATEGORIES.SERVER_ERROR:
    default:
      return sanitizeString(fallbackMsg) || "AURA encountered an internal service error while generating a response (HTTP 500).";
  }
}

/**
 * Extracts retry-after header or info if present.
 */
export function extractRetryAfter(err) {
  if (err?.retryAfter) return String(err.retryAfter);
  if (err?.headers && typeof err.headers.get === "function") {
    const val = err.headers.get("retry-after");
    if (val) return String(val);
  }
  if (err?.headers && err.headers["retry-after"]) {
    return String(err.headers["retry-after"]);
  }
  return null;
}

/**
 * Creates a SAFE diagnostic object guaranteed not to leak secrets.
 */
export function buildSafeDiagnostics({
  err = null,
  category = null,
  httpStatus = null,
  provider = "unknown",
  requestStage = "unknown",
  searchTriggered = false,
  searchProvider = "none",
  searchProviderCalled = false,
  searchRequestSuccess = false,
  resultCount = 0,
  searchResultsReturned = false,
  sourceRetrievalSuccess = false,
  researchContextReceivedByAI = false,
  citationsGenerated = false,
}) {
  const finalHttpStatus = httpStatus || (err ? (err.status || err.statusCode || getHttpStatusForCategory(category || categorizeError(err))) : 200);
  const finalCategory = category || (err ? categorizeError(err) : (finalHttpStatus === 200 ? null : ERROR_CATEGORIES.SERVER_ERROR));
  const retryAfter = err ? extractRetryAfter(err) : null;

  return {
    httpStatus: Number(finalHttpStatus) || 500,
    provider: sanitizeString(provider),
    errorCategory: finalCategory,
    retryAfter: retryAfter ? sanitizeString(retryAfter) : null,
    requestStage: sanitizeString(requestStage),
    searchTriggered: Boolean(searchTriggered),
    searchProvider: sanitizeString(searchProvider),
    searchProviderCalled: Boolean(searchProviderCalled),
    searchRequestSuccess: Boolean(searchRequestSuccess),
    resultCount: Number(resultCount) || 0,
    searchResultsReturned: Boolean(searchResultsReturned),
    sourceRetrievalSuccess: Boolean(sourceRetrievalSuccess || searchResultsReturned),
    researchContextReceivedByAI: Boolean(researchContextReceivedByAI),
    citationsGenerated: Boolean(citationsGenerated),
  };
}
