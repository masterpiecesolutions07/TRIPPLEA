import { useEffect } from "react";
import { Link } from "react-router-dom";

export function Terms() {
  useEffect(() => { document.title = "Terms · Tripple A"; }, []);
  return (
    <>
      <section className="page-hero"><div className="container"><h1>Terms of use</h1><p className="lede">These terms cover the Tripple A mentorship website taught by Abdullahi Abukar Ahmed.</p></div></section>
      <article className="container legal">
        <p>This website presents the Tripple A mentorship. Law and Order, the strategy taught in the programme, was compiled by Grand Mentor Abdiwali Moalimuu.</p>
        <h2>Education, not advice</h2>
        <p>Content on this site is education about a mentorship programme. It is not investment advice, not a personal recommendation, and not an offer to buy or sell any financial instrument.</p>
        <h2>Risk</h2>
        <p className="disclaimer">Forex and CFD trading carries a high risk of loss and is not suitable for everyone. You can lose some or all of the money you deposit. Past performance does not guarantee future results.</p>
        <h2>Your account</h2>
        <p>Registration creates a student account on the Tripple A server. The password is hashed before it is stored. The site does not keep the password you typed.</p>
        <h2>No payments on this page</h2>
        <p>The site does not take payment. Starter pricing begins at 120 USD. A custom price is agreed with Tripple A, not by submitting the form alone.</p>
        <h2>The cohort</h2>
        <p>The next cohort opens on 11 January 2027. Class times and the in-person venue are sent to enrolled students.</p>
        <p><Link to="/privacy">Read the privacy notice</Link> · <Link to="/">Home</Link></p>
      </article>
    </>
  );
}
