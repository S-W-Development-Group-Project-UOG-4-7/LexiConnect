import api from "../../../services/api";

export async function getAuthLoginsPerMinute(minutes = 60) {
  const { data } = await api.get("/api/admin/metrics/auth-logins-per-minute", {
    params: { minutes },
  });
  return data;
}

export async function getAuditTopActions(days = 7, limit = 8) {
  const { data } = await api.get("/api/admin/metrics/audit-top-actions", {
    params: { days, limit },
  });
  return data;
}

export async function getSystemActivityDistribution(days = 7) {
  const { data } = await api.get("/api/admin/metrics/system-activity-distribution", {
    params: { days },
  });
  return data;
}

export async function getBookingOutcomeDistribution(days = 30) {
  const { data } = await api.get("/api/admin/metrics/booking-outcome-distribution", {
    params: { days },
  });
  return data;
}

export async function getBookingStatusDistribution(days = 30) {
  const { data } = await api.get("/api/admin/metrics/booking-status-distribution", {
    params: { days },
  });
  return data;
}

export async function getKycStatusDistribution() {
  const { data } = await api.get("/api/admin/metrics/kyc-status-distribution");
  return data;
}
