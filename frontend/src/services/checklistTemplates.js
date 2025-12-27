// frontend/src/services/checklistTemplates.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const BASE_URL = `${API_BASE}/api/checklist-templates`;

function getToken() {
  // adjust if your token key is different
  return localStorage.getItem("access_token") || localStorage.getItem("token");
}

async function request(path = "", options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data;
}

export const checklistTemplatesApi = {
  listMine: () => request("/me", { method: "GET" }),
  create: (payload) => request("", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id) => request(`/${id}`, { method: "DELETE" }),
};
