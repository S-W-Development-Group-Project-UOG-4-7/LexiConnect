import React, { useState, useEffect } from 'react';
import RuleForm from '../components/RuleForm';
import CalendarPreview from '../components/CalendarPreview';
import DaySlotsDrawer from '../components/DaySlotsDrawer';
import availabilityService from '../services/availability.service';

function AvailabilityManagePage({ me, branches }) {
  const [rules, setRules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, exceptionsData] = await Promise.all([
        availabilityService.getMyRules(),
        availabilityService.getMyExceptions()
      ]);
      setRules(rulesData);
      setExceptions(exceptionsData);
    } catch (error) {
      console.error('Failed to load availability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRuleCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRuleDeleted = (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    setRefreshKey(prev => prev + 1);
  };

  const handleExceptionCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExceptionDeleted = (exceptionId) => {
    setExceptions(prev => prev.filter(exc => exc.id !== exceptionId));
    setRefreshKey(prev => prev + 1);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDrawer(true);
  };

  const handleCancelDay = async (date) => {
    try {
      await availabilityService.createException({
        date: date,
        reason: 'Cancelled from calendar'
      });
      handleExceptionCreated();
    } catch (error) {
      console.error('Failed to cancel day:', error);
    }
  };

  const handleRemoveBlock = async (exceptionId) => {
    try {
      await availabilityService.deleteException(exceptionId);
      handleExceptionDeleted(exceptionId);
    } catch (error) {
      console.error('Failed to remove block:', error);
    }
  };

  // Summary cards data
  const weeklyRules = rules.length;
  const totalSlots = 'Auto-calculated'; // Could be calculated from calendar data
  const activeBranches = [...new Set(rules.map(rule => rule.branch_id))].length;

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Page Title */}
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        Availability Management
      </h1>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {weeklyRules}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Weekly Rules</div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {totalSlots}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Slots</div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
            {activeBranches}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Active Branches</div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {exceptions.length}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Blocked Dates</div>
        </div>
      </div>

      {/* Section 1: Create Availability Rule */}
      <div style={{ 
        marginBottom: '40px', 
        padding: '25px', 
        border: '1px solid #e9ecef', 
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>
          Create Availability Rule
        </h2>
        <RuleForm 
          branches={branches} 
          onRuleCreated={handleRuleCreated}
          onRuleDeleted={handleRuleDeleted}
          rules={rules}
        />
      </div>

      {/* Section 2: Calendar Preview */}
      <div style={{ 
        marginBottom: '40px', 
        padding: '25px', 
        border: '1px solid #e9ecef', 
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>
          Calendar Preview
        </h2>
        <CalendarPreview
          me={me}
          onDateSelect={handleDateSelect}
          onCancelDay={handleCancelDay}
          exceptions={exceptions}
        />
      </div>

      {/* Section 3: Blocked Dates (Inline Exceptions) */}
      <div style={{ 
        padding: '25px', 
        border: '1px solid #e9ecef', 
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>
          Blocked Dates
        </h2>
        {exceptions.length === 0 ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            No blocked dates found.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {exceptions.map(exception => (
              <div 
                key={exception.id} 
                style={{
                  padding: '15px',
                  border: '1px solid #dc3545',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#fff8f8'
                }}
              >
                <div>
                  <strong>{new Date(exception.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</strong>
                  {exception.reason && (
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {exception.reason}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveBlock(exception.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Remove Block
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day Slots Drawer */}
      {showDrawer && (
        <DaySlotsDrawer
          me={me}
          selectedDate={selectedDate}
          onClose={() => setShowDrawer(false)}
          exceptions={exceptions}
          onExceptionCreated={handleExceptionCreated}
          onExceptionDeleted={handleExceptionDeleted}
        />
      )}
    </div>
  );
}

export default AvailabilityManagePage;
