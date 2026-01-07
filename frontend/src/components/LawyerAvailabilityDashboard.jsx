import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Trash2, Info, CheckCircle, AlertCircle, Save, X } from 'lucide-react';
import AvailabilityWizard from './AvailabilityWizard';
import api from '../services/api';

const LawyerAvailabilityDashboard = () => {
  const [timeSlots, setTimeSlots] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });

  const [blackoutDates, setBlackoutDates] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    activeBlackouts: 0,
    dailyCapacity: 0
  });

  const [newBlackout, setNewBlackout] = useState({
    date: '',
    availability: 'Full Day',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    reason: ''
  });

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper function to convert time object to HH:MM AM/PM format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // If already in HH:MM AM/PM format, return as is
    if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      return timeStr;
    }
    // If it's a time string like "09:00:00", convert it
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
    }
    return timeStr;
  };

  // Helper function to get lawyer ID dynamically
  const getLawyerId = async () => {
    // First try to get from localStorage
    const storedLawyerId = localStorage.getItem('lawyerId');
    if (storedLawyerId) {
      return storedLawyerId;
    }

    // Try to get from JWT token
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      try {
        // Simple JWT decode (for development only)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.lawyer_id) {
          localStorage.setItem('lawyerId', payload.lawyer_id);
          return payload.lawyer_id;
        }
        if (payload.id && payload.role === 'lawyer') {
          localStorage.setItem('lawyerId', payload.id);
          return payload.id;
        }
      } catch (e) {
        console.log('Failed to decode JWT:', e);
      }
    }

    // Fallback: fetch first lawyer from backend
    try {
      const response = await api.get('/lawyers/');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const firstLawyerId = response.data[0].id.toString();
        localStorage.setItem('lawyerId', firstLawyerId);
        return firstLawyerId;
      }
    } catch (e) {
      console.log('Failed to fetch lawyers:', e);
    }

    // Final fallback
    return '1';
  };

  // API helper functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const apiRequest = async (url, options = {}) => {
    const method = options.method || 'GET';
    console.log("API REQUEST:", method, url); // Debug log
    
    try {
      const config = {
        ...options,
        url: url.startsWith('http') ? url : url
      };
      
      if (method === 'GET') {
        const response = await api.get(config.url, { ...options });
        return response.data;
      } else if (method === 'POST') {
        const response = await api.post(config.url, options.body, { ...options });
        return response.data;
      } else if (method === 'PUT') {
        const response = await api.put(config.url, options.body, { ...options });
        return response.data;
      } else if (method === 'DELETE') {
        const response = await api.delete(config.url, { ...options });
        return response.data;
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Load data from API
  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const lawyerId = await getLawyerId();
      console.log('Using lawyer ID:', lawyerId); // Debug log

      // Load each API endpoint individually to handle failures gracefully
      let availabilityData = [];
      let branchesData = [];
      let blackoutData = [];

      try {
        console.log('CALLING: /api/lawyer-availability/weekly?lawyer_id=' + lawyerId);
        availabilityData = await apiRequest(`/api/lawyer-availability/weekly?lawyer_id=${lawyerId}`);
      } catch (err) {
        console.error('Failed to load weekly availability:', err);
        availabilityData = []; // Use empty array as fallback
      }

      try {
        console.log('CALLING: /api/lawyer-availability/branches');
        branchesData = await apiRequest('/api/lawyer-availability/branches');
      } catch (err) {
        console.error('Failed to load branches:', err);
        branchesData = []; // Use empty array as fallback
      }

      try {
        console.log('CALLING: /api/lawyer-availability/blackout?lawyer_id=' + lawyerId);
        blackoutData = await apiRequest(`/api/lawyer-availability/blackout?lawyer_id=${lawyerId}`);
      } catch (err) {
        console.error('Failed to load blackouts:', err);
        blackoutData = []; // Use empty array as fallback
      }

      // Store branches data for dropdown
      setBranches(branchesData || []);

      // Transform weekly slots response to match expected format
      const weeklySlots = availabilityData.map(slot => ({
        id: slot.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_bookings: slot.max_bookings,
        is_active: slot.is_active
      }));

      const transformedSlots = {};
      weekDays.forEach(day => {
        transformedSlots[day] = weeklySlots
          .filter(slot => slot.day_of_week.toLowerCase() === day.toLowerCase())
          .map(slot => ({
            id: slot.id,
            startTime: formatTime(slot.start_time),
            endTime: formatTime(slot.end_time),
            branch: branchesData.find(b => b.id === slot.branch_id)?.name || 'Default Branch',
            branchId: slot.branch_id || 1,
            maxBookings: slot.max_bookings,
            isUnsaved: false
          }));
      });

      // Transform blackout dates response
      const transformedBlackouts = (blackoutData || []).map(blackout => ({
        id: blackout.id,
        date: new Date(blackout.date).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        }),
        availability: blackout.availability_type === 'full_day' ? 'Full Day' : 'Partial Time',
        startTime: formatTime(blackout.start_time) || '',
        endTime: formatTime(blackout.end_time) || '',
        reason: blackout.reason || ''
      }));

      setTimeSlots(transformedSlots);
      setBlackoutDates(transformedBlackouts);
      setStats({
        activeBlackouts: 0,
        dailyCapacity: weeklySlots.length
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load availability data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save a single time slot immediately
  const saveTimeSlot = async (day, slot) => {
    const lawyerId = await getLawyerId();
    const slotKey = `${day}-${slot.id}`;
    
    try {
      setSaving(prev => ({ ...prev, [slotKey]: true }));
      setError(null);

      const slotData = {
        day_of_week: day.toLowerCase(),
        start_time: slot.startTime,
        end_time: slot.endTime,
        branch_id: slot.branchId, // Require explicit branch selection
        max_bookings: slot.maxBookings
      };
      
      // Validate branch selection
      if (!slotData.branch_id || slotData.branch_id === '') {
        throw new Error('Please select a branch before saving');
      }
      
      console.log('Saving slot data:', slotData); // Debug log

      let savedSlot;
      if (slot.id && !slot.id.toString().startsWith('new-')) {
        // Update existing slot
        savedSlot = await apiRequest(`/api/lawyer-availability/weekly/${slot.id}`, {
          method: 'PUT',
          body: JSON.stringify(slotData)
        });
      } else {
        // Create new slot
        savedSlot = await apiRequest(`/api/lawyer-availability/weekly?lawyer_id=${lawyerId}`, {
          method: 'POST',
          body: JSON.stringify(slotData)
        });
      }

      // Update local state with saved slot
      setTimeSlots(prev => ({
        ...prev,
        [day]: prev[day].map(s => 
          s.id === slot.id ? {
            ...s,
            id: savedSlot.id,
            startTime: formatTime(savedSlot.start_time),
            endTime: formatTime(savedSlot.end_time),
            branchId: savedSlot.branch_id,
            isUnsaved: false
          } : s
        )
      }));

      setSuccess(`Time slot saved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Reload to get updated stats
      await loadAvailabilityData();
    } catch (err) {
      // Handle specific branch not found error
      if (err.message.includes('Branch not found')) {
        setError('Branch not found. Please select a valid branch from the dropdown.');
      } else {
        setError(err.message);
      }
      console.error('Failed to save time slot:', err);
    } finally {
      setSaving(prev => {
        const newState = { ...prev };
        delete newState[slotKey];
        return newState;
      });
    }
  };

  useEffect(() => {
    loadAvailabilityData();
  }, []);

  // Icons
  const TrashIcon = () => <Trash2 className="w-4 h-4" />;
  const PlusIcon = () => <Plus className="w-4 h-4" />;
  const ClockIcon = () => <Clock className="w-4 h-4" />;
  const MapPinIcon = () => <MapPin className="w-4 h-4" />;
  const UsersIcon = () => <Users className="w-4 h-4" />;
  const CalendarIcon = () => <Calendar className="w-5 h-5" />;
  const CheckCircleIcon = () => <CheckCircle className="w-5 h-5" />;
  const InfoIcon = () => <Info className="w-5 h-5" />;
  const AlertCircleIcon = () => <AlertCircle className="w-5 h-5" />;
  const SaveIcon = () => <Save className="w-4 h-4" />;
  const XIcon = () => <X className="w-4 h-4" />;

  const addTimeSlot = (day) => {
    const newSlot = {
      id: `new-${Date.now()}`,
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      branch: '', // No default branch
      branchId: null, // Require selection
      maxBookings: 5,
      isUnsaved: true
    };
    
    // Add to UI immediately
    setTimeSlots(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot]
    }));
  };

  const deleteTimeSlot = async (day, slotId) => {
    // Don't delete if it's a new unsaved slot
    if (slotId.toString().startsWith('new-')) {
      setTimeSlots(prev => ({
        ...prev,
        [day]: prev[day].filter(slot => slot.id !== slotId)
      }));
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [`delete-${slotId}`]: true }));
      setError(null);

      await apiRequest(`/api/lawyer-availability/weekly/${slotId}`, {
        method: 'DELETE'
      });

      // Remove from UI
      setTimeSlots(prev => ({
        ...prev,
        [day]: prev[day].filter(slot => slot.id !== slotId)
      }));

      setSuccess('Time slot deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Reload to get updated stats
      await loadAvailabilityData();
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete time slot:', err);
    } finally {
      setSaving(prev => {
        const newState = { ...prev };
        delete newState[`delete-${slotId}`];
        return newState;
      });
    }
  };

  const updateSlot = (day, slotId, field, value) => {
    // Update UI immediately
    setTimeSlots(prev => {
      const newSlots = {
        ...prev,
        [day]: prev[day].map(slot => {
          if (slot.id === slotId) {
            return { ...slot, [field]: value, isUnsaved: true };
          }
          return slot;
        })
      };
      return newSlots;
    });
  };

  const addBlackoutDate = async () => {
    if (!newBlackout.date) {
      setError('Please select a date');
      return;
    }

    const lawyerId = localStorage.getItem('lawyerId') || '1';
    
    try {
      setSaving(prev => ({ ...prev, 'blackout': true }));
      setError(null);

      // Format date for API
      const dateObj = new Date(newBlackout.date);
      const formattedDate = dateObj.toISOString().split('T')[0];

      const blackoutData = {
        date: formattedDate,
        availability_type: newBlackout.availability === 'Full Day' ? 'full_day' : 'partial_time',
        start_time: newBlackout.availability === 'Partial Time' ? newBlackout.startTime : null,
        end_time: newBlackout.availability === 'Partial Time' ? newBlackout.endTime : null,
        reason: newBlackout.reason || null
      };

      const savedBlackout = await apiRequest(`/api/lawyer-availability/blackout?lawyer_id=${lawyerId}`, {
        method: 'POST',
        body: JSON.stringify(blackoutData)
      });

      // Add to UI
      const formattedBlackout = {
        id: savedBlackout.id,
        date: new Date(savedBlackout.date).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        }),
        availability: savedBlackout.availability_type === 'full_day' ? 'Full Day' : 'Partial Time',
        startTime: formatTime(savedBlackout.start_time) || '',
        endTime: formatTime(savedBlackout.end_time) || '',
        reason: savedBlackout.reason || ''
      };

      setBlackoutDates(prev => [...prev, formattedBlackout]);
      setNewBlackout({
        date: '',
        availability: 'Full Day',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        reason: ''
      });

      setSuccess('Blackout date added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Reload to get updated stats
      await loadAvailabilityData();
    } catch (err) {
      setError(err.message);
      console.error('Failed to add blackout date:', err);
    } finally {
      setSaving(prev => {
        const newState = { ...prev };
        delete newState['blackout'];
        return newState;
      });
    }
  };

  const deleteBlackoutDate = async (id) => {
    console.log('Deleting blackout with ID:', id); // Debug log
    
    // Don't delete if it's a new unsaved blackout
    if (id.toString().startsWith('new-')) {
      setBlackoutDates(prev => prev.filter(blackout => blackout.id !== id));
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [`delete-blackout-${id}`]: true }));
      setError(null);

      console.log('Making DELETE request to:', `/api/lawyer-availability/blackout/${id}`); // Debug log
      
      await apiRequest(`/api/lawyer-availability/blackout/${id}`, {
        method: 'DELETE'
      });

      console.log('DELETE request successful'); // Debug log

      // Remove from UI
      setBlackoutDates(prev => prev.filter(blackout => blackout.id !== id));

      setSuccess('Blackout date deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Reload to get updated stats
      await loadAvailabilityData();
    } catch (err) {
      console.error('Delete blackout error:', err); // Debug log
      setError(err.message);
    } finally {
      setSaving(prev => {
        const newState = { ...prev };
        delete newState[`delete-blackout-${id}`];
        return newState;
      });
    }
  };

  const getTotalWeeklyHours = () => {
    let totalHours = 0;
    Object.values(timeSlots).forEach(slots => {
      slots.forEach(slot => {
        try {
          const timeMatch = slot.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let startHour = parseInt(timeMatch[1], 10);
            const startMin = parseInt(timeMatch[2], 10);
            const startPeriod = timeMatch[3].toUpperCase();
            
            if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
            if (startPeriod === 'AM' && startHour === 12) startHour = 0;
            
            const endMatch = slot.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (endMatch) {
              let endHour = parseInt(endMatch[1], 10);
              const endMin = parseInt(endMatch[2], 10);
              const endPeriod = endMatch[3].toUpperCase();
              
              if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
              if (endPeriod === 'AM' && endHour === 12) endHour = 0;
              
              const startMinutes = startHour * 60 + startMin;
              const endMinutes = endHour * 60 + endMin;
              totalHours += (endMinutes - startMinutes) / 60;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });
    });
    return Math.round(totalHours * 10) / 10;
  };

  const getTotalDailyCapacity = () => {
    return stats.dailyCapacity || Object.values(timeSlots).reduce(
      (total, slots) => total + slots.reduce((dayTotal, slot) => dayTotal + (slot.maxBookings || 0), 0),
      0
    );
  };

  // Helper functions for new UI
  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    
    // If already in HH:MM AM/PM format, return as is
    if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      return timeStr;
    }
    
    // If it's a time string like "09:00:00", convert it
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
    }
    
    return timeStr;
  };

  const getNextOccurrences = (dayOfWeek, startTime, count = 4) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const targetDay = days.indexOf(dayOfWeek.toLowerCase());
    
    const occurrences = [];
    let currentDate = new Date(today);
    
    // Find next occurrence of target day
    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    if (daysUntilTarget === 0 && today.getHours() > parseInt(startTime.split(':')[0])) {
      daysUntilTarget = 7; // If today is the day but time has passed, go to next week
    }
    
    currentDate.setDate(today.getDate() + daysUntilTarget);
    
    // Generate occurrences
    for (let i = 0; i < count; i++) {
      const occurrence = new Date(currentDate);
      occurrence.setDate(currentDate.getDate() + (i * 7));
      occurrences.push(occurrence);
    }
    
    return occurrences;
  };

  const formatShortDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getRepeatText = (slot) => {
    if (slot.weeks_count) {
      return `${slot.weeks_count} weeks`;
    } else if (slot.until_date) {
      const untilDate = new Date(slot.until_date);
      return `Until ${formatShortDate(untilDate)}`;
    }
    return 'Weekly';
  };

  const getBranchName = (slot) => {
    if (slot.branch_name) {
      return slot.branch_name;
    }
    const branch = branches.find(b => b.id === slot.branch_id);
    return branch ? branch.name : `Branch #${slot.branch_id}`;
  };

  // Transform timeSlots to flat array for new UI
  const availabilityCards = Object.entries(timeSlots).flatMap(([day, slots]) => 
    slots.map(slot => ({
      ...slot,
      dayName: day
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Scheduled Availability</h1>
            <p className="text-gray-600 mt-2">Manage your appointment availability and upcoming sessions</p>
          </div>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new availability
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading availability...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load availability. Please try refreshing the page.</p>
          </div>
        ) : availabilityCards.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">You don't have any availability yet</h3>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add new availability
            </button>
          </div>
        ) : (
          /* Availability Cards */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availabilityCards.map((slot) => {
              const upcomingDates = getNextOccurrences(slot.day_of_week, slot.start_time, 4);
              
              return (
                <div key={slot.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {slot.dayName}s · {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
                      </h3>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <MapPin className="w-3 h-3 mr-1" />
                          {getBranchName(slot)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Repeat Info */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">
                      {getRepeatText(slot)}
                    </span>
                  </div>

                  {/* Upcoming Dates */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Upcoming dates</div>
                    <div className="grid grid-cols-2 gap-2">
                      {upcomingDates.map((date, index) => (
                        <div key={index} className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="text-xs font-medium text-gray-600">
                            {formatShortDate(date)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime12h(slot.start_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="fixed bottom-4 right-4 flex items-center p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg">
            <CheckCircle className="w-5 h-5 mr-3" />
            <div>
              <h4 className="font-semibold">Success</h4>
              <p className="text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="ml-4 text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 flex items-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
            <AlertCircle className="w-5 h-5 mr-3" />
            <div>
              <h4 className="font-semibold">Error</h4>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Availability Wizard */}
        <AvailabilityWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSaved={() => {
            // Refresh availability data after successful save
            loadAvailabilityData();
            setIsWizardOpen(false);
            setSuccess('Availability added successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      </div>
    </div>
  );
};

export default LawyerAvailabilityDashboard;
