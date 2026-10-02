/**
 * Demo accounts stored in this browser.
 * Passwords are salted and SHA-256 hashed so the form does not keep plain text.
 * This is not production authentication. A live site needs server-side password hashing.
 */

import { KEYS } from "./config.js";
import {
  bindPasswordToggles,
  clean,
  isEmail,
  isName,
  isPhone,
  passwordError,
  passwordStrength,
  setFieldError
} from "./validate.js";

function readStore(store) {
  try {
    const raw = store.getItem(KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSession() {
  return readStore(localStorage) || readStore(sessionStorage);
}

export function setSession(session, remember) {
  localStorage.removeItem(KEYS.session);
  sessionStorage.removeItem(KEYS.session);
  const target = remember ? localStorage : sessionStorage;
  target.setItem(KEYS.session, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
  sessionStorage.removeItem(KEYS.session);
}

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(KEYS.users)) || [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

async function hashPassword(password, salt) {
  if (!crypto.subtle) {
    throw new Error("Password hashing needs a secure page such as http://localhost.");
  }
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function makeSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function initAuthNav() {
  const link = document.getElementById("login-link");
  const session = getSession();
  if (!link || !session) return;
  link.textContent = "Dashboard";
  link.href = "dashboard.html";
  if (document.body.dataset.page === "dashboard") {
    link.setAttribute("aria-current", "page");
  }
}

function bindStrength(input) {
  const meter = document.getElementById("strength-meter");
  const label = document.getElementById("strength-label");
  if (!input || !meter || !label) return;
  input.addEventListener("input", () => {
    const result = passwordStrength(input.value);
    meter.dataset.level = String(result.score);
    meter.querySelector("span").style.width = `${(result.score / 5) * 100}%`;
    label.textContent = `Password strength: ${result.label}`;
  });
}

function requireSecure(summary) {
  if (crypto.subtle) return true;
  if (summary) {
    summary.hidden = false;
    summary.textContent = "Open this site from a local address such as http://localhost. A file:// address cannot create an account.";
  }
  return false;
}

export function initRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;
  const session = getSession();
  const banner = document.getElementById("already-in");
  if (session && banner) {
    banner.hidden = false;
    banner.textContent = `You are signed in as ${session.fullName}. You can open the dashboard or register a different email.`;
  }

  bindPasswordToggles(form);
  bindStrength(document.getElementById("password"));
  const summary = document.getElementById("register-summary");

  const checks = {
    fullName: (data) => (isName(data.get("fullName")) ? "" : "Enter your full name."),
    email: (data) => (isEmail(data.get("email")) ? "" : "Enter a valid email address."),
    phone: (data) => (isPhone(data.get("phone")) ? "" : "Enter a phone number with 8 to 15 digits."),
    country: (data) => (clean(data.get("country"), 60).length >= 2 ? "" : "Enter your country."),
    experience: (data) => (data.get("experience") ? "" : "Choose your experience level."),
    mode: (data) => (data.get("mode") ? "" : "Choose online or physical attendance."),
    plan: (data) => (data.get("plan") ? "" : "Choose a price plan."),
    password: (data) => passwordError(String(data.get("password") || "")),
    confirm: (data) => (data.get("password") === data.get("confirm") ? "" : "Passwords do not match."),
    heard: (data) => (data.get("heard") ? "" : "Tell us how you heard about the mentorship."),
    terms: (data) => (data.get("terms") ? "" : "Accept the terms and the risk disclaimer to continue.")
  };

  const validate = (name, data) => {
    const field = form.querySelector(`[data-field="${name}"]`);
    const message = checks[name](data);
    setFieldError(field, message);
    return !message;
  };

  form.querySelectorAll("[data-field]").forEach((field) => {
    const name = field.dataset.field;
    const handler = () => validate(name, new FormData(form));
    field.addEventListener("input", handler);
    field.addEventListener("change", handler);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireSecure(summary)) return;
    const data = new FormData(form);
    if (String(data.get("company") || "").trim()) {
      form.hidden = true;
      document.getElementById("register-success")?.removeAttribute("hidden");
      return;
    }
    const names = Object.keys(checks);
    const ok = names.every((name) => validate(name, data));
    if (!ok) {
      summary.hidden = false;
      summary.textContent = "Check the highlighted fields before creating the account.";
      form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea")?.focus();
      return;
    }

    const email = clean(data.get("email"), 120).toLowerCase();
    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      setFieldError(form.querySelector('[data-field="email"]'), "An account with this email already exists. Log in instead.");
      summary.hidden = false;
      summary.textContent = "That email is already registered.";
      return;
    }

    const salt = makeSalt();
    const user = {
      id: crypto.randomUUID(),
      fullName: clean(data.get("fullName"), 80),
      email,
      phone: clean(data.get("phone"), 22),
      country: clean(data.get("country"), 60),
      experience: clean(data.get("experience"), 20),
      cohort: "January 2027",
      mode: clean(data.get("mode"), 20),
      plan: clean(data.get("plan"), 20),
      heard: clean(data.get("heard"), 40),
      salt,
      passwordHash: await hashPassword(String(data.get("password")), salt),
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    setSession({
      email: user.email,
      fullName: user.fullName,
      mode: user.mode,
      plan: user.plan,
      cohort: user.cohort,
      experience: user.experience
    }, true);

    form.hidden = true;
    summary.hidden = true;
    const success = document.getElementById("register-success");
    if (success) {
      success.hidden = false;
      success.focus();
    }
    window.setTimeout(() => {
      location.href = "dashboard.html";
    }, 1600);
  });
}

export function initLogin() {
  if (getSession()) {
    location.replace("dashboard.html");
    return;
  }
  const form = document.getElementById("login-form");
  const reset = document.getElementById("reset-form");
  if (!form) return;
  bindPasswordToggles(document);
  const summary = document.getElementById("login-summary");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireSecure(summary)) return;
    const data = new FormData(form);
    const email = clean(data.get("email"), 120).toLowerCase();
    const password = String(data.get("password") || "");
    const emailField = form.querySelector('[data-field="email"]');
    const passwordField = form.querySelector('[data-field="password"]');
    setFieldError(emailField, isEmail(email) ? "" : "Enter the email you registered with.");
    setFieldError(passwordField, password ? "" : "Enter your password.");
    if (!isEmail(email) || !password) {
      summary.hidden = false;
      summary.textContent = "Enter the email and password for your account.";
      return;
    }

    const user = getUsers().find((item) => item.email === email);
    const hash = user ? await hashPassword(password, user.salt) : "";
    if (!user || hash !== user.passwordHash) {
      summary.hidden = false;
      summary.textContent = "Email or password does not match an account.";
      passwordField.querySelector("input")?.focus();
      return;
    }

    setSession({
      email: user.email,
      fullName: user.fullName,
      mode: user.mode,
      plan: user.plan,
      cohort: user.cohort,
      experience: user.experience
    }, Boolean(data.get("remember")));
    const next = new URLSearchParams(location.search).get("next");
    location.href = next === "dashboard.html" ? next : "dashboard.html";
  });

  reset?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireSecure(summary)) return;
    const data = new FormData(reset);
    const email = clean(data.get("email"), 120).toLowerCase();
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    const status = document.getElementById("reset-status");
    const emailError = !isEmail(email) ? "Enter the email on this device." : "";
    const passError = passwordError(password) || (password !== confirm ? "Passwords do not match." : "");
    setFieldError(reset.querySelector('[data-field="reset-email"]'), emailError);
    setFieldError(reset.querySelector('[data-field="reset-password"]'), passError);
    if (emailError || passError) return;

    const users = getUsers();
    const user = users.find((item) => item.email === email);
    if (!user) {
      if (status) status.textContent = "No account with that email was found.";
      return;
    }
    user.salt = makeSalt();
    user.passwordHash = await hashPassword(password, user.salt);
    saveUsers(users);
    reset.reset();
    if (status) status.textContent = "Password updated. You can log in with it now.";
  });
}

export function bindLogout() {
  document.getElementById("logout")?.addEventListener("click", () => {
    clearSession();
    location.replace("login.html");
  });
}
