import React, { useState } from 'react';
import { validateTimeRange, calculateDuration } from '../../utils/availabilityUtils';

const StepTime = ({ data, updateData }) => {
  const [errors, setErrors] = useState({});

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const handleTimeChange = (field, value) => {
    const newData = { [field]: value };
    updateData(newData);
    
    // Validate if both times are set
    const start = field === 'start_time' ? value : data.start_time;
    const end = field === 'end_time' ? value : data.end_time;
    
    if (start && end) {
      const validation = validateTimeRange(start, end);
      setErrors(validation.isValid ? {} : { 
        [field === 'start_time' ? 'start_time' : 'end_time']: validation.error 
      });
    } else {
      // Clear errors for the field being edited
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const timeOptions = generateTimeOptions();
  const hasError = Object.keys(errors).length > 0;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Select your available time range:
        </h4>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Choose start and end times. Times are in 30-minute intervals.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Start Time */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Start Time *
          </label>
          <select
            value={data.start_time || ''}
            onChange={(e) => handleTimeChange('start_time', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.start_time ? '#dc3545' : '#ddd'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select start time</option>
            {timeOptions.map(time => (
              <option key={`start-${time}`} value={`${time} AM`}>
                {time} AM
              </option>
            ))}
            {timeOptions.map(time => (
              <option key={`start-${time}-pm`} value={`${time} PM`}>
                {time} PM
              </option>
            ))}
          </select>
          {errors.start_time && (
            <div style={{
              color: '#dc3545',
              fontSize: '12px',
              marginTop: '5px'
            }}>
              {errors.start_time}
            </div>
          )}
        </div>

        {/* End Time */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            End Time *
          </label>
          <select
            value={data.end_time || ''}
            onChange={(e) => handleTimeChange('end_time', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.end_time ? '#dc3545' : '#ddd'}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select end time</option>
            {timeOptions.map(time => (
              <option key={`end-${time}`} value={`${time} AM`}>
                {time} AM
              </option>
            ))}
            {timeOptions.map(time => (
              <option key={`end-${time}-pm`} value={`${time} PM`}>
                {time} PM
              </option>
            ))}
          </select>
          {errors.end_time && (
            <div style={{
              color: '#dc3545',
              fontSize: '12px',
              marginTop: '5px'
            }}>
              {errors.end_time}
            </div>
          )}
        </div>
      </div>

      {/* Time Summary */}
      {data.start_time && data.end_time && !hasError && (
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #28a745',
          borderRadius: '6px',
          color: '#155724'
        }}>
          <strong>Selected Time:</strong> {data.start_time} - {data.end_time}
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Duration: {calculateDuration(data.start_time, data.end_time)}
          </div>
        </div>
      )}

      {/* Quick Time Options */}
      <div style={{ marginTop: '20px' }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
          Quick Options:
        </h5>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              updateData({ start_time: '9:00 AM', end_time: '5:00 PM' });
              setErrors({});
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#007bff';
            }}
          >
            Business Hours (9 AM - 5 PM)
          </button>
          <button
            onClick={() => {
              updateData({ start_time: '10:00 AM', end_time: '2:00 PM' });
              setErrors({});
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#007bff';
            }}
          >
            Morning (10 AM - 2 PM)
          </button>
          <button
            onClick={() => {
              updateData({ start_time: '2:00 PM', end_time: '6:00 PM' });
              setErrors({});
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#007bff';
            }}
          >
            Afternoon (2 PM - 6 PM)
          </button>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24',
          marginTop: '15px'
        }}>
          ⚠️ {Object.values(errors)[0]}
        </div>
      )}
    </div>
  );
};

export default StepTime;
