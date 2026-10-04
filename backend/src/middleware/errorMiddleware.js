const TECHNICAL = /\b(api|mongodb|mongo\b|jwt|token|zod|e11000|objectid|cast to|stack|expected |invalid input|too small|too big)\b/i;

export function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const raw = typeof error.message === "string" ? error.message : "";
  const message = statusCode === 500 || !raw || TECHNICAL.test(raw)
    ? "Something went wrong. Please try again."
    : raw;
  if (statusCode === 500) console.error(error);
  res.status(statusCode).json({ message });
}
