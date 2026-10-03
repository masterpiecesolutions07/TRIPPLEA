import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import updates from "../data/updates.json";
import { Accordion } from "../components/Accordion.jsx";
import { Countdown } from "../components/Countdown.jsx";
import { Icon } from "../components/Icon.jsx";
import { ProofSections } from "../components/ProofSections.jsx";

const SLIDES = [
  ["You leave with a rule you can explain before the session starts. If you cannot point to it, you are not ready to use it.", "Law", "The Tripple A standard"],
  ["Every practice idea has a loss limit written first. Standing aside is a successful decision when the rule is absent.", "Order", "Risk and routine"],
  ["The weekly review reads your journal: the rule, the risk, and whether you followed the plan. A win that broke the rule is not treated as success.", "Review", "Online and in person"]
];

const FAQ = [
  ["q1", "Who is Tripple A?", "Abdullahi Abukar Ahmed. He mentors under the name Tripple A and teaches the Law and Order framework inside a 3-month programme."],
  ["q2", "Who compiled Law and Order?", "Abdiwali Moalimuu compiled the strategy and is credited here as Grand Mentor. The public pages are an overview. The rule set is taught in the mentorship."],
  ["q3", "Can a complete beginner join?", "Yes. Month 1 starts with terminology, platforms, candles, and risk basics. Intermediate students can still use the same three-month path."],
  ["q4", "Is this financial advice or a signal service?", "No. The mentorship is education. It does not promise profits, and market posts on this site are not buy or sell calls."],
  ["q5", "When can I start?", "The next cohort opens on 11 January 2027. You choose online or in person when you register, and class times are sent to enrolled students."]
];

export function Home() {
  const [slide, setSlide] = useState(0);
  const [meet, setMeet] = useState(false);

  useEffect(() => {
    document.title = "Tripple A Mentorship · Trade With Discipline";
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <p className="eyebrow">Abdullahi Abukar Ahmed</p>
            <p className="hero__wordmark gradient-text">Tripple A</p>
            <h1 className="gradient-text">Trade With Discipline. Win With Law and Order.</h1>
            <p className="lede">A 3-month mentorship from beginner to advanced. You learn the Law and Order strategy compiled by Grand Mentor Abdiwali Moalimuu, with a written process for risk, review, and execution.</p>
            <div className="cluster">
              <Link className="btn btn--primary" to="/apply">Apply for the mentorship <Icon name="i-arrow" /></Link>
              <button className="btn btn--ghost" type="button" onClick={() => setMeet(true)}><Icon name="i-play" /> Meet Tripple A</button>
            </div>
          </div>
          <div className="portrait">
            <div className="portrait__glow" aria-hidden="true" />
            <div className="portrait__frame">
              <img src="/assets/images/abdullahi.jpg" width="864" height="1152" alt="Abdullahi Abukar Ahmed, the mentor known as Tripple A" />
            </div>
            <p className="float-card float-card--a"><strong>3 Months</strong><span>Beginner to Advanced</span></p>
            <p className="float-card float-card--b"><strong>Jan 2027</strong><span>Next cohort</span></p>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="stats-title">
        <div className="container">
          <h2 id="stats-title" className="visually-hidden">The mentorship at a glance</h2>
          <div className="stat-grid card">
            <article className="stat"><b>3</b><span>Months of mentorship</span><em>Beginner to advanced</em></article>
            <article className="stat"><b>12</b><span>Teaching weeks</span><em>One roadmap</em></article>
            <article className="stat"><b>2</b><span>Ways to attend</span><em>Online or in person</em></article>
            <article className="stat"><b>120</b><span>USD to start</span><em>Custom pricing available</em></article>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="strategy-title">
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">The framework</p>
            <h2 id="strategy-title">Law and Order, taught as a process</h2>
            <p className="lede">Law is the rule you write down before the session. Order is the discipline and risk limit that keep the rule intact. Strategy compiled by Grand Mentor Abdiwali Moalimuu.</p>
          </header>
          <div className="feature-grid">
            <article className="feature card lift"><span className="badge badge--violet"><Icon name="i-book" /> Law</span><h3>Rules before the session</h3><p className="note">Students define what they are allowed to do before they open a chart, then they practise staying inside that boundary.</p></article>
            <article className="feature card lift"><span className="badge"><Icon name="i-shield" /> Order</span><h3>Risk and routine</h3><p className="note">Position size, loss limits, and a session routine sit beside the rule. The full rule set is taught inside the mentorship.</p></article>
            <article className="feature card lift"><span className="badge badge--gold"><Icon name="i-chart" /> Path</span><h3>Beginner to advanced</h3><p className="note">Three months move from terminology and candles to structure, psychology, and live Law and Order execution.</p></article>
            <article className="feature card lift"><span className="badge badge--ok"><Icon name="i-users" /> Review</span><h3>Journal and weekly review</h3><p className="note">Both online and physical students get recordings, a Discord community, and a weekly look at the written plan.</p></article>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="path-title">
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Programme</p>
            <h2 id="path-title">Three months, one roadmap</h2>
          </header>
          <div className="roadmap">
            <article className="roadmap__step card"><span className="roadmap__index">01</span><h3>Month 1 · Beginner</h3><p className="note">Forex basics, terminology, platforms, charts, candlesticks, and risk basics.</p></article>
            <article className="roadmap__step card"><span className="roadmap__index">02</span><h3>Month 2 · Intermediate</h3><p className="note">Technical analysis, structure, entries and exits, risk management, and trading psychology.</p></article>
            <article className="roadmap__step card"><span className="roadmap__index">03</span><h3>Month 3 · Advanced</h3><p className="note">Law and Order execution, advanced setups, journaling, live sessions, and a trading plan.</p></article>
          </div>
          <p style={{ marginTop: "1rem" }}><Link className="btn btn--ghost" to="/programme">See the curriculum <Icon name="i-arrow" /></Link></p>
        </div>
      </section>
      <ProofSections />
      <section className="section" aria-labelledby="about-title">
        <div className="container about-preview">
          <div>
            <p className="eyebrow">The mentor</p>
            <h2 id="about-title">Abdullahi Abukar Ahmed. The room is called Tripple A.</h2>
            <div className="prose">
              <p>He mentors traders who want a rule they can keep. The brand on his mark is Growth &amp; Confidence: learn the standard, then trust yourself to follow it.</p>
              <p>The strategy is Law and Order, compiled by Grand Mentor Abdiwali Moalimuu. Tripple A teaches that framework across three months, online or in person.</p>
            </div>
            <p style={{ marginTop: "1rem" }}><Link className="btn btn--ghost" to="/about">Read more</Link></p>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <img className="mentor-photo" src="/assets/images/abdullahi.jpg" width="864" height="1152" alt="Abdullahi Abukar Ahmed seated, wearing a white shirt and black cap" />
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="stories-title">
        <div className="container">
          <header className="section__head section__head--center">
            <p className="eyebrow">The standard</p>
            <h2 id="stories-title">What the three months are for</h2>
            <p className="lede">Growth and confidence, earned by keeping a rule. These are the standards of the mentorship, not profit claims.</p>
          </header>
          <div className="slider card" aria-roledescription="carousel" aria-label="Mentorship standards">
            <div className="slider__viewport">
              <article className="slide">
                <p>{SLIDES[slide][0]}</p>
                <footer><strong>{SLIDES[slide][1]}</strong><span>{SLIDES[slide][2]}</span></footer>
              </article>
            </div>
            <div className="slider__controls">
              <button className="icon-btn" type="button" aria-label="Previous" onClick={() => setSlide((index) => (index + SLIDES.length - 1) % SLIDES.length)}><Icon name="i-chevron" /></button>
              <button className="icon-btn" type="button" aria-label="Next" onClick={() => setSlide((index) => (index + 1) % SLIDES.length)}><Icon name="i-arrow" /></button>
            </div>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="news-title">
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Updates</p>
            <h2 id="news-title">Latest from the desk</h2>
          </header>
          <div className="update-list">
            {updates.slice(0, 3).map((item) => (
              <article className="update-card" key={item.id}>
                <p className="tag">{item.category}</p>
                <h3>{item.title}</h3>
                <p className="note">{item.summary}</p>
                <p className="note">{item.date} · {item.author}</p>
              </article>
            ))}
          </div>
          <p style={{ marginTop: "1rem" }}><Link to="/updates">View all updates</Link></p>
        </div>
      </section>
      <section className="section" aria-labelledby="faq-title">
        <div className="container" style={{ maxWidth: "52rem" }}>
          <header className="section__head">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-title">Before you register</h2>
          </header>
          <Accordion items={FAQ.map(([id, title, body]) => ({ id, title, body }))} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="cta-band card">
            <p className="eyebrow">January 2027</p>
            <h2>Reserve a place on the next cohort</h2>
            <p className="lede">Plans start from 120 USD. Ask for a custom price if you need a different arrangement. The January 2027 cohort opens on 11 January.</p>
            <Countdown />
            <div className="cluster" style={{ marginTop: "1rem" }}>
              <Link className="btn btn--gold" to="/apply">Apply for the mentorship</Link>
              <Link className="btn btn--ghost" to="/programme" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>View pricing</Link>
            </div>
          </div>
        </div>
      </section>
      {meet ? (
        <dialog className="modal" open aria-labelledby="intro-title">
          <div className="modal__card">
            <div className="modal__top">
              <h2 id="intro-title">Meet Tripple A</h2>
              <button className="icon-btn" type="button" aria-label="Close dialog" onClick={() => setMeet(false)}><Icon name="i-close" /></button>
            </div>
            <img className="mentor-photo" src="/assets/images/abdullahi.jpg" width="864" height="1152" alt="Abdullahi Abukar Ahmed, Tripple A" />
            <p>Abdullahi Abukar Ahmed mentors under the name Tripple A. For three months he teaches Law and Order, the strategy compiled by Grand Mentor Abdiwali Moalimuu: the rule first, then the discipline to keep it. The line on his mark is Growth &amp; Confidence.</p>
            <Link className="btn btn--primary" to="/apply" onClick={() => setMeet(false)}>Apply for the mentorship</Link>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
