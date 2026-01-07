import axios from "axios";

const api = axios.create({
  // No baseURL to use Vite proxy for development
});

api.interceptors.request.use((config) => {
  // Try access_token first (as requested), fallback to token for backward compatibility
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

