import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError } from "./ApiError.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function saveImage(dataUrl, folder) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl || ""));
  if (!match) throw new ApiError(400, "Choose a JPG or PNG photo.");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 2 * 1024 * 1024) throw new ApiError(400, "That photo is too large. Choose one under 2 MB.");
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${TYPES[match[1]]}`;
  const dir = path.join(root, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${folder}/${name}`;
}
