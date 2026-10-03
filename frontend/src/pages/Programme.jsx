import { useEffect } from "react";
import { Link } from "react-router-dom";
import programme from "../data/programme.json";
import { FaqList } from "../components/FaqList.jsx";
import { Countdown } from "../components/Countdown.jsx";
import { Icon } from "../components/Icon.jsx";

export function Programme() {
  useEffect(() => { document.title = "Programme · Tripple A"; }, []);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Programme</span></p>
          <p className="eyebrow">3 months</p>
          <h1>Beginner to advanced, online or in the room.</h1>
          <p className="lede">Live sessions run on Zoom and Google Meet, and in person with the cohort. You choose your mode when you register. Strategy compiled by Grand Mentor Abdiwali Moalimuu.</p>
        </div>
      </section>
      <section className="section">
        <div className="container card-grid">
          <article className="card" style={{ padding: "1.2rem" }}>
            <p className="eyebrow">Next cohort</p>
            <h2>January 2027</h2>
            <p className="note">The cohort opens on 11 January 2027. Class times are sent to enrolled students.</p>
            <Countdown />
          </article>
          <article className="card" style={{ padding: "1.2rem" }}>
            <p className="eyebrow">Attendance</p>
            <h2>Online or in person</h2>
            <p>Online students meet on Zoom and Google Meet. In-person students join the same lessons in the cohort room. Both paths receive recordings, Discord, and the weekly review.</p>
            <p className="note" style={{ marginTop: "0.8rem" }}>The venue is shared with you after you register.</p>
          </article>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Curriculum</p>
            <h2>Month by month, week by week</h2>
          </header>
          <div className="stack">
            {programme.months.map((month) => (
              <article className="card" key={month.id} style={{ padding: "1.2rem" }}>
                <h3>{month.title}</h3>
                <p className="note">{month.summary}</p>
                <div className="card-grid" style={{ marginTop: "1rem" }}>
                  {month.weeks.map((week) => (
                    <div key={week.id}>
                      <h4>{week.title}</h4>
                      <ul>{week.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="pricing" style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Pricing</p>
            <h2>Plans start from 120 USD</h2>
            <p className="lede">Starter begins at 120 USD. Premium is arranged above that for students who want closer review. A custom fee can sit below or above 120 USD when the support you need is different.</p>
          </header>
          <div className="price-grid">
            <article className="price card lift">
              <p className="badge">Starter</p>
              <p className="price__amount">120 <span style={{ fontSize: "1rem" }}>USD</span></p>
              <p className="note">From this price.</p>
              <ul>
                {["3-month beginner to advanced path", "Recorded lessons", "Discord community", "Weekly group review", "Online or physical attendance"].map((item) => <li key={item}><Icon name="i-check" /> {item}</li>)}
              </ul>
              <Link className="btn btn--primary" to="/apply">Apply on Starter</Link>
            </article>
            <article className="price card lift">
              <p className="badge badge--violet">Premium</p>
              <p className="price__amount">120+ <span style={{ fontSize: "1rem" }}>USD</span></p>
              <p className="note">Quoted for you.</p>
              <ul>
                {["Everything in Starter", "Closer review cadence", "For students who want more contact time"].map((item) => <li key={item}><Icon name="i-check" /> {item}</li>)}
              </ul>
              <Link className="btn btn--ghost" to="/apply">Apply</Link>
            </article>
            <article className="price card lift">
              <p className="badge badge--gold">Custom</p>
              <p className="price__amount">Ask</p>
              <p className="note">A price below or above 120 USD, matched to the student.</p>
              <ul>
                {["Describe the support you need", "Online, physical, or a mix", "Tripple A confirms the fee"].map((item) => <li key={item}><Icon name="i-check" /> {item}</li>)}
              </ul>
              <Link className="btn btn--gold" to="/contact">Request a custom price</Link>
            </article>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: "52rem" }}>
          <h2>Programme questions</h2>
          <div style={{ marginTop: "1rem" }}>
            <FaqList />
          </div>
        </div>
      </section>
    </>
  );
}
