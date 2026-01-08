import React, { useState, useEffect } from 'react';
import StepDay from './steps/StepDay';
import StepTime from './steps/StepTime';
import StepLocation from './steps/StepLocation';
import StepRepeat from './steps/StepRepeat';
import StepReview from './steps/StepReview';
import availabilityService from '../services/availability.service';
import { generateUpcomingDates, formatRepeatRule, to24Hour, getErrorMessage } from '../utils/availabilityUtils';

const CreateAvailabilityWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]);
  
  // Wizard data
  const [wizardData, setWizardData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    branch_id: null,
    location_label: '',
    repeat_mode: 'weeks', // Frontend-only
    repeat_value: 4
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const branchesData = await availabilityService.getBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to load branches:', error);
      setError(getErrorMessage(error));
    }
  };

  const updateWizardData = (newData) => {
    setWizardData(prev => ({ ...prev, ...newData }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return wizardData.day_of_week !== '';
      case 2:
        return wizardData.start_time && wizardData.end_time && 
               wizardData.start_time < wizardData.end_time;
      case 3:
        return wizardData.branch_id !== null;
      case 4:
        return wizardData.repeat_mode && wizardData.repeat_value;
      case 5:
        return true; // Review step always allows confirmation
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        setError('');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Safe max_bookings validation
      const maxBookings = Number.isFinite(Number(wizardData.max_bookings)) 
        ? Number(wizardData.max_bookings) 
        : 5;
      const clampedMaxBookings = Math.min(50, Math.max(1, maxBookings));
      
      // Safe branch_id validation
      const branchId = Number.isFinite(Number(wizardData.branch_id)) 
        ? Number(wizardData.branch_id) 
        : null;
      
      if (!branchId) {
        setError('Please select a valid location/branch.');
        return;
      }
      
      // Backend expects exact schema match
      const payload = {
        day_of_week: wizardData.day_of_week,      // lowercase: "monday"
        start_time: wizardData.start_time,        // "10:00 AM" format
        end_time: wizardData.end_time,           // "4:00 PM" format
        branch_id: branchId,                     // Safe integer
        max_bookings: clampedMaxBookings          // Safe integer 1-50
        // NOTE: repeat_mode/repeat_value are frontend-only
      };

      await availabilityService.createWeeklyAvailability(payload);
      onComplete();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    const titles = {
      1: 'Select Day',
      2: 'Select Time',
      3: 'Select Location',
      4: 'Set Repeat Rule',
      5: 'Review & Confirm'
    };
    return titles[currentStep];
  };

  const renderStep = () => {
    const stepProps = {
      data: wizardData,
      updateData: updateWizardData,
      branches: branches
    };

    switch (currentStep) {
      case 1:
        return <StepDay {...stepProps} />;
      case 2:
        return <StepTime {...stepProps} />;
      case 3:
        return <StepLocation {...stepProps} />;
      case 4:
        return <StepRepeat {...stepProps} />;
      case 5:
        return (
          <StepReview 
            {...stepProps} 
            upcomingDates={generateUpcomingDates({
              day_of_week: wizardData.day_of_week,
              start_time: wizardData.start_time,
              end_time: wizardData.end_time,
              repeat_mode: wizardData.repeat_mode,
              repeat_value: wizardData.repeat_value
            })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '650px',
      margin: '0 auto',
      padding: '25px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      border: '1px solid #e9ecef'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '24px' }}>
          Create Availability
        </h2>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                style={{
                  width: '20%',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: step <= currentStep ? '#007bff' : '#999'
                }}
              >
                Step {step}
              </div>
            ))}
          </div>
          <div style={{
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentStep / 5) * 100}%`,
              height: '100%',
              backgroundColor: '#007bff',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <h3 style={{ margin: '0', color: '#666', fontSize: '18px' }}>
          {getStepTitle()}
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          color: '#dc3545',
          padding: '15px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          marginBottom: '25px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Step Content */}
      <div style={{ marginBottom: '30px', minHeight: '350px' }}>
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '25px',
        borderTop: '1px solid #e9ecef'
      }}>
        <div>
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#545b62';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
              }}
            >
              ← Back
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#545b62';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            Cancel
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceedToNext() || isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: canProceedToNext() ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: canProceedToNext() && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (canProceedToNext() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = canProceedToNext() ? '#007bff' : '#6c757d';
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#218838';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isLoading ? '#6c757d' : '#28a745';
              }}
            >
              {isLoading ? 'Creating...' : 'Confirm Availability ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAvailabilityWizard;
