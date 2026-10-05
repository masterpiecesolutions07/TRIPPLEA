import bcrypt from "bcryptjs";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { saveImage } from "../utils/saveImage.js";
import { openApprovedEnrollments } from "../services/enrollmentService.js";
import {
  REFRESH_COOKIE,
  hashToken,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../services/tokenService.js";

const LOCK_AFTER = 5;
const LOCK_MS = 15 * 60 * 1000;

function publicAuth(user, accessToken) {
  return { accessToken, user: user.toPublic() };
}

async function storeRefresh(user, remember, res) {
  const token = signRefreshToken(user);
  const decoded = verifyRefreshToken(token);
  user.refreshTokens = (user.refreshTokens || []).filter((item) => item.expiresAt > new Date());
  user.refreshTokens.push({ tokenHash: hashToken(token), expiresAt: new Date(decoded.exp * 1000) });
  await user.save();
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions(remember));
  return token;
}

export const register = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists. Log in instead.");

  const user = await User.create({
    name: req.body.name.trim(),
    email,
    passwordHash: await bcrypt.hash(req.body.password, 12),
    role: "student"
  });
  await Application.updateMany({ email, user: null }, { $set: { user: user._id } });
  await openApprovedEnrollments(user);
  const withSecrets = await User.findById(user._id).select("+refreshTokens");
  await storeRefresh(withSecrets, true, res);
  res.status(201).json(publicAuth(withSecrets, signAccessToken(withSecrets)));
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash +refreshTokens");
  if (user?.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(423, "Too many attempts. Try again in a few minutes.");
  }
  const matches = user ? await bcrypt.compare(req.body.password, user.passwordHash) : false;
  if (!user || !matches || !user.isActive) {
    if (user) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= LOCK_AFTER) {
        user.lockUntil = new Date(Date.now() + LOCK_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
    }
    throw new ApiError(401, "Email or password does not match an account.");
  }
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  if (user.role === "student") await Application.updateMany({ email, user: null }, { $set: { user: user._id } });
  await storeRefresh(user, Boolean(req.body.remember), res);
  res.json(publicAuth(user, signAccessToken(user)));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, "Sign in again.");
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Sign in again.");
  }
  const user = await User.findById(payload.sub).select("+refreshTokens");
  const tokenHash = hashToken(token);
  const known = user?.refreshTokens?.some((item) => item.tokenHash === tokenHash && item.expiresAt > new Date());
  if (!user || !user.isActive || !known) throw new ApiError(401, "Sign in again.");
  user.refreshTokens = user.refreshTokens.filter((item) => item.tokenHash !== tokenHash);
  await storeRefresh(user, true, res);
  res.json(publicAuth(user, signAccessToken(user)));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await User.findById(payload.sub).select("+refreshTokens");
      if (user) {
        const tokenHash = hashToken(token);
        user.refreshTokens = user.refreshTokens.filter((item) => item.tokenHash !== tokenHash);
        await user.save();
      }
    } catch {
      /* Cookie is already unusable. */
    }
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  req.user.avatar = await saveImage(req.body.image, "avatars");
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+passwordHash +refreshTokens");
  if (!user) throw new ApiError(401, "Sign in again.");
  const matches = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
  if (!matches) throw new ApiError(401, "Current password does not match.");
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  user.mustChangePassword = false;
  user.refreshTokens = [];
  await storeRefresh(user, true, res);
  res.json(publicAuth(user, signAccessToken(user)));
});
