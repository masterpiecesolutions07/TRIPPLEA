import { useEffect } from "react";
import { Link } from "react-router-dom";

export function Privacy() {
  useEffect(() => { document.title = "Privacy · Tripple A"; }, []);
  return (
    <>
      <section className="page-hero"><div className="container"><h1>Privacy notice</h1><p className="lede">What Tripple A asks for, and where those details are kept.</p></div></section>
      <article className="container legal">
        <h2>What the forms ask for</h2>
        <p>Creating an account asks for your name, email, and password. The mentorship application does not require an account. It asks for your name, email, phone, country, city, experience, attendance, price plan, and how you heard about Tripple A. Contact forms ask for name, email, phone, and a message.</p>
        <h2>Where it is stored</h2>
        <p>Account details and messages are kept by Tripple A. Your light or dark choice stays in this browser. Your password is kept in a form that cannot be read back.</p>
        <h2>Your control</h2>
        <p>Log out to end the session on this device. To remove an account, write to Tripple A from the contact page.</p>
        <p><Link to="/terms">Read the terms</Link> · <Link to="/contact">Contact</Link></p>
      </article>
    </>
  );
}
