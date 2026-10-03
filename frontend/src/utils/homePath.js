export function homePath(user) {
  if (!user) return "/login";
  if (user.mustChangePassword) return "/change-password";
  if (user.role === "admin") return "/admin";
  if (user.role === "mentor") return "/mentor";
  return "/student";
}
