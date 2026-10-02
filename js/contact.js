/** Contact form validation. Messages stay in this browser. */

import { KEYS } from "./config.js";
import { clean, isEmail, isName, isPhone, setFieldError } from "./validate.js";

export function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const summary = document.getElementById("contact-summary");
  const success = document.getElementById("contact-success");

  const checks = {
    name: (data) => (isName(data.get("name")) ? "" : "Enter your name."),
    email: (data) => (isEmail(data.get("email")) ? "" : "Enter a valid email address."),
    phone: (data) => (isPhone(data.get("phone")) ? "" : "Enter a phone number with 8 to 15 digits."),
    subject: (data) => (data.get("subject") ? "" : "Choose a subject."),
    message: (data) => (clean(data.get("message"), 2000).length >= 10 ? "" : "Write a message of at least 10 characters.")
  };

  const validate = (name, data) => {
    const field = form.querySelector(`[data-field="${name}"]`);
    const message = checks[name](data);
    setFieldError(field, message);
    return !message;
  };

  form.querySelectorAll("[data-field]").forEach((field) => {
    const handler = () => validate(field.dataset.field, new FormData(form));
    field.addEventListener("input", handler);
    field.addEventListener("change", handler);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (String(data.get("company") || "").trim()) {
      form.hidden = true;
      if (success) success.hidden = false;
      return;
    }
    const ok = Object.keys(checks).every((name) => validate(name, data));
    if (!ok) {
      summary.hidden = false;
      summary.textContent = "Check the highlighted fields.";
      form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea")?.focus();
      return;
    }
    const entry = {
      type: "contact",
      name: clean(data.get("name"), 80),
      email: clean(data.get("email"), 120).toLowerCase(),
      phone: clean(data.get("phone"), 22),
      subject: clean(data.get("subject"), 40),
      message: clean(data.get("message"), 2000),
      at: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem(KEYS.enquiries) || "[]");
    existing.push(entry);
    localStorage.setItem(KEYS.enquiries, JSON.stringify(existing));
    summary.hidden = true;
    form.hidden = true;
    if (success) {
      success.hidden = false;
      const name = success.querySelector("[data-success-name]");
      if (name) name.textContent = entry.name;
      success.focus();
    }
  });
}
