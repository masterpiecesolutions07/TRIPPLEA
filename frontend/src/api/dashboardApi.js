import api from "./axiosInstance.js";

export async function getOverview() {
  const { data } = await api.get("/staff/overview");
  return data;
}

export async function getCollection(name) {
  const { data } = await api.get(`/staff/${name}`);
  return data.items;
}

export async function setApplicationStatus(id, status) {
  const { data } = await api.patch(`/staff/applications/${id}/status`, { status });
  return data.item;
}

export async function createCohort(payload) {
  const { data } = await api.post("/staff/cohorts", payload);
  return data.item;
}

export async function getStudentHome() {
  const { data } = await api.get("/student/home");
  return data;
}

export async function getStudentSessions() {
  const { data } = await api.get("/student/sessions");
  return data.items;
}

export async function getNotifications() {
  const { data } = await api.get("/student/notifications");
  return data.items;
}

export async function submitStory(payload) {
  const { data } = await api.post("/student/stories", payload);
  return data.item;
}

export async function getUsers() {
  const { data } = await api.get("/admin/users");
  return data.items;
}

export async function setUserRole(id, role) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data.item;
}

export async function createMentor(payload) {
  const { data } = await api.post("/admin/mentors", payload);
  return data.item;
}

export async function getAudit() {
  const { data } = await api.get("/admin/audit-logs");
  return data.items;
}

export async function getAnalytics() {
  const { data } = await api.get("/admin/analytics");
  return data;
}

export async function getSettings() {
  const { data } = await api.get("/admin/settings");
  return data.item;
}

export async function saveSettings(payload) {
  const { data } = await api.patch("/admin/settings", payload);
  return data.item;
}

export async function getFaqs() {
  const { data } = await api.get("/admin/faqs");
  return data.items;
}

export async function saveFaqs(items) {
  const { data } = await api.put("/admin/faqs", { items });
  return data.items;
}
