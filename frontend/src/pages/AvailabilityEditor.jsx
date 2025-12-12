import React, { useState, useEffect } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import './availability-ui.css';

const API_BASE = 'http://127.0.0.1:8000';

const AvailabilityEditor = () => {
  // Form state with validation
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    branchId: '',
    maxBookings: 1,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Data state
  const [branches, setBranches] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState({
    branches: true,
    slots: true,
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchBranches(), fetchSlots()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors(prev => ({
          ...prev,
          fetch: 'Failed to load data. Please try again later.'
        }));
      } finally {
        setIsLoading({ branches: false, slots: false });
      }
    };

    fetchData();
  }, []);

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE}/branches/`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setErrors(prev => ({
        ...prev,
        branches: 'Failed to load branches. Please refresh to try again.'
      }));
    }
  };

  // Fetch availability slots
  const fetchSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/availability/`);
      if (!response.ok) throw new Error('Failed to fetch availability slots');
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setErrors(prev => ({
        ...prev,
        slots: 'Failed to load availability slots. Please try again later.'
      }));
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxBookings' ? Math.max(1, parseInt(value) || 1) : value
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(formData.date);
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    // Reset date to beginning of the day for comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Date validation
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else if (selectedDate < today) {
      newErrors.date = 'Cannot select a past date';
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime && 
              endDateTime <= startDateTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Branch validation
    if (!formData.branchId) {
      newErrors.branchId = 'Please select a branch';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE}/availability/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          branch_id: formData.branchId,
          max_bookings: formData.maxBookings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add availability slot');
      }

      // Reset form
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        branchId: '',
        maxBookings: 1,
      });
      
      setSuccessMessage('Availability slot added successfully!');
      
      // Refresh slots
      await fetchSlots();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding slot:', error);
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to add availability slot. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle slot deletion
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/availability/${slotId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }

      // Update UI optimistically
      setSlots(prev => prev.filter(slot => slot.id !== slotId));
      setSuccessMessage('Slot deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error deleting slot:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to delete slot. Please try again.'
      }));
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'EEE, MMM d, yyyy');
    } catch (error) {
      return dateStr;
    }
  };

  // Get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
  };

  // Check if a slot is in the past
  const isPastSlot = (dateStr, timeStr) => {
    try {
      const slotDateTime = new Date(`${dateStr}T${timeStr}`);
      return isBefore(slotDateTime, new Date());
    } catch (error) {
      return false;
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedSlots).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="availability-page">
      {/* Header */}
      <div className="availability-card">
        <div className="availability-card-header">
          <div className="availability-brand">
            <span className="availability-logo">⚖️</span>
            <div className="availability-brand-text">
              <div className="availability-brand-name">LEXICONNECT</div>
              <div className="availability-brand-subtitle">Manage your consultation availability</div>
            </div>
          </div>
          <h1 className="availability-title">Manage Availability</h1>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.form && (
          <div className="alert alert-error">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="availability-form">
          <div className="availability-form-grid">
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={`form-control ${errors.date ? 'has-error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="startTime" className="form-label">
                Start Time <span className="required-star">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`form-control ${errors.startTime ? 'has-error' : ''}`}
                disabled={isSubmitting || !formData.date}
              />
              {errors.startTime && <div className="field-error">{errors.startTime}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="endTime" className="form-label">
                End Time <span className="required-star">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`form-control ${errors.endTime ? 'has-error' : ''}`}
                disabled={isSubmitting || !formData.startTime}
                min={formData.startTime || undefined}
              />
              {errors.endTime && <div className="field-error">{errors.endTime}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="branchId" className="form-label">
                Branch <span className="required-star">*</span>
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className={`form-control ${errors.branchId ? 'has-error' : ''}`}
                disabled={isSubmitting || isLoading.branches}
              >
                <option value="" disabled>
                  {isLoading.branches ? 'Loading branches…' : 'Select a branch'}
                </option>
                {!isLoading.branches && branches.length === 0 ? (
                  <option value="" disabled>
                    No branches available
                  </option>
                ) : (
                  branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))
                )}
              </select>
              {errors.branchId && <div className="field-error">{errors.branchId}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="maxBookings" className="form-label">Maximum Bookings</label>
              <input
                type="number"
                id="maxBookings"
                name="maxBookings"
                min="1"
                value={formData.maxBookings}
                onChange={handleChange}
                className="form-control"
                disabled={isSubmitting}
              />
              <div className="field-hint">Maximum number of bookings allowed for this time slot</div>
            </div>
          </div>

          <button type="submit" className="availability-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                Adding Slot...
              </>
            ) : (
              'Add Availability Slot'
            )}
          </button>
        </form>

        <div className="availability-divider" />

        <div className="availability-section-header">
          <h2>Your Availability</h2>
          <p>Manage your existing availability slots.</p>
        </div>

        {isLoading.slots ? (
          <div className="availability-loading">
            <span className="loading-spinner" />
          </div>
        ) : slots.length === 0 ? (
          <div className="empty-state">
            <p>No availability slots found.</p>
            <p className="empty-sub">Add your first availability slot to get started.</p>
          </div>
        ) : (
          <div className="availability-slots">
            {sortedDates.map((date) => (
              <div key={date} className="date-group">
                <h3 className="date-title">{formatDisplayDate(date)}</h3>
                <div className="slot-list">
                  {groupedSlots[date]
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((slot) => {
                      const past = isPastSlot(slot.date, slot.end_time);
                      return (
                        <div key={slot.id} className={`slot-item ${past ? 'is-past' : ''}`}>
                          <div className="slot-info">
                            <div className="slot-time">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className="slot-meta">
                              <span>{getBranchName(slot.branch_id)}</span>
                              <span className="slot-sep">•</span>
                              <span>
                                Max {slot.max_bookings} booking{slot.max_bookings !== 1 ? 's' : ''}
                              </span>
                              {past && <span className="slot-badge">Past</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="availability-danger-btn"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={isSubmitting}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityEditor;
