/** Cohort countdown, seat bar, curriculum, and custom-price enquiry. */

import { KEYS } from "./config.js";
import { icon, initAccordion } from "./ui.js";
import { bindPasswordToggles, clean, isEmail, isName, isPhone, setFieldError } from "./validate.js";

let request;

export function loadProgramme() {
  if (!request) {
    request = fetch("data/programme.json").then((response) => {
      if (!response.ok) throw new Error("Could not load the programme.");
      return response.json();
    });
  }
  return request;
}

export async function initCountdowns() {
  const nodes = [...document.querySelectorAll("[data-countdown]")];
  if (!nodes.length) return;
  let target = nodes[0].getAttribute("data-countdown");
  try {
    const data = await loadProgramme();
    if (data.cohort?.start) target = data.cohort.start;
  } catch {
    /* The data attribute remains the fallback. */
  }
  const end = new Date(target).getTime();
  if (Number.isNaN(end)) return;

  const tick = () => {
    const diff = end - Date.now();
    const remaining = Math.max(0, diff);
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    nodes.forEach((node) => {
      const set = (unit, value) => {
        const el = node.querySelector(`[data-unit="${unit}"]`);
        if (el) el.textContent = value;
      };
      set("days", String(days));
      set("hours", String(hours).padStart(2, "0"));
      set("minutes", String(minutes).padStart(2, "0"));
      set("seconds", String(seconds).padStart(2, "0"));
      const live = node.querySelector("[data-countdown-live]");
      if (live && seconds === 0) {
        live.textContent = diff <= 0
          ? "The January 2027 opening date has passed."
          : `${days} days, ${hours} hours, and ${minutes} minutes until 11 January 2027.`;
      }
    });
  };

  tick();
  window.setInterval(tick, 1000);
}

export async function initSeats() {
  const bar = document.querySelector("[data-seats]");
  if (!bar) return;
  let total = Number(bar.dataset.total || 40);
  let taken = Number(bar.dataset.taken || 0);
  try {
    const data = await loadProgramme();
    total = Number(data.cohort.seatsTotal);
    taken = Number(data.cohort.seatsTaken);
  } catch {
    /* Keep the values printed in the page. */
  }
  const pct = total > 0 ? Math.min(100, Math.round((taken / total) * 100)) : 0;
  const fill = bar.querySelector(".seats__fill");
  if (fill) fill.style.width = `${pct}%`;
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", String(total));
  bar.setAttribute("aria-valuenow", String(taken));
  bar.setAttribute("aria-label", "Illustrative seats filled");
  const label = document.getElementById("seats-label");
  if (label) {
    const left = Math.max(0, total - taken);
    label.textContent = `${taken} of ${total} places are filled, ${left} remaining.`;
  }
}

function weekPanel(week) {
  const item = document.createElement("div");
  item.className = "accordion__item";
  const heading = document.createElement("h3");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "accordion__trigger";
  button.setAttribute("aria-expanded", "false");
  const label = document.createElement("span");
  label.textContent = week.title;
  button.append(label, icon("i-chevron"));
  heading.append(button);
  const panel = document.createElement("div");
  panel.className = "accordion__panel";
  const inner = document.createElement("div");
  inner.className = "accordion__inner";
  const content = document.createElement("div");
  content.className = "accordion__content";
  const badge = document.createElement("p");
  badge.className = "badge";
  badge.textContent = "Online / Physical";
  const list = document.createElement("ul");
  week.topics.forEach((topic) => {
    const li = document.createElement("li");
    li.textContent = topic;
    list.append(li);
  });
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "Online or in person. You attend in the mode you choose when you register. Class times are sent to the cohort.";
  content.append(badge, list, note);
  inner.append(content);
  panel.append(inner);
  item.append(heading, panel);
  return item;
}

export async function initProgrammePage() {
  const root = document.getElementById("curriculum");
  if (root) {
    try {
      const data = await loadProgramme();
      const group = document.createElement("div");
      group.className = "accordion";
      group.dataset.accordion = "";
      data.months.forEach((month, index) => {
        const item = document.createElement("div");
        item.className = "accordion__item";
        const heading = document.createElement("h2");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "accordion__trigger";
        button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
        const label = document.createElement("span");
        label.textContent = month.title;
        button.append(label, icon("i-chevron"));
        heading.append(button);
        const panel = document.createElement("div");
        panel.className = "accordion__panel";
        const inner = document.createElement("div");
        inner.className = "accordion__inner";
        const content = document.createElement("div");
        content.className = "accordion__content";
        const summary = document.createElement("p");
        summary.textContent = month.summary;
        const weeks = document.createElement("div");
        weeks.className = "accordion";
        weeks.dataset.accordion = "";
        weeks.style.marginTop = "0.8rem";
        month.weeks.forEach((week) => weeks.append(weekPanel(week)));
        content.append(summary, weeks);
        inner.append(content);
        panel.append(inner);
        item.append(heading, panel);
        group.append(item);
      });
      root.replaceChildren(group);
      root.removeAttribute("aria-busy");
      initAccordion(root);
    } catch {
      root.textContent = "The curriculum could not be loaded. Open this site through a local server and refresh.";
    }
  }

  const form = document.getElementById("custom-price-form");
  const success = document.getElementById("custom-price-success");
  if (!form) return;
  bindPasswordToggles(form);

  const rules = {
    name: (value) => (isName(value) ? "" : "Enter your full name."),
    email: (value) => (isEmail(value) ? "" : "Enter a valid email address."),
    phone: (value) => (isPhone(value) ? "" : "Enter a phone number with 8 to 15 digits."),
    mode: (value) => (value ? "" : "Choose online or physical."),
    message: (value) => (clean(value, 2000).length >= 10 ? "" : "Tell us a little more, at least 10 characters.")
  };

  const validate = (name) => {
    const field = form.querySelector(`[data-field="${name}"]`);
    const control = field?.querySelector("input, select, textarea");
    const message = rules[name]?.(control?.value || "") || "";
    setFieldError(field, message);
    return !message;
  };

  form.querySelectorAll("[data-field]").forEach((field) => {
    field.querySelector("input, textarea, select")?.addEventListener("input", () => validate(field.dataset.field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (new FormData(form).get("company")) {
      form.hidden = true;
      if (success) success.hidden = false;
      return;
    }
    const names = Object.keys(rules);
    const ok = names.every((name) => validate(name));
    const summary = document.getElementById("custom-summary");
    if (!ok) {
      if (summary) summary.textContent = "Check the highlighted fields.";
      form.querySelector(".is-invalid input, .is-invalid textarea")?.focus();
      return;
    }
    if (summary) summary.textContent = "";
    const data = new FormData(form);
    const entry = {
      type: "custom-price",
      name: clean(data.get("name"), 80),
      email: clean(data.get("email"), 120).toLowerCase(),
      phone: clean(data.get("phone"), 22),
      mode: clean(data.get("mode"), 20),
      message: clean(data.get("message"), 2000),
      at: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem(KEYS.enquiries) || "[]");
    existing.push(entry);
    localStorage.setItem(KEYS.enquiries, JSON.stringify(existing));
    form.reset();
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus();
    }
  });
}
