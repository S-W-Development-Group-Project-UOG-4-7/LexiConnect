// frontend/src/modules/case_files/api/caseChecklist.ts
import api from "../../../services/api";

// POST /cases/{caseId}/checklist/init
export async function initChecklist(caseId: number) {
  const res = await api.post(`/cases/${caseId}/checklist/init`);
  return res.data;
}

// GET /cases/{caseId}/checklist
export async function getChecklist(caseId: number) {
  const res = await api.get(`/cases/${caseId}/checklist`);
  return res.data;
}

// GET /cases/{caseId}/checklist/is-complete
export async function getChecklistIsComplete(caseId: number) {
  const res = await api.get(`/cases/${caseId}/checklist/is-complete`);
  return res.data;
}
