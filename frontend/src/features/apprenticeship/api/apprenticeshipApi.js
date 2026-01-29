import api from "../../../services/api";

// ✅ Users
export const fetchMe = async () => {
  const res = await api.get("/api/users/me");
  return res.data;
};

export const fetchUserById = async (userId) => {
  const res = await api.get(`/api/users/${userId}`);
  return res.data;
};

// ✅ Apprentice
export const fetchMyApprenticeCases = async () => {
  const res = await api.get("/api/apprenticeship/my/cases");
  return res.data;
};

export const fetchApprenticeCaseNotes = async (caseId) => {
  const res = await api.get(`/api/apprenticeship/cases/${caseId}/notes`);
  return res.data;
};

export const addApprenticeCaseNote = async (caseId, text) => {
  const res = await api.post(`/api/apprenticeship/cases/${caseId}/notes`, {
    note: text,
  });
  return res.data;
};

// ✅ Lawyer
export const assignApprenticeToCase = async ({ case_id, apprentice_id }) => {
  const res = await api.post("/api/apprenticeship/assign", { case_id, apprentice_id });
  return res.data;
};

export const fetchCaseNotesForLawyer = async (caseId) => {
  const res = await api.get(`/api/apprenticeship/cases/${caseId}/notes`);
  return res.data;
};

// ✅ Dropdown: lawyer approved cases
export const fetchLawyerCases = async () => {
  const res = await api.get("/api/lawyer/cases");
  return res.data;
};

// ✅ Search apprentices
export const searchApprentices = async (query) => {
  const res = await api.get("/api/apprentices/search", { params: { q: query } });
  return res.data;
};
