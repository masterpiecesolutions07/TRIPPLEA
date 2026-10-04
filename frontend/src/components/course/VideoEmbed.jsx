import { describeVideo } from "../../utils/videoEmbed.js";

export function VideoEmbed({ url, title }) {
  const video = describeVideo(url);
  if (video.state !== "ready") return null;
  if (video.provider === "cloudinary") {
    return <video className="video-frame" src={video.embedUrl} controls playsInline />;
  }
  return (
    <iframe
      className="video-frame"
      src={video.embedUrl}
      title={title || "Lesson video"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  );
}
