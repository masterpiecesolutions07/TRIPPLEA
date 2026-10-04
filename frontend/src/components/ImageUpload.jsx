import { useState } from "react";
import { feedbackMessage } from "../utils/feedback.js";
import { readImageFile } from "../utils/readImageFile.js";

export function ImageUpload({ label, onFile, showPreview = true }) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function change(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const image = await readImageFile(file);
      setPreview(image);
      await onFile(image);
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that photo. Try a smaller JPG or PNG."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-upload">
      {showPreview && preview ? <img src={preview} alt="" /> : null}
      <label className="btn btn--primary file-btn">
        {busy ? "Saving…" : label}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={change} disabled={busy} />
      </label>
      {error ? <p className="form-summary">{error}</p> : null}
    </div>
  );
}
