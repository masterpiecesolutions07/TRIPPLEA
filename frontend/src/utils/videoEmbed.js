const VIDEO_HINT = "Use a YouTube, Vimeo, Google Drive, or Cloudinary video link.";

const LABELS = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  drive: "Google Drive",
  cloudinary: "Cloudinary"
};

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
    return { id: parts[parts.indexOf("video") + 1] || "", hash: url.searchParams.get("h") || "" };
  }
  if (host !== "vimeo.com") return { id: "", hash: "" };
  const id = parts.find((part) => /^\d{6,12}$/.test(part)) || "";
  return { id, hash: parts[parts.indexOf(id) + 1] || "" };
}

export function describeVideo(raw) {
  const input = String(raw || "").trim();
  if (!input) return { state: "empty" };
  let url;
  try {
    url = new URL(input);
  } catch {
    return { state: "invalid", message: VIDEO_HINT };
  }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname.includes("..")) {
    return { state: "invalid", message: VIDEO_HINT };
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const id = youtubeId(url);
    if (!/^[\w-]{11}$/.test(id)) return { state: "invalid", message: VIDEO_HINT };
    return { state: "ready", provider: "youtube", label: LABELS.youtube, embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, watchUrl: `https://www.youtube.com/watch?v=${id}` };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const { id, hash } = vimeoParts(url);
    const privacy = /^[a-zA-Z0-9]{4,32}$/.test(hash) ? hash : "";
    if (!/^\d{6,12}$/.test(id)) return { state: "invalid", message: VIDEO_HINT };
    const embedUrl = privacy ? `https://player.vimeo.com/video/${id}?h=${privacy}` : `https://player.vimeo.com/video/${id}`;
    return { state: "ready", provider: "vimeo", label: LABELS.vimeo, embedUrl };
  }

  if (host === "drive.google.com") {
    const fromPath = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const id = fromPath?.[1] || url.searchParams.get("id") || "";
    if (!/^[a-zA-Z0-9_-]{10,80}$/.test(id)) return { state: "invalid", message: VIDEO_HINT };
    return { state: "ready", provider: "drive", label: LABELS.drive, embedUrl: `https://drive.google.com/file/d/${id}/preview` };
  }

  if (host === "res.cloudinary.com" && /^\/[^/]+\/video\/upload\/[^/].+/.test(url.pathname)) {
    return { state: "ready", provider: "cloudinary", label: LABELS.cloudinary, embedUrl: `https://res.cloudinary.com${url.pathname}` };
  }

  return { state: "invalid", message: VIDEO_HINT };
}
