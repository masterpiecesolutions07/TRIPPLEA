import api, { setAccessToken } from "./axiosInstance.js";

export async function registerAccount(payload) {
  const { data } = await api.post("/auth/register", payload);
  setAccessToken(data.accessToken);
  return data.user;
}

export async function loginAccount(payload) {
  const { data } = await api.post("/auth/login", payload);
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logoutAccount() {
  await api.post("/auth/logout");
  setAccessToken("");
}

let refreshInFlight = null;

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = api.post("/auth/refresh").then((response) => {
      setAccessToken(response.data.accessToken);
      return response.data.user;
    }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function changePassword(payload) {
  const { data } = await api.post("/auth/change-password", payload);
  setAccessToken(data.accessToken);
  return data.user;
}
