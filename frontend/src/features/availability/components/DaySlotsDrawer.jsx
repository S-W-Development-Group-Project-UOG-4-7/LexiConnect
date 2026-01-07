import React, { useState, useEffect } from 'react';
import availabilityService from '../services/availability.service';
import holidaysService from '../services/holidays.service';

// Configuration
const DISABLE_SLOTS_ON_HOLIDAYS = true;

function DaySlotsDrawer({ me, selectedDate, onClose, exceptions, onExceptionCreated, onExceptionDeleted }) {
  const [slots, setSlots] = useState([]);
  const [holiday, setHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadData();
    }
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load slots and holiday data in parallel
      const [slotsData, holidaysData] = await Promise.all([
        availabilityService.getLawyerSlots(me.id, {
          date: selectedDate
        }),
        holidaysService.getPublicHolidays({ 
          year: new Date(selectedDate).getFullYear(),
          countryCode: 'LK' 
        })
      ]);

      // Check if this date is a holiday
      const holidayData = holidaysData.find(h => h.date === selectedDate);
      setHoliday(holidayData || null);

      // Set slots (empty if holiday and slots are disabled)
      if (holidayData && DISABLE_SLOTS_ON_HOLIDAYS) {
        setSlots([]);
      } else {
        setSlots(slotsData);
      }
      
    } catch (error) {
      setError('Failed to load slots for this date');
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelDay = async () => {
    if (!window.confirm(`Are you sure you want to cancel availability for ${formatDate(selectedDate)}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await availabilityService.createException({
        date: selectedDate,
        reason: holiday ? `Holiday: ${holiday.localName || holiday.name}` : 'Cancelled from drawer'
      });
      onExceptionCreated();
      onClose();
    } catch (error) {
      console.error('Failed to cancel day:', error);
      alert('Failed to cancel day. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBlock = async () => {
    const exception = exceptions?.find(exc => exc.date === selectedDate);
    if (!exception) return;

    if (!window.confirm(`Are you sure you want to remove the block for ${formatDate(selectedDate)}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await availabilityService.deleteException(exception.id);
      onExceptionDeleted(exception.id);
      onClose();
    } catch (error) {
      console.error('Failed to remove block:', error);
      alert('Failed to remove block. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const isBlocked = exceptions?.some(exc => exc.date === selectedDate);
  const isHoliday = holiday !== null;
  const isBookable = !isHoliday && !isBlocked && slots.length > 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '450px',
        height: '100%',
        backgroundColor: 'white',
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isHoliday ? '#fff4e6' : 'white'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#333' }}>
              {selectedDate ? formatDate(selectedDate) : 'Select Date'}
            </h3>
            {isHoliday && (
              <div style={{
                fontSize: '14px',
                color: '#fd7e14',
                fontWeight: 'bold',
                marginTop: '4px'
              }}>
                🎉 {holiday.type === 'poya' ? 'Poya Day' : 'Public Holiday'}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              Loading slots...
            </div>
          )}

          {error && (
            <div style={{
              color: '#dc3545',
              padding: '15px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Holiday Banner */}
              {isHoliday && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#fff4e6',
                  border: '2px solid #fd7e14',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fd7e14', marginBottom: '8px' }}>
                    🎉 {holiday.localName || holiday.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {DISABLE_SLOTS_ON_HOLIDAYS 
                      ? 'This is a public holiday. Booking is disabled.'
                      : 'This is a public holiday. Normal booking hours apply.'
                    }
                  </div>
                </div>
              )}

              {/* Status Summary */}
              <div style={{
                padding: '15px',
                backgroundColor: isBookable ? '#f8fff8' : (isBlocked ? '#fff8f8' : '#f8f9fa'),
                border: `1px solid ${isBookable ? '#28a745' : (isBlocked ? '#dc3545' : '#e9ecef')}`,
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {isBookable && '✅ Available for Booking'}
                  {isBlocked && '🚫 Date Blocked'}
                  {isHoliday && !DISABLE_SLOTS_ON_HOLIDAYS && '🎉 Holiday - Available'}
                  {isHoliday && DISABLE_SLOTS_ON_HOLIDAYS && '🎉 Holiday - Non-bookable'}
                  {!isBookable && !isBlocked && !isHoliday && '❌ No Slots Available'}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {slots.length} slot{slots.length !== 1 ? 's' : ''} available
                </div>
              </div>

              {/* Slots List */}
              {slots.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Available Slots</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '15px',
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e9ecef';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#007bff', fontSize: '16px' }}>
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </strong>
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          📍 {slot.branch_label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                          Branch ID: {slot.branch_id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Slots Message */}
              {slots.length === 0 && !isHoliday && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📅</div>
                  <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                    {isBlocked ? 'This date is blocked' : 'No available slots'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    {isBlocked 
                      ? 'Remove the block to enable availability for this date.'
                      : 'Create availability rules to generate slots for this date.'
                    }
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isHoliday ? '#fff4e6' : 'white'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {isBookable && `${slots.length} slot${slots.length !== 1 ? 's' : ''} available`}
            {isBlocked && 'Date blocked'}
            {isHoliday && 'Public holiday'}
            {!isBookable && !isBlocked && !isHoliday && 'No slots available'}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Block/Unblock Button */}
            {!isHoliday && (
              <button
                onClick={isBlocked ? handleRemoveBlock : handleCancelDay}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isBlocked ? '#28a745' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {actionLoading ? 'Processing...' : (isBlocked ? 'Remove Block' : 'Cancel Day')}
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DaySlotsDrawer;
