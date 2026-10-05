import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const REFRESH_COOKIE = "tripplea_refresh";

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.accessExpires
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: String(user._id) }, env.jwtRefreshSecret, {
    expiresIn: env.refreshExpires
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export function refreshCookieOptions(remember) {
  const maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const crossSite = env.nodeEnv === "production" || String(env.publicUrl).startsWith("https://");
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? "none" : "lax",
    path: "/api/v1/auth",
    maxAge
  };
}
