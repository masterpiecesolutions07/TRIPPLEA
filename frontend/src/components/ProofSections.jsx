import { useEffect, useState } from "react";
import api from "../api/axiosInstance.js";
import { Icon } from "./Icon.jsx";

const ACHIEVEMENT_TABS = [
  ["all", "All"],
  ["withdrawal", "Withdrawals"],
  ["milestone", "Milestones"],
  ["other", "Other"]
];

function shown(list) {
  const featured = list.filter((item) => item.featured);
  return (featured.length ? featured : list).slice(0, 9);
}

function when(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Cards({ items, onOpen }) {
  return (
    <ul className="gallery">
      {items.map((item) => (
        <li key={item._id}>
          <button className="proof-card" type="button" onClick={() => onOpen(item)}>
            {item.image?.url ? <img src={item.image.url} alt="" loading="lazy" /> : null}
            <strong>{item.title}</strong>
            {item.studentDisplayName ? <span className="note">{item.studentDisplayName}</span> : null}
            <span className="note">{[when(item.date), item.amount].filter(Boolean).join(" · ")}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ProofSections() {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/public/certificates")
      .then((response) => setItems(response.data.items || []))
      .catch(() => setFailed(true));
  }, []);

  const passed = shown((items || []).filter((item) => item.category === "passed_account"));
  const achievements = (items || []).filter((item) => item.category !== "passed_account");
  const visibleAchievements = shown(tab === "all" ? achievements : achievements.filter((item) => item.category === tab));

  return (
    <>
      <section className="section" aria-labelledby="passed-title">
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Proof</p>
            <h2 id="passed-title">Passed accounts</h2>
            <p className="lede">Challenge and funded-account certificates Tripple A has published. A certificate here is a record, not a promise that the next student will pass.</p>
          </header>
          {failed ? <p className="note">The certificate list is not available right now.</p> : null}
          {!failed && items && passed.length === 0 ? <p className="note">Passed-account certificates show here after they are published.</p> : null}
          {passed.length ? <Cards items={passed} onOpen={setOpen} /> : null}
        </div>
      </section>
      <section className="section" aria-labelledby="achievements-title">
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Proof</p>
            <h2 id="achievements-title">Achievements</h2>
            <p className="lede">Withdrawal certificates and milestones. Names appear only when the student has given consent.</p>
          </header>
          <div className="proof-tabs" role="group" aria-label="Achievement categories">
            {ACHIEVEMENT_TABS.map(([value, label]) => (
              <button key={value} className="btn btn--ghost" type="button" aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</button>
            ))}
          </div>
          {failed ? <p className="note">The certificate list is not available right now.</p> : null}
          {!failed && items && visibleAchievements.length === 0 ? <p className="note">Withdrawal certificates and milestones show here after they are published.</p> : null}
          {visibleAchievements.length ? <Cards items={visibleAchievements} onOpen={setOpen} /> : null}
        </div>
      </section>
      {open ? (
        <dialog className="modal" open aria-labelledby="proof-title">
          <div className="modal__card">
            <div className="modal__top">
              <h2 id="proof-title">{open.title}</h2>
              <button className="icon-btn" type="button" aria-label="Close" onClick={() => setOpen(null)}><Icon name="i-close" /></button>
            </div>
            {open.image?.url ? <img className="proof-shot" src={open.image.url} alt="" /> : null}
            {open.studentDisplayName ? <p>{open.studentDisplayName}</p> : null}
            {open.description ? <p>{open.description}</p> : null}
            <p className="note">{[when(open.date), open.amount].filter(Boolean).join(" · ")}</p>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
