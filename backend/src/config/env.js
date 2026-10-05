import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

export function readEnv(source = process.env) {
  const missing = required.filter((key) => !source[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}. Copy backend/.env.example to backend/.env.`);
  }
  return {
    port: Number(source.PORT) || 5000,
    nodeEnv: source.NODE_ENV || "development",
    mongoUri: source.MONGO_URI,
    jwtAccessSecret: source.JWT_ACCESS_SECRET,
    jwtRefreshSecret: source.JWT_REFRESH_SECRET,
    accessExpires: source.ACCESS_EXPIRES || "15m",
    refreshExpires: source.REFRESH_EXPIRES || "7d",
    frontendUrl: source.FRONTEND_URL || "http://localhost:5173",
    allowedOrigins: allowedOrigins(source),
    publicUrl: publicAddress(source, Number(source.PORT) || 5000)
  };
}

function allowedOrigins(source) {
  const fromEnv = String(source.FRONTEND_URL || "")
    .split(",")
    .map((item) => item.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [...new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tripplea-1.onrender.com",
    ...fromEnv
  ])];
}

function publicAddress(source, port) {
  const configured = String(source.RENDER_EXTERNAL_URL || source.API_URL || "").trim().replace(/\/$/, "");
  if (configured) return configured;
  if (source.NODE_ENV === "production") return "";
  return `http://127.0.0.1:${port}`;
}

export const env = readEnv();
