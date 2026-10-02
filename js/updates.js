/** Updates feed, search, and the notification bell. */

import { formatDate } from "./ui.js";
import { KEYS } from "./config.js";

let request;

export function loadUpdates() {
  if (!request) {
    request = fetch("data/updates.json").then((response) => {
      if (!response.ok) throw new Error("Could not load updates.");
      return response.json();
    });
  }
  return request;
}

function readSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEYS.read)) || []);
  } catch {
    return new Set();
  }
}

export function markRead(id) {
  const ids = readSet();
  ids.add(id);
  localStorage.setItem(KEYS.read, JSON.stringify([...ids]));
  document.dispatchEvent(new CustomEvent("triplea:reads"));
}

function byDate(a, b) {
  return String(b.date).localeCompare(String(a.date));
}

export async function initBell() {
  const button = document.getElementById("notify-btn");
  const panel = document.getElementById("notify-panel");
  const list = document.getElementById("notify-list");
  const badge = document.getElementById("notify-badge");
  if (!button || !panel || !list || !badge) return;

  let items = [];
  try {
    items = await loadUpdates();
  } catch {
    list.replaceChildren();
    const item = document.createElement("li");
    item.className = "notify__empty";
    item.textContent = "Updates could not be loaded. Use a local server so the JSON file can be fetched.";
    list.append(item);
  }

  const render = () => {
    const read = readSet();
    const unread = items.filter((item) => !read.has(item.id)).length;
    badge.hidden = unread === 0;
    badge.textContent = String(unread);
    button.setAttribute("aria-label", unread ? `Notifications, ${unread} unread` : "Notifications, none unread");
    const latest = [...items].sort(byDate).slice(0, 5);
    if (!latest.length) return;
    list.replaceChildren();
    latest.forEach((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.className = `notify__item${read.has(item.id) ? "" : " is-unread"}`;
      link.href = `updates.html?id=${encodeURIComponent(item.id)}`;
      const title = document.createElement("span");
      title.textContent = item.title;
      const time = document.createElement("small");
      time.dateTime = item.date;
      time.textContent = formatDate(item.date);
      link.append(title, time);
      li.append(link);
      list.append(li);
    });
  };

  render();
  document.addEventListener("triplea:reads", render);

  const close = () => {
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target) && event.target !== button) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function fillModal(dialog, item) {
  dialog.querySelector("#update-category").textContent = item.category;
  dialog.querySelector("#update-title").textContent = item.title;
  dialog.querySelector("#update-meta").textContent = `${formatDate(item.date)} · ${item.author || "Tripple A"}`;
  const body = dialog.querySelector("#update-body");
  body.replaceChildren();
  String(item.body || "").split(/\n\n+/).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    body.append(p);
  });
}

export async function initLatest() {
  const root = document.getElementById("latest-updates");
  if (!root) return;
  try {
    const items = [...await loadUpdates()].sort(byDate).slice(0, 3);
    root.replaceChildren();
    items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "update-card lift";
      const tag = document.createElement("p");
      tag.className = "tag";
      tag.textContent = item.category;
      const title = document.createElement("h3");
      title.textContent = item.title;
      const summary = document.createElement("p");
      summary.className = "note";
      summary.textContent = item.summary;
      const foot = document.createElement("div");
      foot.className = "update-card__foot";
      const time = document.createElement("time");
      time.dateTime = item.date;
      time.textContent = formatDate(item.date);
      const link = document.createElement("a");
      link.className = "update-card__link";
      link.href = `updates.html?id=${encodeURIComponent(item.id)}`;
      link.textContent = "Read update";
      foot.append(time, link);
      article.append(tag, title, summary, foot);
      root.append(article);
    });
    root.removeAttribute("aria-busy");
  } catch {
    root.textContent = "Updates will load when this site is opened through a local server.";
    root.removeAttribute("aria-busy");
  }
}

export async function initUpdatesPage() {
  const feed = document.getElementById("feed");
  const dialog = document.getElementById("update-modal");
  if (!feed || !dialog) return;

  let items = [];
  try {
    items = await loadUpdates();
  } catch {
    feed.textContent = "The updates file could not be loaded. Start a local server in this project folder and refresh.";
    return;
  }

  const filters = document.getElementById("filters");
  const search = document.getElementById("update-search");
  const count = document.getElementById("result-count");
  let category = "All";
  let query = "";

  const openItem = (item) => {
    fillModal(dialog, item);
    markRead(item.id);
    dialog.showModal();
  };

  const render = () => {
    const q = query.trim().toLowerCase();
    const visible = items
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => {
        if (!q) return true;
        return `${item.title} ${item.summary} ${item.body} ${item.category}`.toLowerCase().includes(q);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || byDate(a, b));

    feed.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "note";
      empty.textContent = "No updates match that filter.";
      feed.append(empty);
    }

    visible.forEach((item) => {
      const article = document.createElement("article");
      article.className = item.pinned ? "update-card is-pinned" : "update-card";
      article.id = item.id;
      const tags = document.createElement("div");
      tags.className = "update-card__tags";
      const tag = document.createElement("p");
      tag.className = "tag";
      tag.textContent = item.category;
      tags.append(tag);
      if (item.pinned) {
        const pin = document.createElement("p");
        pin.className = "badge badge--gold";
        pin.textContent = "Pinned";
        tags.append(pin);
      }
      const title = document.createElement("h2");
      title.textContent = item.title;
      const summary = document.createElement("p");
      summary.className = "note";
      summary.textContent = item.summary;
      const foot = document.createElement("div");
      foot.className = "update-card__foot";
      const time = document.createElement("time");
      time.dateTime = item.date;
      time.textContent = formatDate(item.date);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "update-card__link";
      button.textContent = "Read update";
      button.addEventListener("click", () => openItem(item));
      foot.append(time, button);
      article.append(tags, title, summary, foot);
      feed.append(article);
    });

    if (count) {
      count.textContent = `${visible.length} update${visible.length === 1 ? "" : "s"}`;
    }
  };

  filters?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    category = button.dataset.category;
    filters.querySelectorAll("button").forEach((item) => {
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    render();
  });

  search?.addEventListener("input", () => {
    query = search.value;
    render();
  });

  render();

  const requested = new URLSearchParams(location.search).get("id");
  const match = items.find((item) => item.id === requested);
  if (match) openItem(match);
}
