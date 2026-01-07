import React from 'react';
import { getDayName } from '../../utils/availabilityUtils';

const StepDay = ({ data, updateData }) => {
  const days = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const handleDaySelect = (day) => {
    updateData({ day_of_week: day });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Select day of the week:
        </h4>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Choose exactly one day for your recurring availability.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {days.map(day => (
          <button
            key={day.value}
            onClick={() => handleDaySelect(day.value)}
            style={{
              padding: '20px 10px',
              border: `2px solid ${data.day_of_week === day.value ? '#007bff' : '#e9ecef'}`,
              borderRadius: '8px',
              backgroundColor: data.day_of_week === day.value ? '#e3f2fd' : 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: data.day_of_week === day.value ? 'bold' : 'normal',
              color: data.day_of_week === day.value ? '#007bff' : '#333',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              boxShadow: data.day_of_week === day.value ? '0 2px 8px rgba(0,123,255,0.2)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (data.day_of_week !== day.value) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (data.day_of_week !== day.value) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e9ecef';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '5px' }}>
              {day.label}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {getDayName(day.value)}
            </div>
          </button>
        ))}
      </div>

      {data.day_of_week && (
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #28a745',
          borderRadius: '6px',
          color: '#155724'
        }}>
          <strong>Selected:</strong> {getDayName(data.day_of_week)}
        </div>
      )}
    </div>
  );
};

export default StepDay;
