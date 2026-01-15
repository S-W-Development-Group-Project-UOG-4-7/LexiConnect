/**
 * Time utility functions for API compatibility
 * Converts between UI time formats and backend 24-hour HH:mm:ss format
 */

/**
 * Convert time string to backend-compatible 24-hour HH:mm:ss format
 * @param {string} timeStr - Time string in various formats
 * @returns {string} - Time in HH:mm:ss format
 */
export function toApiTime(timeStr) {
  if (!timeStr) return timeStr;
  
  // Handle 12-hour format with AM/PM (e.g., "09:00 AM", "12:00 PM")
  const twelveHourMatch = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1], 10);
    const minutes = twelveHourMatch[2];
    const period = twelveHourMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${String(hours).padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  }
  
  // Handle 24-hour format (e.g., "09:00", "14:30")
  const twentyFourHourMatch = String(timeStr).match(/(\d{1,2}):(\d{2})/);
  if (twentyFourHourMatch) {
    const hours = String(twentyFourHourMatch[1]).padStart(2, '0');
    const minutes = String(twentyFourHourMatch[2]).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  }
  
  // Handle already formatted HH:mm:ss
  const fullFormatMatch = String(timeStr).match(/(\d{2}):(\d{2}):(\d{2})/);
  if (fullFormatMatch) {
    return timeStr; // Already in correct format
  }
  
  return timeStr; // Return original if no pattern matches
}

/**
 * Convert backend time format to display time (12-hour AM/PM)
 * @param {string} timeStr - Time in HH:mm:ss format
 * @returns {string} - Time in h:mm AM/PM format
 */
export function toDisplayTime(timeStr) {
  if (!timeStr) return timeStr;
  
  // Parse HH:mm:ss format
  const match = String(timeStr).match(/(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return timeStr;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
  
  return `${hours}:${minutes} ${period}`;
}

/**
 * Generate upcoming dates for a given day of week
 * @param {string} dayOfWeek - 'monday', 'tuesday', etc.
 * @param {number} count - Number of occurrences to generate
 * @returns {Array} - Array of date objects
 */
export function generateUpcomingDates(dayOfWeek, count = 4) {
  const dates = [];
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Map day names to numbers
  const dayMap = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  
  const targetDay = dayMap[dayOfWeek.toLowerCase()];
  if (targetDay === undefined) return dates;
  
  // Calculate days until next occurrence
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7; // If today or past this week, go to next week
  }
  
  // Generate dates
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + daysUntil + (i * 7));
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format date for display (e.g., "Jan 6")
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export function formatDateShort(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
