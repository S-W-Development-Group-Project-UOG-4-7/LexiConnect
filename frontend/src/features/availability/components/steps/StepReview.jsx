import React from 'react';
import { getDayName, formatRepeatRule, generateUpcomingDates } from '../../utils/availabilityUtils';

const StepReview = ({ data, updateData, branches }) => {
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  const formatTimeDisplay = (time12) => {
    return time12; // Already in 12-hour format
  };

  const handleConfirm = async () => {
    if (window.confirm('Are you sure you want to create this availability schedule?')) {
      try {
        // Backend expects simple weekly availability payload
        const payload = {
          day_of_week: data.day_of_week,
          start_time: data.start_time, // Keep 12-hour format
          end_time: data.end_time,
          branch_id: data.branch_id,
          max_bookings: null
        };

        // This will be handled by the parent component
        updateData({ confirmPayload: payload });
      } catch (error) {
        console.error('Error preparing confirmation:', error);
        alert('Failed to prepare availability. Please try again.');
      }
    }
  };

  const handleEdit = () => {
    // Go back to first step for editing
    updateData({ editMode: true });
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
        padding: '24px',
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
          padding: '14px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
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
          padding: '14px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
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
          padding: '14px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
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
          padding: '14px 0'
        }}>
          <div style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
            <strong>Repeat:</strong>
          </div>
          <div style={{
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'right',
            maxWidth: '300px'
          }}>
            {data.repeat_mode ? formatRepeatRule(data.repeat_mode, data.repeat_value) : 'Weekly recurring'}
          </div>
        </div>
      </div>

      {/* Human-Readable Summary */}
      <div style={{
        padding: '20px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #007bff',
        borderRadius: '8px',
        color: '#004085',
        fontSize: '16px',
        lineHeight: '1.5',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        You are available every <strong>{getDayName(data.day_of_week)}</strong> from{' '}
        <strong>{formatTimeDisplay(data.start_time)}</strong> to{' '}
        <strong>{formatTimeDisplay(data.end_time)}</strong> at{' '}
        <strong>{getBranchName(data.branch_id)}</strong>
        {data.repeat_mode ? `, repeating <strong>${formatRepeatRule(data.repeat_mode, data.repeat_value).toLowerCase()}</strong>` : ''}
        .
      </div>

      {/* Important Notes */}
      <div style={{
        padding: '18px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        color: '#856404',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '25px'
      }}>
        <strong style={{ display: 'block', marginBottom: '10px' }}>
          ⚠️ Important Notes:
        </strong>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '6px' }}>
            This will create a recurring weekly availability slot
          </li>
          <li style={{ marginBottom: '6px' }}>
            This slot will be available for client bookings every week
          </li>
          <li style={{ marginBottom: '6px' }}>
            You can edit or delete this availability later
          </li>
          <li>
            Clients will see this available slot in their booking interface
          </li>
        </ul>
      </div>

      {/* Confirmation Message */}
      <div style={{
        padding: '18px',
        backgroundColor: '#e8f5e8',
        border: '1px solid #28a745',
        borderRadius: '8px',
        color: '#155724',
        fontSize: '15px',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>
          ✅ Ready to create availability?
        </strong>
        <div>
          Click "Confirm availability" to finalize your schedule.
        </div>
      </div>
    </div>
  );
};

export default StepReview;
