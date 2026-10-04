import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import updates from "../data/updates.json";
import { Icon } from "../components/Icon.jsx";

const FILTERS = ["All", "Announcements", "Market Insights", "Mentorship News", "Forex News"];

export function Updates() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  useEffect(() => { document.title = "Updates · Tripple A"; }, []);
  const visible = useMemo(() => updates.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const haystack = `${item.title} ${item.summary} ${item.body}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [category, query]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Updates</span></p>
          <p className="eyebrow">News</p>
          <h1>Announcements and market notes</h1>
          <p className="lede">Filter by topic or search a keyword. These notes are education. They are not buy or sell calls.</p>
        </div>
      </section>
      <section className="section">
        <div className="container stack">
          <div className="panel">
            <h2>Check the calendar before you practise</h2>
            <p>Before a session, see which releases are due. Jobs figures, inflation, and interest-rate decisions can move a pair, so know the time before you mark a chart. The mentorship uses these two calendars. Open either one and look up the day you are studying.</p>
            <div className="cluster">
              <a className="btn btn--ghost" href="https://www.myfxbook.com/forex-economic-calendar" target="_blank" rel="noreferrer">Myfxbook calendar</a>
              <a className="btn btn--ghost" href="https://www.forexfactory.com/calendar" target="_blank" rel="noreferrer">Forex Factory calendar</a>
            </div>
          </div>
          <div className="cluster" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div className="filters" role="group" aria-label="Filter updates">
              {FILTERS.map((item) => (
                <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
            <p className="note" role="status">{visible.length} update{visible.length === 1 ? "" : "s"}</p>
          </div>
          <label className="search" htmlFor="update-search">
            <span className="visually-hidden">Search updates</span>
            <Icon name="i-search" />
            <input id="update-search" type="search" placeholder="Search updates" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="feed">
            {visible.map((item) => (
              <article className="update-card" key={item.id}>
                <p className="tag">{item.category}</p>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <p className="note">{item.date} · {item.author}</p>
                <button className="btn btn--ghost" type="button" onClick={() => setOpen(item)}>Read</button>
              </article>
            ))}
          </div>
        </div>
      </section>
      {open ? (
        <dialog className="modal" open aria-labelledby="update-title">
          <div className="modal__card">
            <div className="modal__top">
              <p className="tag">{open.category}</p>
              <button className="icon-btn" type="button" aria-label="Close dialog" onClick={() => setOpen(null)}><Icon name="i-close" /></button>
            </div>
            <h2 id="update-title">{open.title}</h2>
            <p className="note">{open.date} · {open.author}</p>
            <div className="prose">{open.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
