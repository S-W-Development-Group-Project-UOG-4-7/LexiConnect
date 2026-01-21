// frontend/src/features/intake/services/intake.service.js
import api from "../../../services/api";

// CREATE
export const submitIntake = (bookingId, payload) => {
  return api.post("/api/intake", {
    booking_id: Number(bookingId),
    ...payload,
  });
};

// READ
export const getIntakeByBooking = (bookingId) => {
  return api.get(`/api/intake/by-booking/${Number(bookingId)}`);
};

// UPDATE (PUT)
export const updateIntake = (intakeId, payload) => {
  return api.put(`/api/intake/${Number(intakeId)}`, payload);
};

// DELETE
export const deleteIntake = (bookingId) => {
  return api.delete("/api/intake", {
    params: { booking_id: Number(bookingId) },
  });
};
export const getIntakeByCase = async (caseId) => {
  const { data } = await api.get(`/api/intake/cases/${caseId}`);
  return data;
};
