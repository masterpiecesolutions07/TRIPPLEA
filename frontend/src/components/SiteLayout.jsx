import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import updates from "../data/updates.json";
import api from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import { homePath } from "../utils/homePath.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { Icon } from "./Icon.jsx";

const PAIRS = [
  { symbol: "EUR/USD", price: 1.0864, digits: 4 },
  { symbol: "GBP/USD", price: 1.3126, digits: 4 },
  { symbol: "XAU/USD", price: 2648.2, digits: 2 },
  { symbol: "USD/JPY", price: 147.82, digits: 2 }
];

const LINKS = [
  ["/", "Home"],
  ["/about", "About"],
  ["/strategy", "Strategy"],
  ["/programme", "Programme"],
  ["/updates", "Updates"],
  ["/contact", "Contact"]
];

const SOCIALS = [
  ["tiktok", "TikTok", "i-tiktok", "https://www.tiktok.com/@tripple.a75"],
  ["whatsapp", "WhatsApp", "i-whatsapp", "/contact#socials"],
  ["facebook", "Facebook", "i-facebook", "/contact#socials"],
  ["youtube", "YouTube", "i-youtube", "/contact#socials"],
  ["discord", "Discord", "i-discord", "/contact#socials"],
  ["instagram", "Instagram", "i-instagram", "/contact#socials"]
];

function SocialRow() {
  return (
    <ul className="socials socials--row socials--icons" aria-label="Social media" style={{ marginTop: "0.8rem" }}>
      {SOCIALS.map(([channel, label, icon, href]) => (
        <li key={channel}>
          <a className="social social--icon" href={href} data-channel={channel} aria-label={label} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Icon name={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SiteLayout({ children }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [listNote, setListNote] = useState("");
  const [showTop, setShowTop] = useState(false);
  const [quote, setQuote] = useState("1.0864");

  useEffect(() => {
    setMenuOpen(false);
    setNotifyOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen);
    return () => document.body.classList.remove("nav-open");
  }, [menuOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuote((1.0864 + (Math.random() - 0.5) * 0.002).toFixed(4));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function joinList(event) {
    event.preventDefault();
    setListNote("");
    try {
      await api.post("/messages", {
        name: "Updates list",
        email,
        subject: "Updates list",
        message: "Please add this address to cohort news."
      });
      setListNote("You are on the list.");
      setEmail("");
    } catch {
      setListNote("The API is not reachable. Start MongoDB, then the backend, and try again.");
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <nav className={`nav${menuOpen ? " is-open" : ""}`} aria-label="Primary">
          <Link className="logo" to="/">
            <img className="logo__img" src="/assets/images/logo-mark.png" width="48" height="48" alt="" />
            <span className="logo__words">
              <span className="logo__name">Tripple A</span>
              <span className="logo__tag">Growth &amp; Confidence</span>
            </span>
          </Link>
          <div className="nav__panel" id="nav-panel">
            <ul className="nav__links">
              {LINKS.map(([to, label]) => (
                <li key={to}>
                  <NavLink className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`} to={to} end={to === "/"}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="nav__cta">
              {user ? <Link className="btn btn--ghost" to={homePath(user)}>Account</Link> : <Link className="btn btn--ghost" to="/login">Login</Link>}
              <Link className="btn btn--primary" to="/apply">Apply</Link>
            </div>
          </div>
          <div className="nav__tools">
            <div className="notify">
              <button className="icon-btn" type="button" aria-expanded={notifyOpen} aria-label="Notifications" onClick={() => setNotifyOpen((open) => !open)}>
                <Icon name="i-bell" />
              </button>
              {notifyOpen ? (
                <div className="notify__panel">
                  <div className="notify__head">
                    <p>Latest updates</p>
                    <Link to="/updates">View all</Link>
                  </div>
                  <ul className="notify__list">
                    {updates.slice(0, 4).map((item) => (
                      <li key={item.id}><Link to="/updates">{item.title}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <button className="icon-btn" type="button" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle}>
              <Icon name="i-sun" className="icon icon--sun" />
              <Icon name="i-moon" className="icon icon--moon" />
            </button>
            <button className="nav__toggle" type="button" aria-expanded={menuOpen} aria-controls="nav-panel" onClick={() => setMenuOpen((open) => !open)}>
              <span className="visually-hidden">Menu</span>
              <Icon name="i-menu" className="icon icon--menu" />
              <Icon name="i-close" className="icon icon--close" />
            </button>
          </div>
        </nav>
      </header>
      <div className="ticker" aria-label="Illustration prices. Not a live market feed.">
        <div className="ticker__mask">
          <div className="ticker__track">
            {[0, 1].map((copy) => PAIRS.map((pair) => (
              <p className="ticker__item" key={`${copy}-${pair.symbol}`} aria-hidden={copy === 1 || undefined}>
                <span>{pair.symbol} · simulated</span>
                <strong>{pair.symbol === "EUR/USD" ? quote : pair.price.toFixed(pair.digits)}</strong>
              </p>
            )))}
          </div>
        </div>
      </div>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer className="site-footer">
        <div className="container footer__grid">
          <section>
            <Link className="logo" to="/">
              <img className="logo__img" src="/assets/images/logo-mark.png" width="48" height="48" alt="" />
              <span className="logo__words"><span className="logo__name">Tripple A</span><span className="logo__tag">Growth &amp; Confidence</span></span>
            </Link>
            <p className="note" style={{ marginTop: "0.8rem" }}>A 3-month forex mentorship with Abdullahi Abukar Ahmed, from beginner to advanced.</p>
            <p className="credit-line">Strategy compiled by Grand Mentor Abdiwali Moalimuu.</p>
          </section>
          <nav aria-label="Footer">
            <h2 className="footer__title">Explore</h2>
            <ul className="footer__links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/strategy">Law and Order</Link></li>
              <li><Link to="/programme">Programme</Link></li>
              <li><Link to="/updates">Updates</Link></li>
              <li><Link to="/register">Create an account</Link></li>
              <li><Link to="/apply">Apply</Link></li>
            </ul>
          </nav>
          <section>
            <h2 className="footer__title">Contact</h2>
            <ul className="footer__links">
              <li><a href="https://www.tiktok.com/@tripple.a75" target="_blank" rel="noopener noreferrer">TikTok @tripple.a75</a></li>
              <li><Link to="/contact">Write to Tripple A</Link></li>
              <li><Link to="/programme">January 2027 cohort</Link></li>
            </ul>
            <SocialRow />
          </section>
          <section>
            <h2 className="footer__title">Updates list</h2>
            <form className="form" onSubmit={joinList}>
              <label className="field" htmlFor="newsletter-email">
                <span className="visually-hidden">Email for updates</span>
                <input id="newsletter-email" type="email" autoComplete="email" placeholder="Email address" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <button className="btn btn--primary" type="submit">Join the list</button>
              <p className="note" role="status">{listNote}</p>
            </form>
          </section>
        </div>
        <div className="container">
          <p className="disclaimer"><strong>Risk disclaimer.</strong> Forex and CFD trading carries a high risk of loss and is not suitable for everyone. You can lose some or all of the money you deposit. This website is education and mentorship information. It is not financial advice, not a signal service, and not a promise of profit. Past performance does not guarantee future results.</p>
          <div className="footer__bar">
            <p>&copy; {new Date().getFullYear()} Abdullahi Abukar Ahmed · Tripple A.</p>
            <p><Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link></p>
          </div>
        </div>
      </footer>
      <Link className="whatsapp-float" to="/contact#direct" aria-label="Message Tripple A"><Icon name="i-whatsapp" /></Link>
      {showTop ? <button className="to-top" type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Icon name="i-arrow-up" /></button> : null}
    </>
  );
}
