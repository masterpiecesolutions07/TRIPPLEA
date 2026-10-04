import { useEffect, useState } from "react";
import { getFaqs, saveFaqs } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

function blankFaq() {
  return { id: `faq-${Date.now().toString(36)}`, question: "", answer: "" };
}

export function FaqsPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getFaqs().then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load the questions. Please try again.")));
  }, []);

  function change(id, field, value) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function remove(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    const payload = items.map((item) => ({
      id: item.id,
      question: item.question.trim(),
      answer: item.answer.trim()
    }));
    if (payload.some((item) => item.question.length < 4 || item.answer.length < 8)) {
      setError("Each question needs a short title and an answer.");
      return;
    }
    setBusy(true);
    try {
      setItems(await saveFaqs(payload));
      setSaved("Questions saved. They are live on the site.");
    } catch (err) {
      setError(feedbackMessage(err, "Could not save the questions. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (!items) return <p>{error || "Loading questions…"}</p>;

  return (
    <>
      <h1>Questions</h1>
      <p className="note">These appear on the landing page and the programme page. Add one, edit the wording, or remove one, then save.</p>
      <form className="dash-form" onSubmit={submit}>
        {error ? <p className="form-summary">{error}</p> : null}
        <SaveAlert message={saved} />
        {items.length === 0 ? <p className="note">No questions. Add one, or save an empty list to clear the public page.</p> : null}
        {items.map((item, index) => (
          <fieldset className="panel" key={item.id} style={{ display: "grid", gap: "0.7rem", marginBottom: "0.8rem" }}>
            <legend className="note">Question {index + 1}</legend>
            <div className="field">
              <label htmlFor={`${item.id}-q`}>Question</label>
              <input id={`${item.id}-q`} value={item.question} onChange={(event) => change(item.id, "question", event.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor={`${item.id}-a`}>Answer</label>
              <textarea id={`${item.id}-a`} rows={4} value={item.answer} onChange={(event) => change(item.id, "answer", event.target.value)} required />
            </div>
            <button className="btn btn--ghost" type="button" onClick={() => remove(item.id)}>Remove</button>
          </fieldset>
        ))}
        <div className="cluster">
          <button className="btn btn--ghost" type="button" onClick={() => setItems((current) => [...current, blankFaq()])}>Add a question</button>
          <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save questions"}</button>
        </div>
      </form>
    </>
  );
}
