import React, { useState, useEffect } from 'react';
import availabilityService from '../services/availability.service';
import holidaysService from '../services/holidays.service';

// Configuration
const DISABLE_SLOTS_ON_HOLIDAYS = true;

function CalendarPreview({ me, onDateSelect, onCancelDay, exceptions }) {
  const [slotsByDate, setSlotsByDate] = useState({});
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get next 14 days
      const today = new Date();
      const fromDate = today.toISOString().split('T')[0];
      const toDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // Load slots and holidays in parallel
      const [slotsData, holidaysData] = await Promise.all([
        availabilityService.getLawyerSlots(me.id, {
          from: fromDate,
          to: toDate
        }),
        holidaysService.getHolidaysForDateRange(fromDate, toDate, 'LK')
      ]);

      // Group slots by date
      const grouped = {};
      slotsData.forEach(slot => {
        const date = slot.start.split('T')[0];
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(slot);
      });

      // Build holiday lookup
      const holidayLookup = holidaysService.buildHolidayLookup(holidaysData);

      setSlotsByDate(grouped);
      setHolidays(holidayLookup);
    } catch (error) {
      setError('Failed to load calendar data');
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      const slots = slotsByDate[dateStr] || [];
      const holiday = holidays[dateStr];
      const exception = exceptions?.find(exc => exc.date === dateStr);
      
      // Determine day status
      let status = 'unavailable';
      let statusText = 'Unavailable';
      let statusColor = '#6c757d';
      
      if (holiday && DISABLE_SLOTS_ON_HOLIDAYS) {
        status = 'holiday';
        statusText = holiday.type === 'poya' ? 'Poya' : 'Holiday';
        statusColor = '#fd7e14';
      } else if (exception) {
        status = 'blocked';
        statusText = 'Blocked';
        statusColor = '#dc3545';
      } else if (slots.length > 0) {
        status = 'available';
        statusText = 'Available';
        statusColor = '#28a745';
      }
      
      days.push({
        date: dateStr,
        dayName,
        dayNum,
        month,
        slots,
        holiday,
        exception,
        status,
        statusText,
        statusColor
      });
    }
    
    return days;
  };

  const getDayBackgroundColor = (day) => {
    switch (day.status) {
      case 'available':
        return '#f8fff8';
      case 'blocked':
        return '#fff8f8';
      case 'holiday':
        return '#fff4e6';
      default:
        return '#f8f9fa';
    }
  };

  const getHolidayBadgeText = (holiday) => {
    if (holiday.type === 'poya') return 'Poya';
    return 'Holiday';
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📅</div>
        Loading calendar...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        color: '#dc3545',
        padding: '20px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  const days = getNext14Days();

  return (
    <div>
      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '30px'
      }}>
        {days.map(day => (
          <div
            key={day.date}
            style={{
              padding: '15px',
              border: `2px solid ${day.statusColor}`,
              borderRadius: '12px',
              backgroundColor: getDayBackgroundColor(day),
              cursor: day.status === 'available' || day.status === 'blocked' ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              position: 'relative',
              minHeight: '140px'
            }}
            onClick={() => {
              if (day.status === 'available' || day.status === 'blocked') {
                onDateSelect(day.date);
              }
            }}
            onMouseEnter={(e) => {
              if (day.status === 'available' || day.status === 'blocked') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Holiday Badge */}
            {day.holiday && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#fd7e14',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 'bold',
                zIndex: 1
              }}>
                {getHolidayBadgeText(day.holiday)}
              </div>
            )}

            {/* Date Header */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#333',
                marginBottom: '2px'
              }}>
                {day.dayName}
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: day.statusColor 
              }}>
                {day.dayNum}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {day.month}
              </div>
            </div>
            
            {/* Status and Slots Info */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: day.statusColor,
                marginBottom: '4px'
              }}>
                {day.statusText}
              </div>
              
              {day.slots.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
                </div>
              )}
              
              {day.holiday && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#fd7e14',
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  {day.holiday.localName || day.holiday.name}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {(day.status === 'available' || day.status === 'blocked') && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {day.status === 'available' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateSelect(day.date);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                  >
                    View
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelDay(day.date);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    backgroundColor: day.status === 'blocked' ? '#6c757d' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = day.status === 'blocked' ? '#545b62' : '#c82333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = day.status === 'blocked' ? '#6c757d' : '#dc3545';
                  }}
                >
                  {day.status === 'blocked' ? 'Remove' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Calendar Legend:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '2px' }}></div>
            <span>Available (click to view slots)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '2px' }}></div>
            <span>Blocked (click to unblock)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#fd7e14', borderRadius: '2px' }}></div>
            <span>Holiday/Poya (non-bookable)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#6c757d', borderRadius: '2px' }}></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPreview;
