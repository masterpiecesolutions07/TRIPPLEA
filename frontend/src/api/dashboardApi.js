import api from "./axiosInstance.js";
import { dropCache, readCache } from "./dashboardCache.js";

export function getOverview() {
  return readCache("staff:overview", async () => {
    const { data } = await api.get("/staff/overview");
    return data;
  });
}

export function getCollection(name) {
  return readCache(`staff:list:${name}`, async () => {
    const { data } = await api.get(`/staff/${name}`);
    return data.items;
  });
}

export async function setApplicationStatus(id, status) {
  const { data } = await api.patch(`/staff/applications/${id}/status`, { status });
  dropCache("staff:applications");
  dropCache("staff:list:students");
  dropCache("staff:overview");
  return data.item;
}

export function getApplications({ status = "", q = "" } = {}) {
  return readCache(`staff:applications:${status}:${q}`, async () => {
    const { data } = await api.get("/staff/applications", { params: { status, q } });
    return data.items;
  });
}

export async function removeApplication(id) {
  const { data } = await api.delete(`/staff/applications/${id}`);
  dropCache("staff:applications");
  dropCache("staff:overview");
  return data.message;
}

export function getPeople({ role = "", status = "", q = "" } = {}) {
  return readCache(`staff:people:${role}:${status}:${q}`, async () => {
    const { data } = await api.get("/staff/users", { params: { role, status, q } });
    return data.items;
  });
}

export async function setAccountStatus(id, isActive) {
  const { data } = await api.patch(`/staff/users/${id}/status`, { isActive });
  dropCache("staff:people");
  dropCache("staff:list:students");
  return data;
}

export async function createCohort(payload) {
  const { data } = await api.post("/staff/cohorts", payload);
  dropCache("staff:list:cohorts");
  dropCache("staff:overview");
  return data.item;
}

export async function addCohortStudents(id, applicationIds) {
  const { data } = await api.post(`/staff/cohorts/${id}/students`, { applicationIds });
  dropCache("staff:list:cohorts");
  dropCache("staff:applications");
  dropCache("staff:list:students");
  dropCache("staff:overview");
  return data.message;
}

export function getSessions() {
  return readCache("staff:sessions", async () => {
    const { data } = await api.get("/staff/sessions");
    return data.items;
  });
}

export async function createSession(payload) {
  const { data } = await api.post("/staff/sessions", payload);
  dropCache("staff:sessions");
  return data.item;
}

export async function removeSession(id) {
  const { data } = await api.delete(`/staff/sessions/${id}`);
  dropCache("staff:sessions");
  return data.message;
}

export async function createRecord(resource, payload) {
  const { data } = await api.post(`/staff/${resource}`, payload);
  dropCache(`staff:list:${resource}`);
  return data.item;
}

export async function updateApplication(id, payload) {
  const { data } = await api.patch(`/staff/applications/${id}`, payload);
  dropCache("staff:applications");
  dropCache("staff:list:students");
  return data.item;
}

export async function sendPaymentAlert(id, message) {
  const { data } = await api.post(`/staff/applications/${id}/payment-alert`, { message });
  return data.message;
}

export async function updateMessageStatus(id, status) {
  const { data } = await api.patch(`/staff/messages/${id}/status`, { status });
  dropCache("staff:list:messages");
  return data.item;
}

export async function updateStudent(id, payload) {
  const { data } = await api.patch(`/staff/students/${id}`, payload);
  dropCache("staff:list:students");
  return data.item;
}

export async function saveProfile(payload) {
  const { data } = await api.patch("/staff/profile", payload);
  dropCache("student:home");
  return data.user;
}

export async function saveAvatar(image) {
  const { data } = await api.patch("/auth/profile", { image });
  dropCache("student:home");
  return data.user;
}

export function getStudentHome() {
  return readCache("student:home", async () => {
    const { data } = await api.get("/student/home");
    return data;
  });
}

export function getCourse() {
  return readCache("student:course", async () => {
    const { data } = await api.get("/course");
    return data;
  });
}

export function getLesson(id) {
  return readCache(`student:lesson:${id}`, async () => {
    const { data } = await api.get(`/course/lessons/${id}`);
    return data.lesson;
  });
}

export async function completeLesson(id) {
  const { data } = await api.post(`/course/lessons/${id}/complete`);
  dropCache("student:course");
  dropCache("student:lesson");
  return data;
}

export async function saveLessonNotes(id, notes) {
  const { data } = await api.patch(`/course/lessons/${id}/notes`, { notes });
  dropCache(`student:lesson:${id}`);
  return data;
}

export function getStudentSessions() {
  return readCache("student:sessions", async () => {
    const { data } = await api.get("/student/sessions");
    return data.items;
  });
}

export function getNotifications() {
  return readCache("student:notes", async () => {
    const { data } = await api.get("/student/notifications");
    return data.items;
  });
}

export async function setNotificationRead(id, read) {
  const { data } = await api.patch(`/student/notifications/${id}`, { read });
  dropCache("student:notes");
  return data.message;
}

export async function removeNotification(id) {
  const { data } = await api.delete(`/student/notifications/${id}`);
  dropCache("student:notes");
  return data.message;
}

export async function clearNotifications() {
  const { data } = await api.delete("/student/notifications");
  dropCache("student:notes");
  return data.message;
}

export async function submitStory(payload) {
  const { data } = await api.post("/student/stories", payload);
  dropCache("student:stories");
  dropCache("staff:list:posts");
  return data.item;
}

export function getMyStories() {
  return readCache("student:stories", async () => {
    const { data } = await api.get("/student/stories");
    return data.items;
  });
}

export async function setStoryPublished(id, published) {
  const { data } = await api.patch(`/staff/posts/${id}/publish`, { published });
  dropCache("staff:list:posts");
  dropCache("student:stories");
  return data.item;
}

export function getUsers() {
  return readCache("admin:users", async () => {
    const { data } = await api.get("/admin/users");
    return data.items;
  });
}

export async function setUserRole(id, role) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  dropCache("admin:users");
  dropCache("staff:people");
  return data.item;
}

export async function createMentor(payload) {
  const { data } = await api.post("/admin/mentors", payload);
  dropCache("admin:users");
  dropCache("staff:people");
  return data.item;
}

export function getAudit() {
  return readCache("admin:audit", async () => {
    const { data } = await api.get("/admin/audit-logs");
    return data.items;
  });
}

export function getAnalytics() {
  return readCache("admin:analytics", async () => {
    const { data } = await api.get("/admin/analytics");
    return data;
  });
}

export function getSettings() {
  return readCache("admin:settings", async () => {
    const { data } = await api.get("/admin/settings");
    return data.item;
  });
}

export async function saveSettings(payload) {
  const { data } = await api.patch("/admin/settings", payload);
  dropCache("admin:settings");
  return data.item;
}

export function getFaqs() {
  return readCache("admin:faqs", async () => {
    const { data } = await api.get("/admin/faqs");
    return data.items;
  });
}

export async function saveFaqs(items) {
  const { data } = await api.put("/admin/faqs", { items });
  dropCache("admin:faqs");
  return data.items;
}

export function getManagedCourse() {
  return readCache("staff:course", async () => {
    const { data } = await api.get("/staff/course");
    return data;
  });
}

export async function saveCourseSettings(payload) {
  const { data } = await api.patch("/staff/course", payload);
  dropCache("staff:course");
  dropCache("student:course");
  return data;
}

export async function uploadCourseFile(image) {
  const { data } = await api.post("/staff/course/files", { image });
  return data.url;
}

function savedCourse(data) {
  dropCache("staff:course");
  dropCache("student:course");
  dropCache("student:lesson");
  return data;
}

export async function saveCourseItem(kind, id, payload) {
  const path = id ? `/staff/course/${kind}/${id}` : `/staff/course/${kind}`;
  const { data } = id ? await api.patch(path, payload) : await api.post(path, payload);
  return savedCourse(data);
}

export async function duplicateCourseItem(kind, id) {
  const { data } = await api.post(`/staff/course/${kind}/${id}/duplicate`);
  return savedCourse(data);
}

export async function hideCourseItem(kind, id) {
  const { data } = await api.delete(`/staff/course/${kind}/${id}`);
  return savedCourse(data);
}

export async function removeCourseItem(kind, id) {
  const { data } = await api.delete(`/staff/course/${kind}/${id}`, { params: { permanent: 1 } });
  return savedCourse(data);
}

export async function reorderCourseItems(payload) {
  const { data } = await api.post("/staff/course/reorder", payload);
  return savedCourse(data);
}

export function getEnrollments() {
  return readCache("staff:enrollments", async () => {
    const { data } = await api.get("/staff/enrollments");
    return data;
  });
}

export function getEnrollment(id) {
  return readCache(`staff:enrollment:${id}`, async () => {
    const { data } = await api.get(`/staff/enrollments/${id}`);
    return data;
  });
}

function savedEnrollment(data) {
  dropCache("staff:enrollments");
  dropCache("staff:enrollment");
  return data;
}

export async function openEnrollment(payload) {
  const { data } = await api.post("/staff/enrollments/open", payload);
  return savedEnrollment(data);
}

export async function updateEnrollmentStatus(id, payload) {
  const { data } = await api.patch(`/staff/enrollments/${id}/status`, payload);
  return savedEnrollment(data);
}

export async function updateEnrollmentAccess(id, payload) {
  const { data } = await api.patch(`/staff/enrollments/${id}/access`, payload);
  return savedEnrollment(data);
}

export async function updateEnrollments(payload) {
  const { data } = await api.post("/staff/enrollments/bulk", payload);
  return savedEnrollment(data);
}

export async function extendCohortAccess(payload) {
  const { data } = await api.post("/staff/enrollments/cohort-access", payload);
  return savedEnrollment(data);
}

export async function removeEnrollment(id) {
  const { data } = await api.delete(`/staff/enrollments/${id}`, { params: { permanent: 1 } });
  return savedEnrollment(data);
}
