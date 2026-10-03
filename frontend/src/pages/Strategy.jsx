import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TABS = [
  ["law", "Law", "Students write the rule in their own words and can point to it before a session. If they cannot explain the rule, they are not ready to use it."],
  ["order", "Order", "Every practice decision has a maximum loss attached before entry. Changing the plan mid-trade is treated as a break in order, even when the trade later wins."],
  ["review", "Review", "Weekly reviews read the journal: the rule used, the risk taken, and whether the student followed the plan. A winning trade that broke the rule is not marked as a success."],
  ["scope", "Scope", "Lessons use forex majors, gold, and indices as examples. The page does not rank those markets or tell you which one to trade."]
];

export function Strategy() {
  const [tab, setTab] = useState("law");
  useEffect(() => { document.title = "Law and Order · Tripple A"; }, []);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Strategy</span></p>
          <p className="eyebrow">Law and Order</p>
          <h1>Rules, then the discipline to follow them.</h1>
          <p className="lede">This page is a public overview. The detailed rule set is taught inside the 3-month mentorship, with credit to Abdiwali Moalimuu as the strategy’s compiler.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <article className="credit card">
            <img className="mentor-photo mentor-photo--moalimuu" src="/assets/images/moalimuu.png" width="720" height="960" alt="Abdiwali Moalimuu, Grand Mentor of Law and Order" />
            <div className="prose">
              <p className="eyebrow">Strategy credit</p>
              <h2>Abdiwali Moalimuu</h2>
              <p><strong>Compiler and Grand Mentor of the Law and Order strategy.</strong></p>
              <p>Abdiwali Moalimuu compiled Law and Order. Tripple A teaches that framework. Law is the set of rules a student can point to before a session. Order is the discipline, the position size, and the decision to stand aside. The detailed playbook is taught inside the mentorship, with his name kept on the work.</p>
              <p className="credit-line">Strategy compiled by Grand Mentor Abdiwali Moalimuu.</p>
            </div>
          </article>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section__head">
            <h2>What the name means</h2>
            <p className="lede">Law is the rule you can point to. Order is the risk limit and the routine that protect it. The full playbook is taught in the mentorship.</p>
          </header>
          <div className="card-grid">
            <article className="card feature"><h3>Law</h3><p className="note">The rules: what a valid idea looks like, what is ignored, and what must be true before a student acts. The rules are learned in class, not published as a signal card on this site.</p></article>
            <article className="card feature"><h3>Order</h3><p className="note">The discipline and risk management: size, loss limits, session timing, and the decision to do nothing when the rule is absent.</p></article>
          </div>
          <div className="tabs" style={{ marginTop: "1.5rem" }}>
            <div role="tablist" aria-label="Core principles">
              {TABS.map(([id, label]) => (
                <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
            <div role="tabpanel"><p>{TABS.find(([id]) => id === tab)[2]}</p></div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band card">
            <h2>Learn the framework inside the mentorship</h2>
            <p className="lede">The January 2027 cohort is the next intake. Plans start from 120 USD.</p>
            <Link className="btn btn--gold" to="/apply">Apply for the mentorship</Link>
          </div>
        </div>
      </section>
    </>
  );
}
