import api from "../../services/api";

export const adminListDisputes = (status = "PENDING") =>
  api.get("/admin/disputes", { params: { status } });

export const adminResolveDispute = (id, payload) =>
  api.patch(`/admin/disputes/${id}/resolve`, payload);
