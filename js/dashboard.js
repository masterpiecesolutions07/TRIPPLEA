/** Student dashboard. Progress follows the provisional January 2027 calendar. */

import { bindLogout, getSession } from "./auth.js";
import { KEYS } from "./config.js";
import { formatDate } from "./ui.js";
import { loadProgramme } from "./programme.js";
import { loadUpdates } from "./updates.js";

function prepState() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.prep)) || {};
  } catch {
    return {};
  }
}

function savePrep(state) {
  localStorage.setItem(KEYS.prep, JSON.stringify(state));
}

function weekStatus(unlock, now) {
  const start = new Date(`${unlock}T00:00:00+03:00`).getTime();
  const end = start + 7 * 86400000;
  if (Number.isNaN(start)) return "locked";
  if (now < start) return "locked";
  if (now >= end) return "completed";
  return "available";
}

export async function initDashboard() {
  const session = getSession();
  if (!session) {
    location.replace("login.html?next=dashboard.html");
    return;
  }

  bindLogout();
  const first = session.fullName.split(" ")[0] || session.fullName;
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.textContent = `Welcome, ${first}`;

  const profile = document.getElementById("profile-details");
  if (profile) {
    const rows = [
      ["Name", session.fullName],
      ["Email", session.email],
      ["Cohort", session.cohort || "January 2027"],
      ["Experience", session.experience || "Not set"],
      ["Attendance", session.mode === "physical" ? "Physical" : "Online"],
      ["Plan", planLabel(session.plan)]
    ];
    profile.replaceChildren();
    rows.forEach(([label, value]) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      p.append(strong, document.createTextNode(value));
      profile.append(p);
    });
  }

  const avatar = document.getElementById("avatar");
  if (avatar) {
    const initials = session.fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
    avatar.textContent = initials || "AA";
  }

  const prep = prepState();
  document.querySelectorAll("[data-prep]").forEach((input) => {
    input.checked = Boolean(prep[input.dataset.prep]);
    input.addEventListener("change", () => {
      const next = prepState();
      next[input.dataset.prep] = input.checked;
      savePrep(next);
    });
  });

  let programme;
  try {
    programme = await loadProgramme();
  } catch {
    const box = document.getElementById("module-list");
    if (box) box.textContent = "Modules could not be loaded. Refresh this page from a local server.";
    const sessionsNote = document.getElementById("session-countdown");
    if (sessionsNote) sessionsNote.textContent = "The timetable could not be loaded from this page.";
    return;
  }

  const now = Date.now();
  const start = new Date(programme.cohort.start).getTime();
  const end = new Date(programme.cohort.end).getTime();
  let percent = 0;
  if (now >= end) percent = 100;
  else if (now > start) percent = Math.round(((now - start) / (end - start)) * 100);

  const ring = document.getElementById("ring-value");
  const ringLabel = document.getElementById("progress-ring");
  const percentText = document.getElementById("progress-percent");
  const progressNote = document.getElementById("progress-note");
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  if (ring) {
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference * (1 - percent / 100)}`;
  }
  if (percentText) percentText.textContent = `${percent}%`;
  if (ringLabel) {
    ringLabel.setAttribute("aria-label", `Programme progress ${percent} percent of the 3-month cohort`);
  }
  if (progressNote) {
    progressNote.textContent = percent === 0
      ? "The January 2027 cohort has not started, so progress sits at 0%. Modules unlock on their week."
      : `${percent}% of the 3-month cohort has elapsed.`;
  }

  const list = document.getElementById("module-list");
  if (list) {
    list.replaceChildren();
    programme.months.forEach((month) => {
      const block = document.createElement("section");
      const title = document.createElement("h3");
      title.textContent = month.title;
      title.style.padding = "1rem 1rem 0";
      block.append(title);
      month.weeks.forEach((week) => {
        const status = weekStatus(week.unlock, now);
        const row = document.createElement("article");
        row.className = "module";
        const header = document.createElement("header");
        const name = document.createElement("h4");
        name.textContent = week.title;
        const badge = document.createElement("p");
        badge.className = status === "completed" ? "badge badge--ok" : status === "available" ? "badge" : "badge badge--lock";
        badge.textContent = status === "completed" ? "Completed" : status === "available" ? "In progress" : "Locked";
        header.append(name, badge);
        const meta = document.createElement("p");
        meta.className = "note";
        meta.textContent = `${formatDate(week.unlock)} · Online / Physical`;
        row.append(header, meta);
        block.append(row);
      });
      list.append(block);
    });
  }

  const sessions = document.getElementById("session-list");
  const upcoming = (programme.sessions || [])
    .map((session) => ({ ...session, time: new Date(session.start).getTime() }))
    .filter((session) => session.time >= now - 3600000)
    .sort((a, b) => a.time - b.time);

  if (sessions) {
    sessions.replaceChildren();
    if (!upcoming.length) {
      sessions.textContent = "No later session is listed.";
    } else {
      upcoming.forEach((session, index) => {
        const article = document.createElement("article");
        article.className = "module";
        const header = document.createElement("header");
        const title = document.createElement("h3");
        title.textContent = session.title;
        const badge = document.createElement("p");
        badge.className = "badge";
        badge.textContent = index === 0 ? "Next" : session.platform;
        header.append(title, badge);
        const meta = document.createElement("p");
        meta.className = "note";
        meta.textContent = `${new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Nairobi"
        }).format(new Date(session.start))} · ${session.platform} · ${session.mode}`;
        article.append(header, meta);
        sessions.append(article);
      });
    }
  }

  const next = upcoming[0];
  const sessionCountdown = document.getElementById("session-countdown");
  if (next && sessionCountdown) {
    const tick = () => {
      const remaining = Math.max(0, next.time - Date.now());
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      sessionCountdown.textContent = remaining === 0
        ? `${next.title} is the next session.`
        : `${days}d ${hours}h ${minutes}m until ${next.title}.`;
    };
    tick();
    window.setInterval(tick, 30000);
  }

  const notes = document.getElementById("personal-notes");
  if (notes) {
    let updates = [];
    try {
      updates = await loadUpdates();
    } catch {
      updates = [];
    }
    notes.replaceChildren();
    const welcomeNote = document.createElement("article");
    welcomeNote.className = "module";
    const welcomeTitle = document.createElement("h3");
    welcomeTitle.textContent = "You are registered for January 2027";
    const welcomeBody = document.createElement("p");
    welcomeBody.className = "note";
    welcomeBody.textContent = "You are registered for the cohort that opens on 11 January 2027. Online and in-person students follow the same path.";
    welcomeNote.append(welcomeTitle, welcomeBody);
    notes.append(welcomeNote);

    const unread = updates.filter((item) => {
      try {
        const ids = new Set(JSON.parse(localStorage.getItem(KEYS.read)) || []);
        return !ids.has(item.id);
      } catch {
        return true;
      }
    }).slice(0, 4);

    unread.forEach((item) => {
      const article = document.createElement("article");
      article.className = "module";
      const title = document.createElement("h3");
      title.textContent = item.title;
      const link = document.createElement("a");
      link.href = `updates.html?id=${encodeURIComponent(item.id)}`;
      link.textContent = "Open update";
      article.append(title, link);
      notes.append(article);
    });
  }
}

function planLabel(plan) {
  if (plan === "starter") return "Starter, from 120 USD";
  if (plan === "premium") return "Premium, quoted above 120 USD";
  if (plan === "custom") return "Custom price requested";
  return plan || "To be confirmed";
}
