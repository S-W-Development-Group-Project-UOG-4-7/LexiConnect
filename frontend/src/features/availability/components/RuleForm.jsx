import React, { useState } from 'react';
import availabilityService from '../services/availability.service';

function RuleForm({ branches, onRuleCreated, onRuleDeleted, rules }) {
  const [formData, setFormData] = useState({
    day_of_week: 'mon',
    start_time: '09:00',
    end_time: '17:00',
    branch_id: '',
    repeat_until: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.branch_id) {
      setError('Please select a branch');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        branch_id: parseInt(formData.branch_id),
        repeat_until: formData.repeat_until || null
      };

      await availabilityService.createRule(payload);
      onRuleCreated();
      
      // Reset form
      setFormData({
        day_of_week: 'mon',
        start_time: '09:00',
        end_time: '17:00',
        branch_id: '',
        repeat_until: ''
      });
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      await availabilityService.deleteRule(ruleId);
      onRuleDeleted(ruleId);
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert('Failed to delete rule. Please try again.');
    }
  };

  const days = [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' }
  ];

  return (
    <div>
      {/* Create Form Section */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        {error && (
          <div style={{
            color: '#dc3545',
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Day:
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {days.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Branch:
            </label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              disabled={!branches || branches.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: !branches || branches.length === 0 ? '#f8f9fa' : 'white'
              }}
            >
              <option value="">Select a branch</option>
              {branches && branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name || `Branch ${branch.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Start Time:
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              End Time:
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
            Repeat Until (optional):
          </label>
          <input
            type="date"
            name="repeat_until"
            value={formData.repeat_until}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>Leave empty to repeat indefinitely</small>
        </div>

        <button
          type="submit"
          disabled={loading || !branches || branches.length === 0}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Creating...' : 'Create Rule'}
        </button>
      </form>

      {/* Existing Rules List */}
      {rules && rules.length > 0 && (
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
            Current Rules
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {rules.map(rule => (
              <div 
                key={rule.id} 
                style={{
                  padding: '15px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div>
                  <strong style={{ color: '#333' }}>
                    {rule.day_of_week.charAt(0).toUpperCase() + rule.day_of_week.slice(1)}
                  </strong>
                  <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                    {rule.start_time} - {rule.end_time}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Branch: {branches?.find(b => b.id === rule.branch_id)?.name || `Branch ${rule.branch_id}`}
                  </div>
                  {rule.repeat_until && (
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      Until: {rule.repeat_until}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RuleForm;
