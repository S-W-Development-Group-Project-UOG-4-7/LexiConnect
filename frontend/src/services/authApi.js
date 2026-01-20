import axios from "axios";

const authApi = axios.create({
  // ✅ go directly to backend (no Vite proxy)
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || "http://127.0.0.1:8000/auth",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  withCredentials: false,
});

export default authApi;
