import api from "../../../services/api";

// ✅ Apprentice
export const fetchMyApprenticeCases = async () => {
  const res = await api.get("/api/apprenticeship/my/cases"); // ✅ add /api
  return res.data;
};

export const fetchApprenticeCaseNotes = async (caseId) => {
  const res = await api.get(`/api/apprenticeship/cases/${caseId}/notes`); // ✅ add /api
  return res.data;
};

export const addApprenticeCaseNote = async (caseId, text) => {
  // ✅ Swagger expects { note: "..." } (and DB column is "note")
  const res = await api.post(`/api/apprenticeship/cases/${caseId}/notes`, {
    note: text,
  });
  return res.data;
};

// ✅ Lawyer
export const assignApprenticeToCase = async ({ case_id, apprentice_id }) => {
  const res = await api.post("/api/apprenticeship/assign", { // ✅ add /api
    case_id,
    apprentice_id,
  });
  return res.data;
};

export const fetchCaseNotesForLawyer = async (caseId) => {
  const res = await api.get(`/api/apprenticeship/cases/${caseId}/notes`); // ✅ add /api
  return res.data;
};
