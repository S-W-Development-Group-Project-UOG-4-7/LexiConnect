import api from "../../../services/api";

const AUDIT_LOGS_ENDPOINT = "/api/admin/audit-logs";

export async function listAuditLogs(params = {}) {
  const { data } = await api.get(AUDIT_LOGS_ENDPOINT, { params });
  return data;
}
