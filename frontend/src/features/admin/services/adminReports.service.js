import api from "../../../services/api";

export const downloadWeeklyReport = (days = 7) =>
  api.get("/api/admin/reports/weekly-activity.csv", {
    params: { days },
    responseType: "blob",
  });

export const downloadKycSummary = () =>
  api.get("/api/admin/reports/kyc-summary.csv", { responseType: "blob" });

export const downloadBookingSummary = (days = 30) =>
  api.get("/api/admin/reports/booking-summary.csv", {
    params: { days },
    responseType: "blob",
  });

export const downloadAuditTrail = (days = 30, page = 1, pageSize = 500) =>
  api.get("/api/admin/reports/audit-trail.json", {
    params: { days, page, page_size: pageSize },
    responseType: "blob",
  });
