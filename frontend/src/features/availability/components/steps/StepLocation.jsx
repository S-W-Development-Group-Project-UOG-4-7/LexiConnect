import React from 'react';

const StepLocation = ({ data, updateData, branches = [] }) => {
  const handleLocationSelect = (branchId, locationLabel) => {
    const parsed =
      branchId === null || branchId === undefined || branchId === ''
        ? null
        : Number(branchId);

    updateData({
      branch_id: Number.isFinite(parsed) ? parsed : null,
      location_label: locationLabel || ''
    });
  };

  // Predefined locations with their descriptions
  const predefinedLocations = [
    {
      name: 'Firm Office – Colombo',
      type: 'office',
      description: 'Main office in the city center',
      icon: '🏢'
    },
    {
      name: 'Home Office – Dehiwala',
      type: 'home',
      description: 'Convenient suburban location',
      icon: '🏠'
    },
    {
      name: 'Online Consultation',
      type: 'online',
      description: 'Video call via Zoom or Teams',
      icon: '💻'
    }
  ];

  // More reliable matching (branch names may not exactly include the full label)
  const LOCATION_BRANCH_ALIASES = {
    'Firm Office – Colombo': ['colombo', 'firm', 'main', 'head', 'hq', 'office'],
    'Home Office – Dehiwala': ['dehiwala', 'home', 'suburban', 'residence'],
    'Online Consultation': ['online', 'virtual', 'zoom', 'teams', 'video', 'remote']
  };

  // Map predefined locations to actual branch IDs
  const getLocationBranchId = (locationName) => {
    const aliases = LOCATION_BRANCH_ALIASES[locationName] || [locationName];

    const branch = branches.find((b) => {
      const bn = String(b?.name || '').toLowerCase();
      return aliases.some((a) => bn.includes(String(a).toLowerCase()));
    });

    return branch ? Number(branch.id) : null;
  };

  const getSelectedLocationInfo = () => {
    if (!data.branch_id) return null;

    // Check if matches predefined location
    const predefined = predefinedLocations.find((loc) => {
      const branchId = getLocationBranchId(loc.name);
      return branchId === Number(data.branch_id);
    });

    if (predefined) return predefined;

    // Fallback to branch name
    const branch = branches.find((b) => Number(b.id) === Number(data.branch_id));
    return branch ? { name: branch.name, type: 'other', icon: '📍' } : null;
  };

  const selectedLocation = getSelectedLocationInfo();

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
      <div
        style={{
          display: 'grid',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {predefinedLocations.map((location, index) => {
          const branchId = getLocationBranchId(location.name);
          const isSelected = Number(data.branch_id) === Number(branchId);
          const isAvailable = branchId !== null;

          return (
            <div
              key={index}
              onClick={() => isAvailable && handleLocationSelect(branchId, location.name)}
              style={{
                padding: '20px',
                border: `2px solid ${
                  isSelected ? '#007bff' : isAvailable ? '#e9ecef' : '#f8d7da'
                }`,
                borderRadius: '12px',
                backgroundColor: isSelected ? '#e3f2fd' : isAvailable ? 'white' : '#fff8f8',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(0,123,255,0.15)'
                  : '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }
              }}
            >
              {/* Location Icon */}
              <div
                style={{
                  fontSize: '32px',
                  width: '50px',
                  textAlign: 'center',
                  flexShrink: 0
                }}
              >
                {location.icon}
              </div>

              {/* Location Details */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    color: isSelected ? '#007bff' : '#333',
                    marginBottom: '6px',
                    fontSize: '16px'
                  }}
                >
                  {location.name}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: isAvailable ? '#666' : '#dc3545',
                    lineHeight: '1.4'
                  }}
                >
                  {location.description}
                </div>

                {!isAvailable && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#dc3545',
                      fontWeight: '500',
                      marginTop: '6px'
                    }}
                  >
                    ⚠️ This location is not available in system
                  </div>
                )}

                {isAvailable && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#28a745',
                      fontWeight: '500',
                      marginTop: '6px'
                    }}
                  >
                    ✓ Available for selection
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div
                  style={{
                    color: '#007bff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alternative: Branch Dropdown */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px'
        }}
      >
        <h5 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
          Or select from all available branches:
        </h5>

        <select
          value={data.branch_id || ''}
          onChange={(e) => {
            const value = e.target.value;

            // Prevent NaN branch_id when clearing selection
            if (!value) {
              updateData({ branch_id: null, location_label: '' });
              return;
            }

            const branchId = Number(value);
            const branch = branches.find((b) => Number(b.id) === branchId);
            handleLocationSelect(branchId, branch ? branch.name : '');
          }}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select a branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Location Summary */}
      {selectedLocation && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#e8f5e8',
            border: '1px solid #28a745',
            borderRadius: '8px',
            color: '#155724',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '24px' }}>{selectedLocation.icon}</div>
          <div>
            <strong>Selected Location:</strong>{' '}
            {selectedLocation.name}
          </div>
        </div>
      )}

      {/* Warning if no branch is selected and branches are unavailable */}
      {!data.branch_id && branches.length === 0 && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            color: '#856404',
            marginTop: '20px'
          }}
        >
          <strong>⚠️ No branches available</strong>
          <div style={{ fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
            Please contact an administrator to set up branch locations before creating
            availability.
          </div>
        </div>
      )}
    </div>
  );
};

export default StepLocation;
