import React from 'react';

const Step3LocationSelection = ({ data, updateData, branches }) => {
  const handleLocationSelect = (branchId) => {
    updateData({ branch_id: parseInt(branchId) });
  };

  // Predefined locations with their corresponding branch IDs
  const predefinedLocations = [
    { name: 'Firm Office – Colombo', type: 'office' },
    { name: 'Home Office – Dehiwala', type: 'home' },
    { name: 'Online Consultation', type: 'online' }
  ];

  // Map predefined locations to actual branch IDs
  const getLocationBranchId = (locationName) => {
    const branch = branches.find(b => 
      b.name.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(b.name.toLowerCase())
    );
    return branch ? branch.id : null;
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Select your consultation location:
        </h4>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Choose exactly one location where you'll be available for consultations.
        </p>
      </div>

      {/* Predefined Location Options */}
      <div style={{
        display: 'grid',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {predefinedLocations.map((location, index) => {
          const branchId = getLocationBranchId(location.name);
          const isSelected = data.branch_id === branchId;
          const isAvailable = branchId !== null;

          return (
            <div
              key={index}
              onClick={() => isAvailable && handleLocationSelect(branchId)}
              style={{
                padding: '16px',
                border: `2px solid ${isSelected ? '#007bff' : (isAvailable ? '#e9ecef' : '#f8d7da')}`,
                borderRadius: '8px',
                backgroundColor: isSelected ? '#e3f2fd' : (isAvailable ? 'white' : '#fff8f8'),
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#007bff';
                }
              }}
              onMouseLeave={(e) => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e9ecef';
                }
              }}
            >
              {/* Location Icon */}
              <div style={{
                fontSize: '24px',
                width: '40px',
                textAlign: 'center'
              }}>
                {location.type === 'office' && '🏢'}
                {location.type === 'home' && '🏠'}
                {location.type === 'online' && '💻'}
              </div>

              {/* Location Details */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 'bold',
                  color: isSelected ? '#007bff' : '#333',
                  marginBottom: '4px'
                }}>
                  {location.name}
                </div>
                {!isAvailable && (
                  <div style={{
                    fontSize: '12px',
                    color: '#dc3545'
                  }}>
                    ⚠️ This location is not available in the system
                  </div>
                )}
                {isAvailable && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    ✓ Available for selection
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div style={{
                  color: '#007bff',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alternative: Branch Dropdown */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '6px'
      }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
          Or select from all available branches:
        </h5>
        <select
          value={data.branch_id || ''}
          onChange={(e) => handleLocationSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select a branch</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Location Summary */}
      {data.branch_id && (
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #28a745',
          borderRadius: '6px',
          color: '#155724',
          marginTop: '20px'
        }}>
          <strong>Selected Location:</strong>{' '}
          {branches.find(b => b.id === data.branch_id)?.name || `Branch ${data.branch_id}`}
        </div>
      )}

      {/* Warning if no branch is selected */}
      {!data.branch_id && branches.length === 0 && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          color: '#856404',
          marginTop: '20px'
        }}>
          <strong>⚠️ No branches available</strong>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Please contact an administrator to set up branch locations before creating availability.
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3LocationSelection;
