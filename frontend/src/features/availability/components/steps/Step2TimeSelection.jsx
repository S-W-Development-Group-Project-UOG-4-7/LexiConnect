import React, { useState } from 'react';

const Step2TimeSelection = ({ data, updateData }) => {
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

  const validateTimes = (start, end) => {
    const newErrors = {};
    
    if (!start) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!end) {
      newErrors.end_time = 'End time is required';
    }
    
    if (start && end) {
      // Convert to 24-hour for comparison
      const start24 = convertTo24Hour(start);
      const end24 = convertTo24Hour(end);
      
      if (start24 >= end24) {
        newErrors.end_time = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertTo24Hour = (time12) => {
    const [time, period] = time12.split(' ');
    if (!time || !period) return time12;
    
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + (parseInt(minutes) || 0);
  };

  const handleTimeChange = (field, value) => {
    const newData = { [field]: value };
    updateData(newData);
    
    // Validate if both times are set
    if (field === 'start_time' && data.end_time) {
      validateTimes(value, data.end_time);
    } else if (field === 'end_time' && data.start_time) {
      validateTimes(data.start_time, value);
    }
  };

  const timeOptions = generateTimeOptions();

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
      {data.start_time && data.end_time && !errors.start_time && !errors.end_time && (
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
              fontSize: '12px'
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
              fontSize: '12px'
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
              fontSize: '12px'
            }}
          >
            Afternoon (2 PM - 6 PM)
          </button>
        </div>
      </div>
    </div>
  );
};

const calculateDuration = (start, end) => {
  const startMinutes = convertToMinutes(start);
  const endMinutes = convertToMinutes(end);
  const duration = endMinutes - startMinutes;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

const convertToMinutes = (time12) => {
  const [time, period] = time12.split(' ');
  if (!time || !period) return 0;
  
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + (parseInt(minutes) || 0);
};

export default Step2TimeSelection;
