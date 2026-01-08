import React from 'react';
import { getDayName, formatRepeatRule, generateUpcomingDates, formatTimeDisplay } from '../../utils/availabilityUtils';

const ScheduledAvailabilityList = ({ 
  availability, 
  branches, 
  onDelete, 
  isLoading, 
  error 
}) => {
  const groupAvailabilityBySchedule = () => {
    const groups = {};
    
    availability.forEach(item => {
      const key = `${item.day_of_week}-${item.start_time}-${item.end_time}-${item.branch_id}`;
      if (!groups[key]) {
        groups[key] = {
          id: item.id,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          branch_id: item.branch_id,
          branch_name: item.branch_name || getBranchName(item.branch_id),
          repeat_type: item.repeat_type,
          repeat_value: item.repeat_value,
          items: []
        };
      }
      groups[key].items.push(item);
    });

    return Object.values(groups);
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch ${branchId}`;
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this availability schedule?')) {
      onDelete(id);
    }
  };

  const groupedAvailability = groupAvailabilityBySchedule();

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        Loading your scheduled availability...
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
        marginBottom: '20px'
      }}>
        {error}
      </div>
    );
  }

  if (groupedAvailability.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '60px 40px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📅</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
          No scheduled availability yet
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px' }}>
          Create your first availability schedule to start accepting client bookings.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {groupedAvailability.map((group, index) => {
        const upcomingDates = generateUpcomingDates({
          day_of_week: group.day_of_week,
          start_time: group.start_time,
          end_time: group.end_time,
          repeat_mode: group.repeat_mode,
          repeat_value: group.repeat_value,
          maxDates: 5 // Show next 5 dates
        });

        return (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {getDayName(group.day_of_week)}s · {formatTimeDisplay(group.start_time)} – {formatTimeDisplay(group.end_time)}
                </h3>
                
                {/* Location Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  backgroundColor: '#e3f2fd',
                  color: '#007bff',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '10px'
                }}>
                  📍 {group.branch_name}
                </div>
                
                {/* Repeat Info */}
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {group.repeat_mode ? formatRepeatRule(group.repeat_mode, group.repeat_value) : 'Weekly recurring'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {group.items.length > 0 && (
                  <button
                    onClick={(e) => handleDelete(group.items[0].id, e)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c82333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc3545';
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Upcoming Dates */}
            <div>
              <h4 style={{
                margin: '0 0 12px 0',
                color: '#333',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Generated upcoming dates:
              </h4>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {upcomingDates.map((date, dateIndex) => (
                  <div
                    key={dateIndex}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#333',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                      e.currentTarget.style.borderColor = '#007bff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {formatDateDisplay(date)}
                  </div>
                ))}
              </div>
              
              {upcomingDates.length === 0 && (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '13px',
                  backgroundColor: '#fff8f8',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  width: '100%'
                }}>
                  No upcoming dates generated. Please check repeat settings.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduledAvailabilityList;
