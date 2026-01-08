import React, { useState, useEffect } from 'react';
import CreateAvailabilityWizard from '../components/CreateAvailabilityWizard';
import ScheduledAvailabilityList from '../components/ScheduledAvailabilityList';
import availabilityService from '../services/availability.service';
import { getErrorMessage } from '../utils/availabilityUtils';

const AvailabilityManagementPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [availabilityData, branchesData] = await Promise.all([
        availabilityService.getMyWeeklyAvailability(),
        availabilityService.getBranches()
      ]);
      setWeeklyAvailability(availabilityData || []);
      setBranches(branchesData || []);
    } catch (error) {
      console.error('Failed to load availability data:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    setSuccessMessage('Availability created successfully!');
    loadData(); // Refresh list
    setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
  };

  const handleDeleteAvailability = async (id) => {
    try {
      await availabilityService.deleteWeeklyAvailability(id);
      // Optimistic removal + refetch for consistency
      setWeeklyAvailability(prev => prev.filter(item => item.id !== id));
      setSuccessMessage('Availability deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Refetch to ensure consistency with backend
      setTimeout(() => loadData(), 500);
    } catch (error) {
      console.error('Failed to delete availability:', error);
      setError(getErrorMessage(error));
      // Refetch on error to restore correct state
      loadData();
    }
  };

  if (showWizard) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        marginLeft: '250px' // Account for sidebar
      }}>
        <CreateAvailabilityWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      marginLeft: '250px' // Account for sidebar
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '28px' }}>
              Your Scheduled Availability
            </h1>
            <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
              Manage your appointment availability and upcoming sessions
            </p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            style={{
              padding: '14px 28px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
            }}
          >
            + Add new availability
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          color: '#155724',
          padding: '16px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          color: '#721c24',
          padding: '16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Scheduled Availability List */}
      <ScheduledAvailabilityList
        availability={weeklyAvailability}
        branches={branches}
        onDelete={handleDeleteAvailability}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default AvailabilityManagementPage;
