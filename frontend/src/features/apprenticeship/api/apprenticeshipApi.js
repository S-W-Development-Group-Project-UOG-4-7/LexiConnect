import api from "../../../services/api";

// Apprentice
export const fetchMyApprenticeCases = async () => {
  const res = await api.get("/apprenticeship/my/cases");
  return res.data;
};

export const fetchApprenticeCaseNotes = async (caseId) => {
  const res = await api.get(`/apprenticeship/cases/${caseId}/notes`);
  return res.data;
};

export const addApprenticeCaseNote = async (caseId, text) => {
  const res = await api.post(`/apprenticeship/cases/${caseId}/notes`, { text });
  return res.data;
};

// Lawyer (Swagger wants apprentice_id, not email)
export const assignApprenticeToCase = async ({ case_id, apprentice_id }) => {
  const res = await api.post("/apprenticeship/assign", {
    case_id,
    apprentice_id,
  });
  return res.data;
};

export const fetchCaseNotesForLawyer = async (caseId) => {
  const res = await api.get(`/apprenticeship/cases/${caseId}/notes`);
  return res.data;
};
