import React from 'react';
import { getDayName, formatRepeatRule } from '../../utils/availabilityUtils';

const Step5ReviewConfirm = ({ data, updateData, branches, upcomingDates }) => {
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  const formatTimeDisplay = (time12) => {
    return time12; // Already in 12-hour format
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Review your availability details:
        </h4>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Please confirm all details are correct before creating your availability.
        </p>
      </div>

      {/* Review Summary Card */}
      <div style={{
        padding: '20px',
        border: '2px solid #e9ecef',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa',
        marginBottom: '25px'
      }}>
        {/* Day */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <strong>Day:</strong>
          </div>
          <div style={{
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {getDayName(data.day_of_week)}
          </div>
        </div>

        {/* Time */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <strong>Time:</strong>
          </div>
          <div style={{
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {formatTimeDisplay(data.start_time)} – {formatTimeDisplay(data.end_time)}
          </div>
        </div>

        {/* Location */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <strong>Location:</strong>
          </div>
          <div style={{
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'right',
            maxWidth: '300px'
          }}>
            {getBranchName(data.branch_id)}
          </div>
        </div>

        {/* Repeat Rule */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <strong>Repeat:</strong>
          </div>
          <div style={{
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'right',
            maxWidth: '300px'
          }}>
            {formatRepeatRule(data.repeat_type, data.repeat_value)}
          </div>
        </div>
      </div>

      {/* Upcoming Dates Preview */}
      <div style={{ marginBottom: '25px' }}>
        <h5 style={{ 
          margin: '0 0 15px 0', 
          color: '#333',
          fontSize: '16px' 
        }}>
          Upcoming Dates Preview:
        </h5>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px'
        }}>
          {upcomingDates.map((date, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                flexShrink: 0
              }} />
              {formatDateDisplay(date)}
            </div>
          ))}
        </div>
        
        {upcomingDates.length === 0 && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px'
          }}>
            No upcoming dates generated. Please check your repeat settings.
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div style={{
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>
          ⚠️ Important Notes:
        </strong>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '5px' }}>
            This will create recurring weekly availability slots
          </li>
          <li style={{ marginBottom: '5px' }}>
            Each slot will be available for client bookings
          </li>
          <li style={{ marginBottom: '5px' }}>
            You can edit or delete availability later
          </li>
          <li>
            Clients will see these available slots in their booking interface
          </li>
        </ul>
      </div>

      {/* Confirmation Message */}
      <div style={{
        padding: '15px',
        backgroundColor: '#e8f5e8',
        border: '1px solid #28a745',
        borderRadius: '6px',
        color: '#155724',
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <strong>Ready to create availability?</strong>
        <div style={{ marginTop: '5px' }}>
          Click "Confirm Availability" to finalize your schedule.
        </div>
      </div>
    </div>
  );
};

export default Step5ReviewConfirm;
