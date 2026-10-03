import { useState } from "react";
import { Icon } from "./Icon.jsx";

export function Accordion({ items }) {
  const [open, setOpen] = useState(items[0]?.id || "");
  return (
    <div className="accordion">
      {items.map((item) => {
        const expanded = open === item.id;
        return (
          <div className="accordion__item" key={item.id}>
            <h3>
              <button
                className="accordion__trigger"
                type="button"
                aria-expanded={expanded}
                aria-controls={`${item.id}-panel`}
                id={item.id}
                onClick={() => setOpen(expanded ? "" : item.id)}
              >
                <span>{item.title}</span>
                <Icon name="i-chevron" />
              </button>
            </h3>
            <div className={`accordion__panel${expanded ? " is-open" : ""}`} id={`${item.id}-panel`} role="region" aria-labelledby={item.id}>
              <div className="accordion__inner">
                <div className="accordion__content"><p>{item.body}</p></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
