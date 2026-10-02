/** Accordions, tabs, and dialog openers. */

function itemParts(item) {
  const trigger = item.querySelector(":scope > .accordion__trigger, :scope > h2 .accordion__trigger, :scope > h3 .accordion__trigger");
  const panel = item.querySelector(":scope > .accordion__panel");
  return { trigger, panel };
}

function setItem(item, open) {
  const { trigger, panel } = itemParts(item);
  if (!trigger || !panel) return;
  trigger.setAttribute("aria-expanded", open ? "true" : "false");
  panel.classList.toggle("is-open", open);
  try {
    panel.inert = !open;
  } catch {
    /* inert is unavailable */
  }
}

export function initAccordion(scope = document) {
  scope.querySelectorAll("[data-accordion]").forEach((group) => {
    if (group.dataset.ready === "true") return;
    group.dataset.ready = "true";
    const items = [...group.querySelectorAll(":scope > .accordion__item")];
    items.forEach((item) => {
      const { trigger } = itemParts(item);
      if (!trigger) return;
      setItem(item, trigger.getAttribute("aria-expanded") === "true");
      trigger.addEventListener("click", () => {
        const willOpen = trigger.getAttribute("aria-expanded") !== "true";
        items.forEach((other) => setItem(other, false));
        setItem(item, willOpen);
      });
    });
  });
}

export function initTabs(scope = document) {
  scope.querySelectorAll("[data-tabs]").forEach((widget) => {
    const tabs = [...widget.querySelectorAll('[role="tab"]')];
    const panels = [...widget.querySelectorAll('[role="tabpanel"]')];
    if (!tabs.length) return;

    function select(index) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].hidden = !selected;
      });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        select(index);
        tab.focus();
      });
      tab.addEventListener("keydown", (event) => {
        const last = tabs.length - 1;
        let next = null;
        if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
        if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = last;
        if (next === null) return;
        event.preventDefault();
        select(next);
        tabs[next].focus();
      });
    });
  });
}

export function initDialogs() {
  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.open);
      dialog?.showModal();
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

export function icon(id) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `assets/icons/sprite.svg#${id}`);
  svg.append(use);
  return svg;
}

export function formatDate(iso) {
  const value = String(iso);
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
