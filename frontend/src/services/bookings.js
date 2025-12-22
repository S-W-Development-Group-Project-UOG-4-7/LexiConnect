import api from "./api";

/**
 * Create a new booking
 * @param {Object} payload - Booking data
 * @param {number} payload.lawyer_id - ID of the lawyer
 * @param {number} [payload.branch_id] - Optional branch ID
 * @param {string} [payload.scheduled_at] - ISO datetime string for scheduled time
 * @param {string} [payload.note] - Optional note/description
 * @returns {Promise<Object>} Created booking object
 */
export const createBooking = async (payload) => {
  const { data } = await api.post("/api/bookings", payload);
  return data;
};

/**
 * List bookings for the current user
 * - Clients see their own bookings
 * - Lawyers see bookings assigned to them
 * @returns {Promise<Array>} Array of booking objects
 */
export const listMyBookings = async () => {
  const { data } = await api.get("/api/bookings/my");
  return data;
};

/**
 * Get a specific booking by ID
 * Only accessible by the booking's client or lawyer
 * @param {number} id - Booking ID
 * @returns {Promise<Object>} Booking object
 */
export const getBookingById = async (id) => {
  const { data } = await api.get(`/api/bookings/${id}`);
  return data;
};

/**
 * Cancel a booking
 * Only the client who owns the booking can cancel it
 * @param {number} id - Booking ID
 * @returns {Promise<Object>} Cancelled booking object with status
 */
export const cancelBooking = async (id) => {
  const { data } = await api.patch(`/api/bookings/${id}/cancel`);
  return data;
};

/**
 * List incoming booking requests for lawyer (status: pending)
 * Lawyer only endpoint
 * @returns {Promise<Array>} Array of pending booking objects
 */
export const lawyerListIncomingBookings = async () => {
  const { data } = await api.get("/api/bookings/lawyer/incoming");
  return data;
};

/**
 * Confirm a booking request (lawyer only)
 * Only the assigned lawyer can confirm, only if status is PENDING
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Confirmed booking object
 */
export const lawyerConfirmBooking = async (bookingId) => {
  const { data } = await api.patch(`/api/bookings/${bookingId}/confirm`);
  return data;
};

/**
 * Reject a booking request (lawyer only)
 * Only the assigned lawyer can reject, only if status is PENDING
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} Rejected booking object
 */
export const lawyerRejectBooking = async (bookingId) => {
  const { data } = await api.patch(`/api/bookings/${bookingId}/reject`);
  return data;
};

/**
 * Get incoming booking requests for lawyer (status: pending)
 * Lawyer only endpoint
 * @returns {Promise<Array>} Array of pending booking objects
 */
export const getLawyerIncomingBookings = async () => {
  const { data } = await api.get("/api/bookings/lawyer/incoming");
  return data;
};

/**
 * Confirm a booking request (lawyer only)
 * Only the assigned lawyer can confirm, only if status is PENDING
 * @param {number} id - Booking ID
 * @returns {Promise<Object>} Confirmed booking object
 */
export const confirmBooking = async (id) => {
  const { data } = await api.patch(`/api/bookings/${id}/confirm`);
  return data;
};

/**
 * Reject a booking request (lawyer only)
 * Only the assigned lawyer can reject, only if status is PENDING
 * @param {number} id - Booking ID
 * @returns {Promise<Object>} Rejected booking object
 */
export const rejectBooking = async (id) => {
  const { data } = await api.patch(`/api/bookings/${id}/reject`);
  return data;
};