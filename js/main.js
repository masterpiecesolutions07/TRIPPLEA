/** Shared page behaviour: navigation, theme, scroll, and page boot. */

import { KEYS, SITE } from "./config.js";
import { initAccordion, initDialogs, initTabs } from "./ui.js";
import { initCounters, initReveal, initSlider, initTicker, initTyping } from "./animations.js";
import { initAuthNav } from "./auth.js";
import { initBell, initLatest } from "./updates.js";
import { initCountdowns, initSeats } from "./programme.js";
import { isEmail } from "./validate.js";

function initTheme() {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  const meta = document.querySelector('meta[name="theme-color"]');
  const apply = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(KEYS.theme, theme);
    button?.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    meta?.setAttribute("content", theme === "dark" ? "#0B1020" : "#F8FAFC");
  };
  button?.addEventListener("click", () => {
    apply(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });
  apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");
}

function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");
  const header = document.getElementById("site-header");
  if (!nav || !toggle || !panel) return;
  const desktop = window.matchMedia("(min-width: 1024px)");

  const setOpen = (open) => {
    const show = desktop.matches ? false : open;
    nav.classList.toggle("is-open", show);
    document.body.classList.toggle("nav-open", show);
    header?.classList.toggle("is-open", show);
    toggle.setAttribute("aria-expanded", String(show));
    try {
      panel.inert = !desktop.matches && !show;
    } catch {
      /* inert is unavailable */
    }
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  desktop.addEventListener("change", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
  setOpen(false);
}

function initScroll() {
  const header = document.getElementById("site-header");
  const bar = document.getElementById("scroll-progress");
  const toTop = document.getElementById("to-top");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop?.classList.toggle("is-visible", y > 480);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  onScroll();
}

function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader || document.documentElement.classList.contains("is-ready")) return;
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      preloader.classList.add("is-done");
      preloader.setAttribute("aria-hidden", "true");
      try {
        sessionStorage.setItem(KEYS.seen, "1");
      } catch {
        /* storage may be blocked */
      }
      window.setTimeout(() => preloader.remove(), 450);
    }, 450);
  });
}

function initChannels() {
  document.querySelectorAll("[data-contact]").forEach((node) => {
    const values = {
      email: SITE.email,
      phone: SITE.phoneDisplay,
      location: SITE.location,
      venue: SITE.venue
    };
    if (values[node.dataset.contact]) node.textContent = values[node.dataset.contact];
  });

  document.querySelectorAll("[data-channel]").forEach((node) => {
    const key = node.dataset.channel;
    let href = "";
    if (key === "email" && SITE.email) href = `mailto:${SITE.email}`;
    if (key === "phone" && SITE.phoneTel) href = `tel:${SITE.phoneTel}`;
    if (key === "whatsapp" && SITE.whatsappNumber) href = `https://wa.me/${SITE.whatsappNumber}`;
    if (SITE.socials[key]) href = SITE.socials[key];
    if (!href) return;
    node.setAttribute("href", href);
    if (!href.startsWith("mailto:") && !href.startsWith("tel:")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  const float = document.getElementById("whatsapp-float");
  if (float && SITE.whatsappNumber) {
    const text = encodeURIComponent("Hello Tripple A, I would like to ask about the mentorship.");
    float.href = `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
    float.target = "_blank";
    float.rel = "noopener noreferrer";
  }
}

function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  const status = document.getElementById("newsletter-status");
  if (!form || !status) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (String(data.get("company") || "").trim()) {
      form.reset();
      status.textContent = "Thanks. You are noted.";
      return;
    }
    const email = String(data.get("email") || "").trim();
    if (!isEmail(email)) {
      status.textContent = "Enter a valid email address.";
      return;
    }
    const saved = JSON.parse(localStorage.getItem(KEYS.newsletter) || "[]");
    const normal = email.toLowerCase();
    if (!saved.includes(normal)) saved.push(normal);
    localStorage.setItem(KEYS.newsletter, JSON.stringify(saved));
    form.reset();
    status.textContent = "You are on the list for cohort news.";
  });
}

function initYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

async function bootPage() {
  const page = document.body.dataset.page;
  if (page === "updates") {
    const module = await import("./updates.js");
    await module.initUpdatesPage();
  }
  if (page === "programme") {
    const module = await import("./programme.js");
    await module.initProgrammePage();
  }
  if (page === "contact") {
    const module = await import("./contact.js");
    module.initContact();
  }
  if (page === "register") {
    const module = await import("./auth.js");
    module.initRegister();
  }
  if (page === "login") {
    const module = await import("./auth.js");
    module.initLogin();
  }
  if (page === "dashboard") {
    const module = await import("./dashboard.js");
    await module.initDashboard();
  }
}

initPreloader();
initTheme();
initNav();
initScroll();
initYear();
initChannels();
initNewsletter();
initAccordion(document);
initTabs(document);
initDialogs();
initReveal();
initCounters();
initTicker();
initTyping();
initSlider();
initAuthNav();
initBell();
initLatest();
initCountdowns();
initSeats();
bootPage();
