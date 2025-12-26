import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Trash2, Info, CheckCircle, AlertCircle, Save, X } from 'lucide-react';

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
      const lawyers = await apiRequest('/lawyers/');
      if (lawyers && Array.isArray(lawyers) && lawyers.length > 0) {
        const firstLawyerId = lawyers[0].id.toString();
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
    // Use relative URL - Vite proxy will handle forwarding to backend
    const fullUrl = url;  // No base URL needed with proxy
    console.log('Making request to:', fullUrl); // Debug log
    
    // Add cache-busting for GET requests to avoid 304 issues
    const requestOptions = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      },
      cache: options.method === 'GET' ? 'no-store' : 'default'
    };
    
    const response = await fetch(fullUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText); // Debug log
      let err;
      try {
        err = JSON.parse(errorText);
      } catch {
        err = { detail: errorText || `HTTP ${response.status}` };
      }
      throw new Error(err.detail || `HTTP ${response.status}`);
    }

    // Handle empty responses (204, 304, or Content-Length: 0)
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length') || '0';
    
    if (response.status === 204 || response.status === 304 || contentLength === '0') {
      console.log('Empty response detected, returning null');
      return null;
    }
    
    // Only parse JSON if content-type includes application/json
    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      throw new Error('Server returned non-JSON response');
    }

    const responseText = await response.text();
    console.log('Response text:', responseText); // Debug log
    
    // Handle empty JSON responses
    if (!responseText.trim()) {
      console.log('Empty JSON response, returning null');
      return null;
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', e, 'Response was:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  };

  // Load data from API
  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const lawyerId = await getLawyerId();
      console.log('Using lawyer ID:', lawyerId); // Debug log

      const [availabilityData, branchesData, blackoutData] = await Promise.all([
        apiRequest(`/api/lawyer-availability/weekly?lawyer_id=${lawyerId}`),
        apiRequest('/api/lawyer-availability/branches'),
        apiRequest(`/api/lawyer-availability/blackout?lawyer_id=${lawyerId}`)
      ]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircleIcon />
              <div className="flex-1">
                <h4 className="text-red-800 font-semibold">Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <XIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon />
              <div className="flex-1">
                <h4 className="text-green-800 font-semibold">Success</h4>
                <p className="text-green-700 text-sm mt-1">Availability saved successfully!</p>
              </div>
              <button onClick={() => setSuccess(false)} className="text-green-500 hover:text-green-700">
                <XIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Availability</h1>
                <p className="text-slate-600">Set your weekly consultation schedule and manage unavailable dates. Changes are saved automatically.</p>
              </div>
            </div>

            {/* Weekly Consultation Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Weekly Consultation Schedule</h2>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <CalendarIcon />
                  <span>Auto-recurring weekly</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-slate-600">Loading availability...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {weekDays.map((day) => (
                    <div key={day} className="border-b border-slate-100 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-slate-900">{day}</h3>
                          {timeSlots[day].length > 0 && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              {timeSlots[day].length} slot{timeSlots[day].length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addTimeSlot(day)}
                          disabled={saving[`add-${day}`]}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving[`add-${day}`] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm font-semibold">Adding...</span>
                            </>
                          ) : (
                            <>
                              <PlusIcon />
                              <span className="text-sm font-semibold">Add Time Slot</span>
                            </>
                          )}
                        </button>
                      </div>

                      {timeSlots[day].length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                          <p className="text-slate-500">No availability set for {day}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {timeSlots[day].map((slot) => (
                            <div key={slot.id} className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <ClockIcon />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={slot.startTime}
                                    onChange={(e) => updateSlot(day, slot.id, 'startTime', e.target.value)}
                                    className="w-24 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-slate-400 font-medium">-</span>
                                  <input
                                    type="text"
                                    value={slot.endTime}
                                    onChange={(e) => updateSlot(day, slot.id, 'endTime', e.target.value)}
                                    className="w-24 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <MapPinIcon />
                                </div>
                                <select
                                  value={slot.branchId || branches.find(b => b.name === slot.branch)?.id || ''}
                                  onChange={(e) => {
                                    const branch = branches.find(b => b.id === parseInt(e.target.value, 10));
                                    updateSlot(day, slot.id, 'branch', branch?.name || slot.branch);
                                    updateSlot(day, slot.id, 'branchId', branch?.id);
                                  }}
                                  className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select branch</option>
                                  {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <UsersIcon />
                                </div>
                                <input
                                  type="number"
                                  value={slot.maxBookings}
                                  onChange={(e) => updateSlot(day, slot.id, 'maxBookings', parseInt(e.target.value, 10) || 0)}
                                  className="w-20 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="1"
                                />
                                <span className="text-sm text-slate-600 font-medium">max</span>
                              </div>

                              {slot.isUnsaved && (
                                <button
                                  onClick={() => saveTimeSlot(day, slot)}
                                  disabled={saving[`${day}-${slot.id}`] || !slot.branchId}
                                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={!slot.branchId ? 'Please select a branch' : 'Save time slot'}
                                >
                                  {saving[`${day}-${slot.id}`] ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <>
                                      <SaveIcon />
                                      <span>Save</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => deleteTimeSlot(day, slot.id)}
                                disabled={saving[`delete-${slot.id}`]}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {saving[`delete-${slot.id}`] ? (
                                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <TrashIcon />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blackout Dates Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Blackout Dates</h2>
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <AlertCircleIcon />
                  <span>Overrides weekly schedule</span>
                </div>
              </div>

              {/* Add Blackout Date Form */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
                <h3 className="font-semibold text-slate-900 mb-6">Add New Blackout Date</h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newBlackout.date}
                        onChange={(e) => setNewBlackout(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2 pl-10 text-sm font-medium bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="absolute left-3 top-2.5 text-slate-400">
                        <CalendarIcon />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                    <select
                      value={newBlackout.availability}
                      onChange={(e) => setNewBlackout(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Partial Time">Partial Time</option>
                    </select>
                  </div>

                  {newBlackout.availability === 'Partial Time' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                        <input
                          type="text"
                          value={newBlackout.startTime}
                          onChange={(e) => setNewBlackout(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                        <input
                          type="text"
                          value={newBlackout.endTime}
                          onChange={(e) => setNewBlackout(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </>
                  )}

                  <div className={`${newBlackout.availability === 'Partial Time' ? 'col-span-2' : 'col-span-4'}`}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Court session, Annual leave"
                      value={newBlackout.reason}
                      onChange={(e) => setNewBlackout(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <button
                      onClick={addBlackoutDate}
                      disabled={saving['blackout']}
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving['blackout'] ? 'Adding...' : 'Add Blackout'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Blackout Dates List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-slate-600">Loading blackout dates...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {blackoutDates.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-500">No blackout dates set</p>
                    </div>
                  ) : (
                    blackoutDates.map((blackout) => (
                      <div key={blackout.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CalendarIcon />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{blackout.date}</div>
                            <div className="text-sm text-slate-600">
                              {blackout.availability === 'Full Day'
                                ? 'Full Day'
                                : `${blackout.startTime} - ${blackout.endTime}`}
                              {blackout.reason && ` • ${blackout.reason}`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteBlackoutDate(blackout.id)}
                          disabled={saving[`delete-blackout-${blackout.id}`]}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving[`delete-blackout-${blackout.id}`] ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6">
          {/* How It Works */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Weekly Schedule</h4>
                  <p className="text-sm text-slate-600">Set your regular availability patterns</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Auto-Recurring</h4>
                  <p className="text-sm text-slate-600">Schedule repeats weekly automatically</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircleIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Blackout Priority</h4>
                  <p className="text-sm text-slate-600">Blackout dates override weekly schedule</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Current Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div>
                  <div className="text-sm text-slate-600 font-medium">Total Weekly Hours</div>
                  <div className="text-xl font-bold text-slate-900">{getTotalWeeklyHours()} hrs</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <ClockIcon />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div>
                  <div className="text-sm text-slate-600 font-medium">Active Blackouts</div>
                  <div className="text-xl font-bold text-slate-900">{stats.activeBlackouts || blackoutDates.length}</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <AlertCircleIcon />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div>
                  <div className="text-sm text-slate-600 font-medium">Daily Capacity</div>
                  <div className="text-xl font-bold text-slate-900">{getTotalDailyCapacity()} clients</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <UsersIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <InfoIcon />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Pro Tip</h4>
                <p className="text-sm text-purple-800 leading-relaxed">
                  Set realistic time buffers between slots to account for session overruns and preparation time.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LawyerAvailabilityDashboard;
