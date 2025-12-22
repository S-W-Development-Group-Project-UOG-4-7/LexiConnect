import api from "./api";

// Client: create dispute
export const createDispute = async (payload) => {
  const res = await api.post("/api/disputes", payload);
  return res.data;
};

// Client: my disputes
export const listMyDisputes = async () => {
  const res = await api.get("/api/disputes/my");
  return res.data;
};

// Owner/Admin: get dispute by id
export const getDisputeById = async (id) => {
  const res = await api.get(`/api/disputes/${id}`);
  return res.data;
};

// Owner/Admin: patch dispute (your backend PATCH /api/disputes/{id})
export const updateDispute = async (id, payload) => {
  const res = await api.patch(`/api/disputes/${id}`, payload);
  return res.data;
};
