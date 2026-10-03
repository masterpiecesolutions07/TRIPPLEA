import { useEffect } from "react";
import { Link } from "react-router-dom";

export function About() {
  useEffect(() => { document.title = "About · Tripple A"; }, []);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>About</span></p>
          <p className="eyebrow">About</p>
          <h1>Abdullahi Abukar Ahmed</h1>
          <p className="lede">Known as Tripple A, he mentors traders through a 3-month path built on Law and Order. His mark reads Growth &amp; Confidence. Strategy compiled by Grand Mentor Abdiwali Moalimuu.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <div className="prose">
            <h2>The mentor</h2>
            <p>Abdullahi Abukar Ahmed is Tripple A. He teaches people who are new to forex, and people who already trade but want a routine they can repeat. The work is education: a rule, a risk limit, and a journal.</p>
            <p>Growth &amp; Confidence is the line under his name. Growth is the skill you build over twelve weeks. Confidence is what is left when you can explain the rule before you act, and stand aside when it is not there.</p>
            <p>The strategy he teaches was compiled by Grand Mentor Abdiwali Moalimuu. Tripple A carries that framework into the mentorship: Law for the rules, Order for the discipline and the risk management. The full playbook is taught in class.</p>
            <p>Students join him online on Zoom and Google Meet, or in person with the cohort. Recordings, a Discord community, and a weekly review support both rooms. You can also find him on TikTok as <a href="https://www.tiktok.com/@tripple.a75" target="_blank" rel="noopener noreferrer">@tripple.a75</a>.</p>
          </div>
          <img className="mentor-photo" src="/assets/images/abdullahi.jpg" width="864" height="1152" alt="Abdullahi Abukar Ahmed, Tripple A, seated at a table in a white shirt and black cap" />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Milestones</h2>
          <ol className="timeline" style={{ marginTop: "1.2rem" }}>
            <li><h3>The name</h3><p className="note">Abdullahi Abukar Ahmed mentors in public as Tripple A, under the line Growth &amp; Confidence.</p></li>
            <li><h3>The framework</h3><p className="note">Law and Order, compiled by Grand Mentor Abdiwali Moalimuu, is the strategy the programme teaches.</p></li>
            <li><h3>Three months</h3><p className="note">The path runs from beginner foundations to advanced execution, with a written trading plan at the end.</p></li>
            <li><h3>January 2027</h3><p className="note">The next cohort opens on 11 January 2027. Online and in-person students follow the same curriculum.</p></li>
          </ol>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section__head">
            <p className="eyebrow">Philosophy</p>
            <h2>Rules first. Then the discipline to keep them.</h2>
          </header>
          <div className="card-grid">
            <article className="card feature"><h3>Education, not a signal</h3><p className="note">Lessons explain a process. They do not tell a student which button to press tomorrow.</p></article>
            <article className="card feature"><h3>Write the rule</h3><p className="note">A session starts from a rule you can point to, not from a feeling about the last candle.</p></article>
            <article className="card feature"><h3>Cap the risk</h3><p className="note">Order means a size limit and a reason to stand aside. Losing trades are part of trading.</p></article>
            <article className="card feature"><h3>Review the behaviour</h3><p className="note">The journal records whether the plan was followed. Outcome alone is a poor teacher.</p></article>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Markets in the teaching scope</h2>
          <ul className="chips" aria-label="Markets and skills" style={{ marginTop: "1rem" }}>
            {["Forex majors", "Gold (XAU/USD)", "Indices", "Risk limits", "Journaling", "Session routine"].map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="note" style={{ marginTop: "0.8rem" }}>These are the markets lessons refer to. They are not a recommendation to trade any product.</p>
        </div>
      </section>
    </>
  );
}
