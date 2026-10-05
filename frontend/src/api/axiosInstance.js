import axios from "axios";

function apiBase() {
  const raw = String(import.meta.env.VITE_API_URL || "/api/v1").trim().replace(/\/$/, "");
  if (!raw || raw.endsWith("/api/v1")) return raw || "/api/v1";
  return `${raw}/api/v1`;
}

const api = axios.create({
  baseURL: apiBase(),
  withCredentials: true
});

let accessToken = "";
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token || "";
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";
    if (status !== 401 || original?._retry || url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise ||= api.post("/auth/refresh").then((response) => {
      setAccessToken(response.data.accessToken);
      return response.data;
    }).finally(() => {
      refreshPromise = null;
    });
    try {
      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      setAccessToken("");
      return Promise.reject(refreshError);
    }
  }
);

export default api;
