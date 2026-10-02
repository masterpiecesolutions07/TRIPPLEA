/** Scroll reveal, counters, demo ticker, typing line, and testimonial slider. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const PAIRS = [
  { symbol: "EUR/USD", price: 1.0864, digits: 4, vol: 0.00018 },
  { symbol: "GBP/USD", price: 1.3126, digits: 4, vol: 0.00026 },
  { symbol: "XAU/USD", price: 2648.2, digits: 2, vol: 0.42 },
  { symbol: "USD/JPY", price: 147.82, digits: 2, vol: 0.04 }
];

export function initReveal() {
  const nodes = [...new Set([
    ...document.querySelectorAll("[data-reveal]"),
    ...document.querySelectorAll(".card-grid > .card, .feature-grid > .card, .price-grid > .card, .roadmap > .card, .update-card, .timeline > li")
  ])];
  if (!nodes.length || reduceMotion.matches || !("IntersectionObserver" in window)) return;
  nodes.forEach((node) => {
    const siblings = [...node.parentElement.children];
    const index = siblings.indexOf(node);
    node.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 80}ms`);
    node.classList.add("will-reveal");
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  nodes.forEach((node) => observer.observe(node));
}

export function initCounters() {
  const nodes = [...document.querySelectorAll("[data-count]")];
  if (!nodes.length) return;

  const paint = (node, value) => {
    const suffix = node.dataset.suffix || "";
    node.textContent = `${value}${suffix}`;
  };

  const run = (node) => {
    const target = Number(node.dataset.count);
    if (reduceMotion.matches) {
      paint(node, target);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      paint(node, Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(run);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  nodes.forEach((node) => observer.observe(node));
}

function renderTicker(track, copies) {
  track.replaceChildren();
  for (let copy = 0; copy < copies; copy += 1) {
    PAIRS.forEach((pair) => {
      const item = document.createElement("p");
      item.className = "ticker__item";
      if (copy > 0) item.setAttribute("aria-hidden", "true");
      const name = document.createElement("span");
      name.textContent = `${pair.symbol} · simulated`;
      const price = document.createElement("strong");
      price.dataset.symbol = pair.symbol;
      price.textContent = pair.price.toFixed(pair.digits);
      const move = document.createElement("em");
      move.dataset.move = pair.symbol;
      move.textContent = "0.00";
      item.append(name, price, move);
      track.append(item);
    });
  }
}

export function initTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;
  const copies = reduceMotion.matches ? 1 : 2;
  renderTicker(track, copies);
  if (!reduceMotion.matches) track.setAttribute("aria-hidden", "true");

  window.setInterval(() => {
    PAIRS.forEach((pair) => {
      const delta = (Math.random() - 0.48) * pair.vol;
      pair.price = Math.max(0, pair.price + delta);
      const text = pair.price.toFixed(pair.digits);
      document.querySelectorAll(`[data-symbol="${pair.symbol}"]`).forEach((node) => {
        node.textContent = text;
      });
      document.querySelectorAll(`[data-move="${pair.symbol}"]`).forEach((node) => {
        const up = delta >= 0;
        node.textContent = `${up ? "+" : "−"}${Math.abs(delta).toFixed(pair.digits)}`;
        node.className = up ? "ticker__up" : "ticker__down";
      });
      const hero = document.getElementById("hero-quote");
      if (hero && pair.symbol === "EUR/USD") {
        hero.textContent = text;
      }
    });
  }, 2600);
}

export function initTyping() {
  const heading = document.querySelector("[data-typing]");
  if (!heading) return;
  const full = heading.textContent.trim();
  if (!full || reduceMotion.matches) return;
  const hidden = document.createElement("span");
  hidden.className = "visually-hidden";
  hidden.textContent = full;
  const visual = document.createElement("span");
  visual.className = "is-typing gradient-text";
  visual.setAttribute("aria-hidden", "true");
  heading.classList.remove("gradient-text");
  heading.replaceChildren(hidden, visual);
  let index = 0;
  const step = () => {
    index += 1;
    visual.textContent = full.slice(0, index);
    if (index < full.length) {
      window.setTimeout(step, 32);
    } else {
      visual.classList.remove("is-typing");
    }
  };
  step();
}

export function initSlider() {
  const root = document.querySelector("[data-slider]");
  if (!root) return;
  const track = root.querySelector(".slider__track");
  const slides = [...track.children];
  const dotsWrap = root.querySelector(".slider__dots");
  let index = 0;
  let timer = 0;

  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `Testimonial ${i + 1} of ${slides.length}`);
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => go(i, true));
    dotsWrap.append(dot);
  });

  function go(next, fromUser) {
    index = (next + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dotsWrap.children].forEach((dot, i) => {
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (fromUser) restart();
  }

  function restart() {
    window.clearInterval(timer);
    if (reduceMotion.matches) return;
    timer = window.setInterval(() => go(index + 1, false), 6500);
  }

  root.querySelector("[data-slider-prev]")?.addEventListener("click", () => go(index - 1, true));
  root.querySelector("[data-slider-next]")?.addEventListener("click", () => go(index + 1, true));
  root.addEventListener("mouseenter", () => window.clearInterval(timer));
  root.addEventListener("mouseleave", restart);
  root.addEventListener("focusin", () => window.clearInterval(timer));
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) restart();
  });

  let startX = 0;
  track.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });
  track.addEventListener("pointerup", (event) => {
    const delta = event.clientX - startX;
    if (delta > 48) go(index - 1, true);
    if (delta < -48) go(index + 1, true);
  });

  root.tabIndex = 0;
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1, true);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1, true);
    }
  });

  go(0, false);
  restart();
}
