import api from "../../../services/api";

export async function getLawyerBookingChecklist(bookingId) {
  const res = await api.get(`/api/checklist-templates/bookings/${bookingId}/checklist`);
  return res.data;
}
