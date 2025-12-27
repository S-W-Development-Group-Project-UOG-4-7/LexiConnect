import api from "../../../services/api";

export const listDocuments = (bookingId) =>
  api.get(`/api/documents`, { params: { booking_id: bookingId } });

export const uploadDocument = (formData) =>
  api.post(`/api/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  export const deleteDocument = (docId) =>
  api.delete(`/api/documents/${docId}`);