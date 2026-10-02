/** Shared field checks for the prototype forms. */

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function isPhone(value) {
  const trimmed = String(value).trim();
  if (!/^\+?[0-9\s()-]{8,22}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isName(value) {
  return /^[\p{L}][\p{L}\s.'-]{1,80}$/u.test(String(value).trim());
}

export function clean(value, max = 500) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

export function passwordError(password) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return "Include both upper-case and lower-case letters.";
  }
  if (!/\d/.test(password)) return "Include at least one number.";
  return "";
}

export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const label = score <= 1 ? "Weak" : score <= 3 ? "Fair" : "Strong";
  return { score, label: password ? label : "Empty" };
}

export function setFieldError(field, message) {
  if (!field) return;
  const error = field.querySelector(".field-error");
  const control = field.querySelector("input, select, textarea");
  if (message) {
    field.classList.add("is-invalid");
    if (error) error.textContent = message;
    control?.setAttribute("aria-invalid", "true");
  } else {
    field.classList.remove("is-invalid");
    if (error) error.textContent = "";
    control?.removeAttribute("aria-invalid");
  }
}

export function bindPasswordToggles(scope = document) {
  scope.querySelectorAll("[data-toggle-password]").forEach((button) => {
    const input = document.getElementById(button.getAttribute("aria-controls"));
    if (!input) return;
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
      const use = button.querySelector("use");
      if (use) {
        use.setAttribute("href", `assets/icons/sprite.svg#${show ? "i-eye-off" : "i-eye"}`);
      }
    });
  });
}
