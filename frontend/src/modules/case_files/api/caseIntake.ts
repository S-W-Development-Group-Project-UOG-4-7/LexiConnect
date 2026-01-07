import api from "../../../services/api";

export async function getCaseIntake(caseId: number) {
  const res = await api.get(`/cases/${caseId}/intake`);
  return res.data;
}

export async function createCaseIntake(caseId: number, payload: any) {
  const res = await api.post(`/cases/${caseId}/intake`, payload);
  return res.data;
}

export async function updateCaseIntake(caseId: number, payload: any) {
  const res = await api.patch(`/cases/${caseId}/intake`, payload);
  return res.data;
}
