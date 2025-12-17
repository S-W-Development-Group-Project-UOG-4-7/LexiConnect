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
