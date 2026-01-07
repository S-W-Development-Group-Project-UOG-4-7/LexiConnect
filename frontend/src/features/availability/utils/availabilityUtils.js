// Utility functions for availability wizard

// Convert 12-hour time with AM/PM to 24-hour format HH:MM:SS
export function to24Hour(time12) {
  if (!time12) return '';
  
  const [time, period] = time12.trim().split(' ');
  if (!time || !period) return time12;
  
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:00`;
}

// Convert 24-hour format HH:MM:SS to 12-hour format with AM/PM
export function to12Hour(time24) {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
  
  return `${displayHour}:${minutes || '00'} ${period}`;
}

// Normalize day name to lowercase
export function normalizeDay(dayAbbr) {
  const days = {
    'Mon': 'monday',
    'Tue': 'tuesday',
    'Wed': 'wednesday',
    'Thu': 'thursday',
    'Fri': 'friday',
    'Sat': 'saturday',
    'Sun': 'sunday',
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday'
  };
  return days[dayAbbr] || dayAbbr.toLowerCase();
}

// Format day title with plural
export function formatDayTitle(dayLower) {
  const days = {
    'monday': 'Mondays',
    'tuesday': 'Tuesdays',
    'wednesday': 'Wednesdays',
    'thursday': 'Thursdays',
    'friday': 'Fridays',
    'saturday': 'Saturdays',
    'sunday': 'Sundays'
  };
  return days[dayLower] || dayLower;
}

// Get day name from lowercase day string
export function getDayName(dayLower) {
  const days = {
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday'
  };
  return days[dayLower] || dayLower;
}

// Get day abbreviation
export function getDayAbbr(dayLower) {
  const days = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  return days[dayLower] || dayLower;
}

// Validate time range
export function validateTimeRange(startTime12, endTime12) {
  if (!startTime12 || !endTime12) {
    return { isValid: false, error: 'Both start and end times are required' };
  }
  
  // Convert to minutes for comparison
  const startMinutes = timeToMinutes(startTime12);
  const endMinutes = timeToMinutes(endTime12);
  
  if (startMinutes >= endMinutes) {
    return { isValid: false, error: 'End time must be after start time' };
  }
  
  return { isValid: true };
}

// Convert time string to minutes since midnight
function timeToMinutes(time) {
  const [timePart, period] = time.trim().split(' ');
  if (!timePart || !period) return 0;
  
  let [hours, minutes] = timePart.split(':').map(Number);
  hours = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + (minutes || 0);
}

// Generate upcoming dates based on day of week and repeat rule
export function generateUpcomingDates({ 
  day_of_week, 
  start_time, 
  end_time,
  repeat_mode, 
  repeat_value, 
  timezone = 'UTC',
  maxDates = 10 
}) {
  const dates = [];
  const today = new Date();
  const current = new Date(today);
  
  // Find next occurrence of specified day
  const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    .indexOf(day_of_week);
  
  if (targetDay === -1) return dates;
  
  // Move to next occurrence of target day
  while (current.getDay() !== targetDay) {
    current.setDate(current.getDate() + 1);
  }
  
  if (repeat_mode === 'weeks') {
    // Generate dates for specified number of weeks
    const weeks = Math.min(parseInt(repeat_value) || 0, 52); // Cap at 52 weeks
    for (let i = 0; i < weeks && dates.length < maxDates; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + (i * 7));
      dates.push(date.toISOString().split('T')[0]);
    }
  } else if (repeat_mode === 'until_date') {
    // Generate dates until end date
    const endDate = new Date(repeat_value);
    while (current <= endDate && dates.length < maxDates) {
      dates.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
    }
  } else {
    // Default: show next 4 occurrences
    for (let i = 0; i < 4 && dates.length < maxDates; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + (i * 7));
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
}

// Format repeat rule for display
export function formatRepeatRule(repeatType, repeatValue) {
  if (repeatType === 'weeks') {
    const weeks = parseInt(repeatValue) || 0;
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else if (repeatType === 'until_date') {
    const date = new Date(repeatValue);
    return `Until ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  return '';
}

// Format time for display (12-hour format)
export function formatTimeDisplay(time24) {
  return to12Hour(time24);
}

// Calculate duration between two times
export function calculateDuration(startTime12, endTime12) {
  const startMinutes = timeToMinutes(startTime12);
  const endMinutes = timeToMinutes(endTime12);
  const duration = endMinutes - startMinutes;
  
  if (duration <= 0) return '0h 0m';
  
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

// Safe error message extraction
export function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.statusText) return error.statusText;
  return 'An unexpected error occurred. Please try again.';
}
