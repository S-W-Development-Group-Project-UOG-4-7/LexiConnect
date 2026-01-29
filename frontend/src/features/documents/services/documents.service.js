// frontend/src/features/documents/services/documents.service.js
import api from "../../../services/api";

// LIST (booking_id is required by backend)
export const listDocuments = (bookingId) => {
  const id = Number(bookingId);
  return api.get("/api/documents", { params: { booking_id: id } });
};

// UPLOAD (multipart/form-data)
export const uploadDocument = ({ bookingId, fileName, file }) => {
  const id = Number(bookingId);

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Invalid bookingId for uploadDocument()");
  }
  if (!file) {
    throw new Error("No file selected");
  }

  const safeTitle = (fileName || file?.name || "Untitled").trim();

  const fd = new FormData();
  fd.append("booking_id", String(id));

  // backend accepts file_name and title, but file_name is your standard
  fd.append("file_name", safeTitle);

  // optional: also send title (harmless, backend accepts both)
  fd.append("title", safeTitle);

  fd.append("file", file);

  return api.post("/api/documents", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE
export const deleteDocument = (docId) => {
  const id = Number(docId);
  return api.delete(`/api/documents/${id}`);
};

// COMMENTS: LIST
export const listDocumentComments = (docId) => {
  const id = Number(docId);
  return api.get(`/api/documents/${id}/comments`);
};

// COMMENTS: CREATE (lawyer/admin only)
export const createDocumentComment = (docId, commentText) => {
  const id = Number(docId);
  return api.post(`/api/documents/${id}/comments`, {
    comment_text: (commentText || "").trim(),
  });
};
