import React, { useState } from 'react';

const StepRepeat = ({ data, updateData }) => {
  const [errors, setErrors] = useState({});

  const validateRepeatRule = () => {
    const newErrors = {};
    
    if (data.repeat_mode === 'weeks') {
      const weeks = parseInt(data.repeat_value);
      if (!data.repeat_value || weeks < 1) {
        newErrors.repeat_value = 'Number of weeks must be at least 1';
      } else if (weeks > 52) {
        newErrors.repeat_value = 'Cannot repeat for more than 52 weeks';
      }
    } else if (data.repeat_mode === 'until_date') {
      if (!data.repeat_value) {
        newErrors.repeat_value = 'End date is required';
      } else {
        const selectedDate = new Date(data.repeat_value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
          newErrors.repeat_value = 'End date must be in the future';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRepeatTypeChange = (type) => {
    const newData = { repeat_mode: type };
    
    // Set default values based on type
    if (type === 'weeks') {
      newData.repeat_value = 4;
    } else if (type === 'until_date') {
      // Default to 3 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      newData.repeat_value = defaultDate.toISOString().split('T')[0];
    }
    
    updateData(newData);
    setErrors({});
  };

  const handleRepeatValueChange = (value) => {
    updateData({ repeat_value: value });
    
    // Validate on change with small delay
    setTimeout(() => validateRepeatRule(), 100);
  };

  // Get minimum date for until_date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date for until_date (1 year from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate.toISOString().split('T')[0];
  };

  const hasError = Object.keys(errors).length > 0;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Set your repeat schedule:
        </h4>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Choose how long this recurring availability should continue.
        </p>
      </div>

      {/* Repeat Type Selection */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {/* Weeks Option */}
          <div
            onClick={() => handleRepeatTypeChange('weeks')}
            style={{
              padding: '18px',
              border: `2px solid ${data.repeat_type === 'weeks' ? '#007bff' : '#e9ecef'}`,
              borderRadius: '12px',
              backgroundColor: data.repeat_type === 'weeks' ? '#e3f2fd' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: data.repeat_type === 'weeks' ? '0 4px 12px rgba(0,123,255,0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              if (data.repeat_type !== 'weeks') {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (data.repeat_type !== 'weeks') {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e9ecef';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: `2px solid ${data.repeat_type === 'weeks' ? '#007bff' : '#ddd'}`,
                borderRadius: '50%',
                backgroundColor: data.repeat_type === 'weeks' ? '#007bff' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {data.repeat_type === 'weeks' && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  color: data.repeat_type === 'weeks' ? '#007bff' : '#333',
                  marginBottom: '6px',
                  fontSize: '16px'
                }}>
                  Repeat for a number of weeks
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                  Set a specific number of weeks for this availability
                </div>
              </div>
            </div>
          </div>

          {/* Until Date Option */}
          <div
            onClick={() => handleRepeatTypeChange('until_date')}
            style={{
              padding: '18px',
              border: `2px solid ${data.repeat_type === 'until_date' ? '#007bff' : '#e9ecef'}`,
              borderRadius: '12px',
              backgroundColor: data.repeat_type === 'until_date' ? '#e3f2fd' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: data.repeat_type === 'until_date' ? '0 4px 12px rgba(0,123,255,0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              if (data.repeat_type !== 'until_date') {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (data.repeat_type !== 'until_date') {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e9ecef';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: `2px solid ${data.repeat_type === 'until_date' ? '#007bff' : '#ddd'}`,
                borderRadius: '50%',
                backgroundColor: data.repeat_type === 'until_date' ? '#007bff' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {data.repeat_type === 'until_date' && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  color: data.repeat_type === 'until_date' ? '#007bff' : '#333',
                  marginBottom: '6px',
                  fontSize: '16px'
                }}>
                  Every week until a specific end date
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                  Continue weekly until specified date
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repeat Value Input */}
      <div style={{ marginBottom: '20px' }}>
        {data.repeat_type === 'weeks' && (
          <div>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '16px'
            }}>
              Number of weeks:
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={data.repeat_value || ''}
              onChange={(e) => handleRepeatValueChange(parseInt(e.target.value) || '')}
              style={{
                width: '200px',
                padding: '12px',
                border: `1px solid ${errors.repeat_value ? '#dc3545' : '#ddd'}`,
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            {errors.repeat_value && (
              <div style={{
                color: '#dc3545',
                fontSize: '13px',
                marginTop: '6px'
              }}>
                {errors.repeat_value}
              </div>
            )}
            <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
              This availability will repeat for {data.repeat_value || 0} week{(data.repeat_value || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {data.repeat_type === 'until_date' && (
          <div>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '16px'
            }}>
              End date:
            </label>
            <input
              type="date"
              min={getMinDate()}
              max={getMaxDate()}
              value={data.repeat_value || ''}
              onChange={(e) => handleRepeatValueChange(e.target.value)}
              style={{
                padding: '12px',
                border: `1px solid ${errors.repeat_value ? '#dc3545' : '#ddd'}`,
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            {errors.repeat_value && (
              <div style={{
                color: '#dc3545',
                fontSize: '13px',
                marginTop: '6px'
              }}>
                {errors.repeat_value}
              </div>
            )}
            <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
              This availability will repeat weekly until {data.repeat_value || 'selected date'}
            </div>
          </div>
        )}
      </div>

      {/* Quick Options */}
      <div style={{ marginTop: '25px' }}>
        <h5 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
          Quick Options:
        </h5>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              updateData({ repeat_type: 'weeks', repeat_value: 4 });
              setErrors({});
            }}
            style={{
              padding: '10px 16px',
              border: '1px solid #007bff',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
            4 Weeks
          </button>
          <button
            onClick={() => {
              updateData({ repeat_type: 'weeks', repeat_value: 8 });
              setErrors({});
            }}
            style={{
              padding: '10px 16px',
              border: '1px solid #007bff',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
            8 Weeks
          </button>
          <button
            onClick={() => {
              updateData({ repeat_type: 'weeks', repeat_value: 12 });
              setErrors({});
            }}
            style={{
              padding: '10px 16px',
              border: '1px solid #007bff',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
            12 Weeks
          </button>
          <button
            onClick={() => {
              const threeMonths = new Date();
              threeMonths.setMonth(threeMonths.getMonth() + 3);
              updateData({ repeat_type: 'until_date', repeat_value: threeMonths.toISOString().split('T')[0] });
              setErrors({});
            }}
            style={{
              padding: '10px 16px',
              border: '1px solid #007bff',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
            3 Months
          </button>
          <button
            onClick={() => {
              const sixMonths = new Date();
              sixMonths.setMonth(sixMonths.getMonth() + 6);
              updateData({ repeat_type: 'until_date', repeat_value: sixMonths.toISOString().split('T')[0] });
              setErrors({});
            }}
            style={{
              padding: '10px 16px',
              border: '1px solid #007bff',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
            6 Months
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

      {/* Summary */}
      {data.repeat_type && data.repeat_value && !hasError && (
        <div style={{
          padding: '16px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #28a745',
          borderRadius: '8px',
          color: '#155724',
          marginTop: '20px'
        }}>
          <strong>Repeat Rule:</strong>{' '}
          {data.repeat_type === 'weeks' 
            ? `${data.repeat_value} week${data.repeat_value !== 1 ? 's' : ''}`
            : `Until ${new Date(data.repeat_value).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}`
          }
        </div>
      )}
    </div>
  );
};

export default StepRepeat;
