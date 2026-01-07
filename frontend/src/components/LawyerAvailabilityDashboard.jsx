import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Calendar, Clock, MapPin, Users, Plus, Trash2, Info, CheckCircle, AlertCircle, Save, X } from 'lucide-react';
import AvailabilityWizard from './AvailabilityWizard';
import api from '../services/api';
=======
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import api from '../services/api'; // shared axios client with base /api + auth
>>>>>>> origin/dev

const LawyerAvailabilityDashboard = () => {
  const [timeSlots, setTimeSlots] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({ activeBlackouts: 0, dailyCapacity: 0 });
  const [slotPreview, setSlotPreview] = useState([]);
  const [previewFrom, setPreviewFrom] = useState("");
  const [previewTo, setPreviewTo] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [newBlackout, setNewBlackout] = useState({
    date: '',
    availability: 'Full Day',
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  });

<<<<<<< HEAD
  const [isWizardOpen, setIsWizardOpen] = useState(false);

=======
  const navigate = useNavigate();
>>>>>>> origin/dev
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fromApiTime = (timeStr) => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
    return timeStr;
  };

<<<<<<< HEAD
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
=======
  const toApiTime = (timeStr) => {
    if (!timeStr) return timeStr;
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return timeStr;
    const hours = String(match[1]).padStart(2, '0');
    const minutes = String(match[2]).padStart(2, '0');
    return `${hours}:${minutes}:00`;
>>>>>>> origin/dev
  };

  const isSlotValid = (slot) => {
    if (!slot.branchId) return false;
    if (!slot.startTime || !slot.endTime) return false;
    const toMinutes = (val) => {
      const m = val.match(/(\d{1,2}):(\d{2})/);
      if (!m) return null;
      return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    };
    const startM = toMinutes(slot.startTime);
    const endM = toMinutes(slot.endTime);
    if (startM === null || endM === null) return false;
    if (endM <= startM) return false;
    if (!slot.maxBookings || slot.maxBookings < 1) return false;
    return true;
  };

<<<<<<< HEAD
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
=======
  const parseDay = (v) => {
    if (typeof v === 'string') return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    if (typeof v === 'number') {
      const map = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return map[v % 7];
>>>>>>> origin/dev
    }
    return 'Monday';
  };

  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      let bundle;
      try {
        const { data } = await api.get('/api/lawyer-availability/me');
        bundle = data || {};
      } catch (e) {
        // Fallback: load individually if /me not available
        const [weeklyRes, branchesRes, blackoutRes] = await Promise.all([
          api.get('/api/lawyer-availability/weekly'),
          api.get('/api/lawyer-availability/branches'),
          api.get('/api/lawyer-availability/blackout'),
        ]);
        bundle = {
          weekly: weeklyRes.data || [],
          branches: branchesRes.data || [],
          blackouts: blackoutRes.data || [],
        };
      }

<<<<<<< HEAD
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
=======
      const weekly = Array.isArray(bundle.weekly) ? bundle.weekly : [];
      const blackouts = Array.isArray(bundle.blackouts) ? bundle.blackouts : [];
      const branchList = Array.isArray(bundle.branches) ? bundle.branches : [];
>>>>>>> origin/dev

      setBranches(branchList);

      const transformedSlots = {};
      weekDays.forEach((day) => {
        transformedSlots[day] = weekly
          .filter((slot) => parseDay(slot.day_of_week) === day)
          .map((slot) => ({
            id: slot.id,
            startTime: fromApiTime(slot.start_time),
            endTime: fromApiTime(slot.end_time),
            branchId: slot.branch_id,
            branch: branchList.find((b) => b.id === slot.branch_id)?.name || '',
            maxBookings: slot.max_bookings ?? 0,
            isUnsaved: false,
          }));
      });

      const transformedBlackouts = blackouts.map((b) => ({
        id: b.id,
        date: b.date,
        availability: 'Full Day',
        startTime: '',
        endTime: '',
        reason: b.reason || '',
      }));

      setTimeSlots(transformedSlots);
      setBlackoutDates(transformedBlackouts);
      setStats({
        activeBlackouts: transformedBlackouts.length,
        dailyCapacity: weekly.reduce((sum, s) => sum + (s.max_bookings || 0), 0),
      });
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate('/not-authorized');
        return;
      }
      setError(err?.response?.data?.detail || err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotPreview = async (fromDate, toDate) => {
    if (!fromDate || !toDate) return;
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const { data } = await api.get("/api/lawyer-availability/slots", {
        params: { from_date: fromDate, to_date: toDate },
      });
      setSlotPreview(data || []);
    } catch (err) {
      setPreviewError(
        err?.response?.data?.detail || err?.response?.data?.message || "Failed to load upcoming slots"
      );
      setSlotPreview([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const saveTimeSlot = async (day, slot) => {
    const slotKey = `${day}-${slot.id}`;
    try {
      setSaving((p) => ({ ...p, [slotKey]: true }));
      setError(null);

      if (!slot.branchId) throw new Error('Please select a branch before saving');

      if (!isSlotValid(slot)) {
        setError('Please select a branch, set valid times, and ensure end time is after start time (max >= 1).');
        return;
      }

      const payload = {
        day_of_week: day.toUpperCase(),
        start_time: toApiTime(slot.startTime),
        end_time: toApiTime(slot.endTime),
        branch_id: slot.branchId,
        max_bookings: slot.maxBookings,
        is_active: true,
      };

      let saved;
      if (slot.id && !slot.id.toString().startsWith('new-')) {
        saved = await api.patch(`/api/lawyer-availability/weekly/${slot.id}`, payload);
      } else {
        saved = await api.post('/api/lawyer-availability/weekly', payload);
      }

      setTimeSlots((prev) => ({
        ...prev,
        [day]: prev[day].map((s) =>
          s.id === slot.id
            ? {
                ...s,
                id: saved.data.id,
                startTime: fromApiTime(saved.data.start_time),
                endTime: fromApiTime(saved.data.end_time),
                branchId: saved.data.branch_id,
                isUnsaved: false,
              }
            : s
        ),
      }));
      setSuccess('Time slot saved successfully!');
      setTimeout(() => setSuccess(null), 2500);
      await loadAvailabilityData();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate('/not-authorized');
        return;
      }
      setError(err?.response?.data?.detail || err.message || 'Failed to save slot');
    } finally {
      setSaving((p) => {
        const next = { ...p };
        delete next[slotKey];
        return next;
      });
    }
  };

  const deleteTimeSlot = async (day, slotId) => {
    if (slotId.toString().startsWith('new-')) {
      setTimeSlots((prev) => ({ ...prev, [day]: prev[day].filter((s) => s.id !== slotId) }));
      return;
    }
    try {
      setSaving((p) => ({ ...p, [`delete-${slotId}`]: true }));
      setError(null);
      await api.delete(`/api/lawyer-availability/weekly/${slotId}`);
      setTimeSlots((prev) => ({ ...prev, [day]: prev[day].filter((s) => s.id !== slotId) }));
      setSuccess('Time slot deleted successfully!');
      setTimeout(() => setSuccess(null), 2500);
      await loadAvailabilityData();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate('/not-authorized');
        return;
      }
      setError(err?.response?.data?.detail || err.message || 'Failed to delete slot');
    } finally {
      setSaving((p) => {
        const next = { ...p };
        delete next[`delete-${slotId}`];
        return next;
      });
    }
  };

  const updateSlot = (day, slotId, field, value) => {
    setTimeSlots((prev) => ({
      ...prev,
      [day]: prev[day].map((slot) =>
        slot.id === slotId ? { ...slot, [field]: value, isUnsaved: true } : slot
      ),
    }));
  };

  const addTimeSlot = (day) => {
    const newSlot = {
      id: `new-${Date.now()}`,
      startTime: '09:00',
      endTime: '17:00',
      branch: '',
      branchId: null,
      maxBookings: 5,
      isUnsaved: true,
    };
    setTimeSlots((prev) => ({ ...prev, [day]: [...prev[day], newSlot] }));
  };

  const addBlackoutDate = async () => {
    if (!newBlackout.date) {
      setError('Please select a date');
      return;
    }
    try {
      setSaving((p) => ({ ...p, blackout: true }));
      setError(null);
      const payload = { date: newBlackout.date, reason: newBlackout.reason || null };
      const { data } = await api.post('/api/lawyer-availability/blackout', payload);
      setBlackoutDates((prev) => [
        ...prev,
        { id: data.id, date: data.date, availability: 'Full Day', startTime: '', endTime: '', reason: data.reason || '' },
      ]);
      setNewBlackout({ date: '', availability: 'Full Day', startTime: '09:00', endTime: '17:00', reason: '' });
      setSuccess('Blackout date added successfully!');
      setTimeout(() => setSuccess(null), 2500);
      await loadAvailabilityData();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate('/not-authorized');
        return;
      }
      setError(err?.response?.data?.detail || err.message || 'Failed to add blackout');
    } finally {
      setSaving((p) => {
        const next = { ...p };
        delete next.blackout;
        return next;
      });
    }
  };

  const deleteBlackoutDate = async (id) => {
    if (id.toString().startsWith('new-')) {
      setBlackoutDates((prev) => prev.filter((b) => b.id !== id));
      return;
    }
    try {
      setSaving((p) => ({ ...p, [`delete-blackout-${id}`]: true }));
      setError(null);
      await api.delete(`/api/lawyer-availability/blackout/${id}`);
      setBlackoutDates((prev) => prev.filter((b) => b.id !== id));
      setSuccess('Blackout date deleted successfully!');
      setTimeout(() => setSuccess(null), 2500);
      await loadAvailabilityData();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate('/not-authorized');
        return;
      }
      setError(err?.response?.data?.detail || err.message || 'Failed to delete blackout');
    } finally {
      setSaving((p) => {
        const next = { ...p };
        delete next[`delete-blackout-${id}`];
        return next;
      });
    }
  };

  const getTotalWeeklyHours = () => {
    let totalHours = 0;
    Object.values(timeSlots).forEach((slots) => {
      slots.forEach((slot) => {
        const m1 = slot.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        const m2 = slot.endTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (m1 && m2) {
          let sh = parseInt(m1[1], 10);
          let eh = parseInt(m2[1], 10);
          const sm = parseInt(m1[2], 10);
          const em = parseInt(m2[2], 10);
          const sp = (m1[3] || '').toUpperCase();
          const ep = (m2[3] || '').toUpperCase();
          if (sp === 'PM' && sh !== 12) sh += 12;
          if (sp === 'AM' && sh === 12) sh = 0;
          if (ep === 'PM' && eh !== 12) eh += 12;
          if (ep === 'AM' && eh === 12) eh = 0;
          totalHours += (eh * 60 + em - (sh * 60 + sm)) / 60;
        }
      });
    });
    return Math.max(0, Math.round(totalHours * 10) / 10);
  };

  const getTotalDailyCapacity = () =>
    stats.dailyCapacity ||
    Object.values(timeSlots).reduce(
      (total, slots) => total + slots.reduce((dayTotal, slot) => dayTotal + (slot.maxBookings || 0), 0),
      0
    );

  const cancelDay = async (dateStr) => {
    const key = `cancel-${dateStr}`;
    try {
      setSaving((p) => ({ ...p, [key]: true }));
      setError(null);
      await api.post("/api/lawyer-availability/blackout", {
        date: dateStr,
        reason: "Cancelled via calendar",
      });
      setSuccess("Day cancelled");
      fetchSlotPreview(previewFrom, previewTo);
      await loadAvailabilityData();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to cancel day");
    } finally {
      setSaving((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  };

  useEffect(() => {
    loadAvailabilityData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const toDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const to = toDate.toISOString().slice(0, 10);
    setPreviewFrom(from);
    setPreviewTo(to);
    fetchSlotPreview(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

<<<<<<< HEAD
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

=======
>>>>>>> origin/dev
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

<<<<<<< HEAD
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
=======
      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon />
              <div className="flex-1">
                <h4 className="text-green-800 font-semibold">Success</h4>
                <p className="text-green-700 text-sm mt-1">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
                <XIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Availability</h1>
              <p className="text-slate-600">Set your weekly consultation schedule and manage unavailable dates. Changes are saved automatically.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Weekly Consultation Schedule</h2>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <CalendarIcon />
                  <span>Auto-recurring weekly</span>
                </div>
              </div>
              {!loading && branches.length === 0 && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  No branches found. Add a branch first to save availability.
                </div>
              )}

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
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => updateSlot(day, slot.id, 'startTime', e.target.value)}
                                    className="w-24 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-slate-400 font-medium">-</span>
                                  <input
                                    type="time"
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
                                  value={slot.branchId || ''}
                                  onChange={(e) => {
                                    const branchId = parseInt(e.target.value, 10) || null;
                                    const branch = branches.find((b) => b.id === branchId);
                                    updateSlot(day, slot.id, 'branch', branch?.name || '');
                                    updateSlot(day, slot.id, 'branchId', branchId);
                                  }}
                                  className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select branch</option>
                                  {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                      {branch.name}
                                    </option>
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
                                  min="1"
                                  onChange={(e) =>
                                    updateSlot(day, slot.id, 'maxBookings', parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-20 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-600 font-medium">max</span>
                              </div>

                              {slot.isUnsaved && (
                                <button
                                  onClick={() => saveTimeSlot(day, slot)}
                                  disabled={saving[`${day}-${slot.id}`] || !isSlotValid(slot)}
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

      {/* Upcoming Slots */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Slots (Next 14 Days)</h2>
            <p className="text-slate-600 text-sm">Generated from your weekly availability.</p>
          </div>
          {previewError && <div className="text-sm text-red-500">{previewError}</div>}
        </div>
        {previewLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading upcoming slots...
          </div>
        ) : slotPreview.length === 0 ? (
          <div className="text-slate-500 text-sm">No upcoming slots in this range.</div>
        ) : (
          Object.entries(
            slotPreview.reduce((acc, slot) => {
              const d = slot.date;
              acc[d] = acc[d] || [];
              acc[d].push(slot);
              return acc;
            }, {})
          ).map(([d, slotsForDay]) => {
            const dateLabel = new Date(d + "T00:00:00");
            const niceDate = isNaN(dateLabel.getTime())
              ? d
              : `${dateLabel.toLocaleDateString()} (${dateLabel.toLocaleDateString(undefined, {
                  weekday: "long",
                })})`;
            const isBlackoutDay = slotsForDay.every((s) => s.is_blackout);
            const cancelKey = `cancel-${d}`;
            const canceling = !!saving[cancelKey];
            return (
              <div key={d} className="mb-4 border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-900 font-semibold">{niceDate}</div>
                  <button
                    type="button"
                    disabled={isBlackoutDay || canceling}
                    onClick={() => cancelDay(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      isBlackoutDay
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {isBlackoutDay ? "Cancelled" : canceling ? "Cancelling..." : "Cancel this day"}
                  </button>
                </div>
                <div className="space-y-2">
                  {slotsForDay.map((slot, idx) => (
                    <div
                      key={`${d}-${idx}`}
                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3"
                    >
                      <div className="text-sm text-slate-800 font-semibold">
                        {fromApiTime(slot.start_time)} - {fromApiTime(slot.end_time)}
                      </div>
                      <div className="text-sm text-slate-500">{slot.branch_name || "No branch"}</div>
                      {slot.is_blackout && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                          BLACKOUT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900">Blackout Dates</h2>
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <AlertCircleIcon />
                  <span>Overrides weekly schedule</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
                <h3 className="font-semibold text-slate-900 mb-6">Add New Blackout Date</h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <div className="relative">
                      <Flatpickr
                        value={newBlackout.date ? new Date(newBlackout.date) : null}
                        onChange={(dates) =>
                          setNewBlackout((p) => ({
                            ...p,
                            date: dates && dates[0] ? dates[0].toISOString().split('T')[0] : '',
                          }))
                        }
                        options={{
                          dateFormat: 'd/m/Y',
                          allowInput: true,
                          disableMobile: true,
                        }}
                        className="w-full px-4 py-2 pl-10 text-sm font-medium bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="dd/mm/yyyy"
                      />
                      <div className="absolute left-3 top-2.5 text-slate-400">
                        <CalendarIcon />
>>>>>>> origin/dev
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
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
=======
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                    <select
                      value={newBlackout.availability}
                      onChange={(e) => setNewBlackout((p) => ({ ...p, availability: e.target.value }))}
                      className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Full Day">Full Day</option>
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Court session, Annual leave"
                      value={newBlackout.reason}
                      onChange={(e) => setNewBlackout((p) => ({ ...p, reason: e.target.value }))}
                      className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <button
                      onClick={addBlackoutDate}
                      disabled={saving.blackout}
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving.blackout ? 'Adding...' : 'Add Blackout'}
                    </button>
                  </div>
                </div>
              </div>

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
                      <div
                        key={blackout.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CalendarIcon />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{blackout.date}</div>
                            <div className="text-sm text-slate-600">
                              Full Day{blackout.reason && ` • ${blackout.reason}`}
                            </div>
>>>>>>> origin/dev
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

<<<<<<< HEAD
        {/* Success Message */}
        {success && (
          <div className="fixed bottom-4 right-4 flex items-center p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg">
            <CheckCircle className="w-5 h-5 mr-3" />
            <div>
              <h4 className="font-semibold">Success</h4>
              <p className="text-sm">{success}</p>
=======
        <aside className="w-80 bg-white border-l border-slate-200 p-6">
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
>>>>>>> origin/dev
            </div>
            <button onClick={() => setSuccess(null)} className="ml-4 text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

<<<<<<< HEAD
        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 flex items-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
            <AlertCircle className="w-5 h-5 mr-3" />
            <div>
              <h4 className="font-semibold">Error</h4>
              <p className="text-sm">{error}</p>
=======
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
>>>>>>> origin/dev
            </div>
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/dev
      </div>
    </div>
  );
};

export default LawyerAvailabilityDashboard;
