import api from "../../../services/api";

export const listDocuments = (bookingId) =>
  api.get(`/documents`, { params: { booking_id: bookingId } });

export const uploadDocument = (formData) =>
  api.post(`/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
