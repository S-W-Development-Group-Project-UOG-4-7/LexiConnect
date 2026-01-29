import axios from "axios";

/**
 * Keep env as ORIGIN (no /api):
 * VITE_API_BASE_URL=http://127.0.0.1:8000
 *
 * This client will automatically ensure API calls go to /api
 * while still allowing existing code that already uses "/api/..."
 */
const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    // Attach auth token
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Normalize URL to always hit /api, but DON'T break:
    // - already "/api/..." ✅ keep
    // - "/uploads/..." ✅ keep (static files)
    // - absolute http(s) ✅ keep
    const url = config.url || "";

    if (typeof url === "string") {
      const isAbsolute = url.startsWith("http://") || url.startsWith("https://");
      const isUploads = url.startsWith("/uploads");

      if (!isAbsolute && !isUploads) {
        // ensure leading slash
        const u = url.startsWith("/") ? url : `/${url}`;

        // prefix /api if missing
        config.url = u.startsWith("/api") ? u : `/api${u}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
