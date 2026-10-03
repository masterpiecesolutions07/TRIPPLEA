import { useEffect } from "react";
import { Link } from "react-router-dom";

export function NotFound() {
  useEffect(() => { document.title = "Page not found · Tripple A"; }, []);
  return (
    <section className="page-hero">
      <div className="container" style={{ textAlign: "center" }}>
        <h1>That page is not here</h1>
        <p className="lede">The link may be old, or the address may have a typo. The mentorship pages below are all available.</p>
        <div className="cluster" style={{ justifyContent: "center" }}>
          <Link className="btn btn--primary" to="/">Back home</Link>
          <Link className="btn btn--ghost" to="/programme">View the programme</Link>
          <Link className="btn btn--ghost" to="/contact">Contact</Link>
        </div>
      </div>
    </section>
  );
}
