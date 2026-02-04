import api from "../../../services/api";

const AUTH_LOGS_ENDPOINT = "/api/admin/auth-logs";

export async function listAuthLogs(params = {}) {
  const { data } = await api.get(AUTH_LOGS_ENDPOINT, { params });
  return data;
}
