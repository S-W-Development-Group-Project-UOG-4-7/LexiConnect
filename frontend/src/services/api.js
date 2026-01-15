import axios from "axios";

// Single shared axios client.
// Uses Vite proxy in dev via relative /api
// Can be overridden via VITE_API_BASE_URL for production
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Token-based auth; no cookies required
  withCredentials: false,
});

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const getAccessToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken");

const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const saveTokens = ({ access, refresh }) => {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem("token", access);
  }
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

let refreshPromise = null;

const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;
  const refresh = getRefreshToken();
  if (!refresh) {
    return Promise.reject(new Error("No refresh token"));
  }
  refreshPromise = api
    .post(
      "/auth/refresh",
      { refresh_token: refresh },
      { skipAuthRefresh: true }
    )
    .then((response) => {
      const { access_token, refresh_token } = response.data || {};
      saveTokens({ access: access_token, refresh: refresh_token });
      return access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// Attach auth token automatically if present
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize backend error payloads into a readable message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config || {};

    const detail =
      error?.response?.data?.detail || error?.response?.data?.message;
    if (detail) {
      error.message = detail;
    }

    const status = error?.response?.status;
    const shouldAttemptRefresh =
      status === 401 && !originalRequest._retry && !originalRequest?.skipAuthRefresh;

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    return refreshToken()
      .then((newAccess) => {
        if (newAccess) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalRequest);
      })
      .catch((refreshErr) => {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      });
  }
);

// Note: A second response interceptor for detail normalization is unnecessary;
// the logic above already normalizes and handles refresh.

export default api;
