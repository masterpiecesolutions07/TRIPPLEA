import { ApiError } from "./ApiError.js";

const VIDEO_HINT = "Use a YouTube, Vimeo, Google Drive, or Cloudinary video link.";
const LINK_HINT = "Use a full link that starts with https.";

function httpsUrl(raw, hint) {
  let url;
  try {
    url = new URL(String(raw || "").trim());
  } catch {
    throw new ApiError(400, hint);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname.includes("..")) {
    throw new ApiError(400, hint);
  }
  return url;
}

function youtubeId(url) {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") return (url.pathname.split("/").filter(Boolean)[0] || "").slice(0, 11);
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") return "";
  if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/")) {
    return (url.pathname.split("/")[2] || "").slice(0, 11);
  }
  return (url.searchParams.get("v") || "").slice(0, 11);
}

function vimeoParts(url) {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "player.vimeo.com") {
    const id = parts[parts.indexOf("video") + 1] || "";
    return { id, hash: url.searchParams.get("h") || "" };
  }
  if (host !== "vimeo.com") return { id: "", hash: "" };
  const id = parts.find((part) => /^\d{6,12}$/.test(part)) || "";
  const hash = parts[parts.indexOf(id) + 1] || "";
  return { id, hash };
}

export function parseVideoLink(raw) {
  const input = String(raw || "").trim();
  if (!input) return { videoUrl: "", embedUrl: "", provider: "" };
  const url = httpsUrl(input, VIDEO_HINT);
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const id = youtubeId(url);
    if (!/^[\w-]{11}$/.test(id)) throw new ApiError(400, VIDEO_HINT);
    return {
      videoUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      provider: "youtube"
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const { id, hash } = vimeoParts(url);
    const privacy = /^[a-zA-Z0-9]{4,32}$/.test(hash) ? hash : "";
    if (!/^\d{6,12}$/.test(id)) throw new ApiError(400, VIDEO_HINT);
    return {
      videoUrl: privacy ? `https://vimeo.com/${id}/${privacy}` : `https://vimeo.com/${id}`,
      embedUrl: privacy ? `https://player.vimeo.com/video/${id}?h=${privacy}` : `https://player.vimeo.com/video/${id}`,
      provider: "vimeo"
    };
  }

  if (host === "drive.google.com") {
    const fromPath = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const id = fromPath?.[1] || url.searchParams.get("id") || "";
    if (!/^[a-zA-Z0-9_-]{10,80}$/.test(id)) throw new ApiError(400, VIDEO_HINT);
    return {
      videoUrl: `https://drive.google.com/file/d/${id}/view`,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      provider: "drive"
    };
  }

  if (host === "res.cloudinary.com" && /^\/[^/]+\/video\/upload\/[^/].+/.test(url.pathname)) {
    const clean = `https://res.cloudinary.com${url.pathname}`;
    return { videoUrl: clean, embedUrl: clean, provider: "cloudinary" };
  }

  throw new ApiError(400, VIDEO_HINT);
}

function storedImage(url) {
  if (/^\/uploads\/course\/[A-Za-z0-9._-]+$/.test(url)) return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return "";
  if (!/^\/[^/]+\/image\/upload\/.+/.test(parsed.pathname)) return "";
  return parsed.toString();
}

export function safeResource(resource) {
  const title = String(resource?.title || "").trim();
  if (resource?.kind === "file") {
    const url = storedImage(String(resource.url || "").trim());
    if (!url) throw new ApiError(400, "Choose a JPG or PNG photo.");
    return { title, kind: "file", url };
  }
  const url = httpsUrl(resource?.url, LINK_HINT);
  const stored = url.toString();
  if (stored.length > 500) throw new ApiError(400, "That link is too long.");
  return { title, kind: "link", url: stored };
}

export function safeCover(value) {
  const raw = String(value || "").trim();
  if (!raw) return { url: "", publicId: "" };
  const url = storedImage(raw);
  if (!url) throw new ApiError(400, "Choose a JPG or PNG photo.");
  return { url, publicId: url };
}
