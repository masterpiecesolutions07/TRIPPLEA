function strip(value) {
  if (Array.isArray(value)) return value.map(strip);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("$") && !key.includes("."))
        .map(([key, item]) => [key, strip(item)])
    );
  }
  return value;
}

export function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === "object") req.body = strip(req.body);
  next();
}
