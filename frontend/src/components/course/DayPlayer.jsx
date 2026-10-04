import { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { describeVideo } from "../../utils/videoEmbed.js";
import { VideoEmbed } from "./VideoEmbed.jsx";

function watchOnYouTube(day) {
  const video = describeVideo(day?.videoUrl || day?.embedUrl || "");
  if (video.provider !== "youtube") return "";
  return video.watchUrl || "";
}

export function DayPlayer({ phase, dayId, onSelect, backTo, onBack, canEdit = false, onSave, busy = false }) {
  const days = phase?.modules || [];
  const current = days.find((item) => item._id === dayId) || days[0] || null;
  const index = current ? days.findIndex((item) => item._id === current._id) : -1;
  const next = index >= 0 ? days[index + 1] : null;
  const finished = days.filter((item) => item.completed).length;
  const percent = days.length ? Math.round((finished / days.length) * 100) : 0;
  const [openForm, setOpenForm] = useState(false);
  const [title, setTitle] = useState(current?.title || "");
  const [videoUrl, setVideoUrl] = useState(current?.videoUrl || "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setTitle(current?.title || "");
    setVideoUrl(current?.videoUrl || "");
    setOpenForm(false);
    setFormError("");
  }, [current?._id, current?.title, current?.videoUrl]);

  if (!current) {
    return (
      <section className="player">
        <header className="player__bar">
          {onBack ? <button type="button" onClick={onBack} aria-label="Back"><ArrowLeftIcon aria-hidden="true" /></button> : null}
          <h1>{phase?.title || "Course"}</h1>
        </header>
        <p className="note">No days in this phase yet.</p>
      </section>
    );
  }

  const hasVideo = Boolean(current.embedUrl);
  const youtube = watchOnYouTube(current);

  function submit(event) {
    event.preventDefault();
    const video = describeVideo(videoUrl);
    if (video.state === "invalid") {
      setFormError(video.message);
      return;
    }
    setFormError("");
    onSave?.(current, { title: title.trim(), videoUrl: videoUrl.trim() });
    setOpenForm(false);
  }

  return (
    <section className="player">
      <header className="player__bar">
        {onBack ? <button type="button" onClick={onBack} aria-label="Back"><ArrowLeftIcon aria-hidden="true" /></button> : backTo ? <Link to={backTo} state={{ open: true }} aria-label="Back"><ArrowLeftIcon aria-hidden="true" /></Link> : null}
        <h1>{current?.title || phase?.title || "Course"}</h1>
      </header>
      <div className="player__body">
        <aside className="player__side">
          <p className="player__percent">{percent}% completed</p>
          <div className="player__meter" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
          <ol className="player__days">
            {days.map((item) => (
              <li key={item._id}>
                <button
                  className={item._id === current?._id ? "is-current" : ""}
                  type="button"
                  onClick={() => onSelect(item._id)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.embedUrl ? "Video" : (canEdit ? "Add link or update content" : "No video yet")}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
        <div className="player__stage">
          {hasVideo && !openForm ? (
            <>
              <VideoEmbed url={current.embedUrl} title={current.title} />
              <div className="player__links">
                {youtube ? <a href={youtube} target="_blank" rel="noreferrer">Watch on YouTube</a> : null}
                {canEdit ? <button type="button" onClick={() => setOpenForm(true)}>Update content</button> : null}
              </div>
            </>
          ) : canEdit ? (
            <form className="player__form" onSubmit={submit}>
              <h2>{hasVideo ? "Update content" : "Add link or update content"}</h2>
              {formError ? <p className="form-summary">{formError}</p> : null}
              <div className="field">
                <label htmlFor="day-concept">Concept</label>
                <input id="day-concept" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="day-video">Video link</label>
                <input id="day-video" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Paste the video link for this day" />
              </div>
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </form>
          ) : (
            <p className="player__empty">No video for this day yet.</p>
          )}
          {next ? (
            <button className="player__next" type="button" onClick={() => onSelect(next._id)}>Next <ArrowRightIcon aria-hidden="true" /></button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
