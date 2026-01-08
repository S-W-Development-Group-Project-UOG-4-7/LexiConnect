import api from "./api";

// Create
export const createServicePackage = async (payload) => {
  const res = await api.post("/api/service-packages", payload);
  return res.data;
};

// Read my packages
export const getMyServicePackages = async () => {
  const res = await api.get("/api/service-packages/me");
  return res.data;
};

// Update
export const updateServicePackage = async (id, payload) => {
  const res = await api.patch(`/api/service-packages/${id}`, payload);
  return res.data;
};

// Delete
export const deleteServicePackage = async (id) => {
  await api.delete(`/api/service-packages/${id}`);
};
