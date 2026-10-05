import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError } from "./ApiError.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const FOLDERS = new Set(["certificates", "trades", "avatars", "course"]);

function cloudinaryConfig() {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function sign(params, secret) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(payload + secret).digest("hex");
}

async function saveLocal(buffer, type, folder) {
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${TYPES[type]}`;
  const dir = path.join(root, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return { url: `/uploads/${folder}/${name}`, publicId: "" };
}

async function saveCloudinary(dataUrl, folder, config) {
  const timestamp = Math.round(Date.now() / 1000);
  const cloudFolder = `tripplea/${folder}`;
  const params = { folder: cloudFolder, timestamp };
  const body = new FormData();
  body.append("file", dataUrl);
  body.append("api_key", config.apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", sign(params, config.apiSecret));
  body.append("folder", cloudFolder);
  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: "POST", body });
  } catch {
    throw new ApiError(400, "The photo could not be saved. Check the Cloudinary settings and try again.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.secure_url) {
    throw new ApiError(400, "The photo could not be saved. Check the Cloudinary settings and try again.");
  }
  return { url: payload.secure_url, publicId: payload.public_id || "" };
}

export async function saveImage(dataUrl, folder) {
  if (!FOLDERS.has(folder)) throw new ApiError(400, "Choose a JPG or PNG photo.");
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl || ""));
  if (!match) throw new ApiError(400, "Choose a JPG or PNG photo.");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 2 * 1024 * 1024) throw new ApiError(400, "That photo is too large. Choose one under 2 MB.");
  const config = cloudinaryConfig();
  if (!config) return saveLocal(buffer, match[1], folder);
  return saveCloudinary(dataUrl, folder, config);
}
