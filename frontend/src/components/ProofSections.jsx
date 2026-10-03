import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../api/axiosInstance.js";
import { PASSED_PLACEHOLDERS, WITHDRAWAL_PLACEHOLDERS } from "../data/proofPlaceholders.js";
import { Icon } from "./Icon.jsx";

const STAND_INS = [...PASSED_PLACEHOLDERS, ...WITHDRAWAL_PLACEHOLDERS];

export function ProofSections() {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/public/certificates")
      .then((response) => setItems(response.data.items || []))
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const live = !failed && Array.isArray(items) ? items.filter((item) => item.image?.url) : [];
  const images = live.length ? live : STAND_INS;

  return (
    <section className="section proof-marquee-section" id="achievements" aria-labelledby="progress-title">
      <div className="container">
        <header className="section__head">
          <p className="eyebrow">Proof</p>
          <h2 id="progress-title">Achievements and progress</h2>
        </header>
      </div>
      {images.length ? (
        <div className={`proof-marquee${open ? " is-paused" : ""}`}>
          <div className="proof-marquee__track">
            {[0, 1].map((copy) => images.map((item) => (
              <button
                key={`${copy}-${item._id}`}
                className="proof-marquee__shot"
                type="button"
                aria-label={copy === 0 ? `Inspect ${item.title}` : undefined}
                aria-hidden={copy === 1 || undefined}
                tabIndex={copy === 1 ? -1 : 0}
                onClick={() => setOpen(item)}
              >
                <img src={item.image.url} alt="" loading="lazy" />
              </button>
            )))}
          </div>
        </div>
      ) : null}
      {open ? createPortal(
        <dialog className="modal proof-inspect" open aria-label={open.title} onClick={() => setOpen(null)}>
          <button className="icon-btn proof-inspect__close" type="button" aria-label="Close" onClick={() => setOpen(null)}>
            <Icon name="i-close" />
          </button>
          <img src={open.image.url} alt={open.title} onClick={(event) => event.stopPropagation()} />
        </dialog>,
        document.body
      ) : null}
    </section>
  );
}
