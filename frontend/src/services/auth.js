// Basic JWT helpers for frontend-only role checks (no signature verification)

export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
};

const decodePayload = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getUserFromToken = () => decodePayload(getToken());

export const getRole = () => {
  const payload = getUserFromToken();
  return payload?.role ?? null;
};

export const isLoggedIn = () => Boolean(getToken());

