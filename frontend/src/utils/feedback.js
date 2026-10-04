const TECHNICAL = /\b(api|mongodb|mongo\b|backend|jwt|status code|network error|econn|axios|zod|objectid|e11000|expected |invalid input|too small|too big)\b/i;

export function feedbackMessage(error, fallback) {
  const fromServer = error?.response?.data?.message;
  if (typeof fromServer === "string" && fromServer.trim() && !TECHNICAL.test(fromServer)) {
    return fromServer.trim();
  }
  const local = error?.message;
  if (typeof local === "string" && local.trim() && !TECHNICAL.test(local) && !local.startsWith("Request failed")) {
    return local.trim();
  }
  return fallback;
}
