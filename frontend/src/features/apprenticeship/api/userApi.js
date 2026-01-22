import api from "../../../services/api";

/**
 * Try a few common "me" endpoints.
 * Keep this flexible so your frontend works even if backend path differs.
 */
export async function fetchMe() {
  const candidates = ["/users/me", "/users/profile", "/auth/me", "/me"];
  let lastErr;

  for (const path of candidates) {
    try {
      const res = await api.get(path);
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
}

/**
 * Try to fetch lawyer details by id.
 * If none exist, caller will fallback to "Lawyer #id".
 */
export async function fetchLawyerById(lawyerId) {
  const candidates = [
    `/lawyers/${lawyerId}`,
    `/users/${lawyerId}`,
    `/users/${lawyerId}/profile`,
  ];

  let lastErr;
  for (const path of candidates) {
    try {
      const res = await api.get(path);
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}
