import api from "../../../services/api";

export async function getChecklistStatus(caseId, servicePackageId) {
  const res = await api.get(
    `/api/checklist-templates/cases/${caseId}/checklist/status`,
    { params: { service_package_id: servicePackageId } }
  );
  return res.data;
}

export async function getCaseChecklistAnswers(caseId) {
  const res = await api.get(`/api/cases/${caseId}/checklist/answers`);
  return res.data;
}

export async function saveCaseChecklistAnswer(caseId, payload) {
  const res = await api.post(`/api/cases/${caseId}/checklist/answers`, payload);
  return res.data;
}

export async function uploadDocument(formData) {
  // assumes POST /api/documents accepts multipart/form-data
  const res = await api.post(`/api/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getRequiredTemplates(servicePackageId) {
  const res = await api.get(`/api/checklist-templates/service-packages/${servicePackageId}/required`);
  return res.data;
}
