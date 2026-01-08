// Simple auth utility to check login state.
// Mirrors the token lookup used by the shared axios client (services/api.js).
export function isLoggedIn() {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("token");
  return Boolean(token);
}
