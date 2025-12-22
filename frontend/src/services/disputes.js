import api from "./api";

// Client: create dispute
export const createDispute = (payload) => api.post("/api/disputes", payload);

// Client: my disputes
export const listMyDisputes = () => api.get("/api/disputes/my");

// Get dispute by id
export const getDisputeById = (id) => api.get(`/api/disputes/${id}`);

// Update dispute
export const updateDispute = (id, payload) => api.patch(`/api/disputes/${id}`, payload);

// Admin: List disputes with optional status filter
export const adminListDisputes = (status = "PENDING") =>
  api.get(`/api/disputes${status ? `?status=${status}` : ''}`);

// Admin: Update dispute (admin version)
export const adminUpdateDispute = (id, payload) =>
  api.patch(`/api/disputes/${id}`, payload);
