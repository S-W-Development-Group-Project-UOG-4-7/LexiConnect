import api from "../../../services/api";

export async function listCaseDocuments(caseId: number) {
  const res = await api.get(`/cases/${caseId}/documents`);
  return res.data;
}

export async function uploadCaseDocument(caseId: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/cases/${caseId}/documents`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteCaseDocument(caseId: number, docId: number) {
  const res = await api.delete(`/cases/${caseId}/documents/${docId}`);
  return res.data;
}
