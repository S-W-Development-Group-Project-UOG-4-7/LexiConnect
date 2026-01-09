import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './availability-ui.css';

const steps = ['Day', 'Time', 'Location', 'Repeat', 'Review'];
const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekdayPayload = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

const AvailabilityEditor = () => {
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    days: [],
    startTime: '',
    endTime: '',
    branchId: '',
    weeks: 4,
    repeatMode: 'weeks',
  });

  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const url = '/api/branches';
        console.log('[availability] fetching branches from', url, 'base', api.defaults.baseURL);
        const { data } = await api.get('/api/branches');
        setBranches(data || []);
      } catch (err) {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load branches';
        setErrors((prev) => ({ ...prev, branches: detail }));
        setBranches([]);
      }
      setLoadingBranches(false);
    };
    

    fetchBranches();
  }, []);

  const toggleDay = (day) => {
    setWizardData((prev) => {
      const exists = prev.days.includes(day);
      const days = exists ? prev.days.filter((d) => d !== day) : [...prev.days, day];
      return { ...prev, days };
    });
  };

  const canContinue = () => {
    if (wizardStep === 1) return wizardData.days.length > 0;
    if (wizardStep === 2) return wizardData.startTime && wizardData.endTime;
    if (wizardStep === 3) return wizardData.branchId !== '' && wizardData.branchId !== undefined && branches.length > 0;
    if (wizardStep === 4) return wizardData.repeatMode === 'weeks' ? wizardData.weeks > 0 : true;
    return true;
  };

  const nextStep = () => {
    if (!canContinue()) return;
    setWizardStep((s) => Math.min(5, s + 1));
  };

  const prevStep = () => setWizardStep((s) => Math.max(1, s - 1));

  const cancelAndBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const formatTimeToSeconds = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  };

  const saveAvailability = async () => {
    setSaveMessage('');
    setErrors((prev) => ({ ...prev, save: null }));

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (!wizardData.branchId || wizardData.days.length === 0) {
      setErrors((prev) => ({ ...prev, save: 'Select at least one day and a branch before saving.' }));
      return;
    }

    const payloads = wizardData.days.map((day) => ({
      day_of_week: weekdayPayload[day] || day.toLowerCase(),
      start_time: formatTimeToSeconds(wizardData.startTime),
      end_time: formatTimeToSeconds(wizardData.endTime),
      branch_id: wizardData.branchId,
      max_bookings: 1,
      is_active: true,
    }));

    console.log('[availability] saving payloads', payloads);

    try {
      setSaving(true);
      for (const body of payloads) {
        await api.post('/api/lawyer-availability/weekly', body, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }
      setSaveMessage('Availability saved successfully.');
    } catch (err) {
      const status = err?.response?.status;
      const errorDetail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save availability.';
      console.error('[availability] save error', {
        url: err?.config?.url,
        status,
        detail: errorDetail,
        data: err?.config?.data,
      });
      setErrors((prev) => ({ ...prev, save: status ? `${status}: ${errorDetail}` : errorDetail }));
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    if (wizardStep === 1) {
      return (
        <>
          <h2 className="card-title">Which day are you available?</h2>
          <p className="card-subtitle">Choose one or more weekdays for this availability.</p>
          <div className="day-row">
            {weekdayLabels.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-pill ${wizardData.days.includes(day) ? 'active' : ''}`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (wizardStep === 2) {
      return (
        <>
          <h2 className="card-title">Set your time</h2>
          <p className="card-subtitle">Select a start and end time.</p>
          <div className="time-row">
            <div className="time-field">
              <label>Start time</label>
              <input
                type="time"
                value={wizardData.startTime}
                onChange={(e) => setWizardData((p) => ({ ...p, startTime: e.target.value }))}
              />
            </div>
            <div className="time-field">
              <label>End time</label>
              <input
                type="time"
                value={wizardData.endTime}
                onChange={(e) => setWizardData((p) => ({ ...p, endTime: e.target.value }))}
              />
            </div>
          </div>
        </>
      );
    }

    if (wizardStep === 3) {
      const options = branches;
      return (
        <>
          <h2 className="card-title">Choose a location</h2>
          <p className="card-subtitle">Pick where this availability applies.</p>
          <div className="location-row">
            {options.map((branch) => (
              <button
                key={branch.id ?? 'online'}
                type="button"
                className={`location-pill ${wizardData.branchId === branch.id ? 'active' : ''}`}
                onClick={() => setWizardData((p) => ({ ...p, branchId: branch.id != null ? Number(branch.id) : null }))}
              >
                <span className="location-name">{branch.name}</span>
                {branch.address && <span className="location-desc">{branch.address}</span>}
              </button>
            ))}
            {loadingBranches && (
              <div className="location-empty">Loading branches...</div>
            )}
            {!loadingBranches && branches.length === 0 && (
              <div className="location-empty">
                No branches found. Create one first (e.g., via POST /api/branches or run seed_branches.py).
                <div className="location-actions">
                  <button className="ghost-btn small" type="button" onClick={() => window.location.reload()}>
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (wizardStep === 4) {
      return (
        <>
          <h2 className="card-title">Repeat settings</h2>
          <p className="card-subtitle">How often should this availability repeat?</p>
          <div className="repeat-stack">
            <label className={`repeat-pill ${wizardData.repeatMode === 'weeks' ? 'active' : ''}`}>
              <input
                type="radio"
                name="repeat"
                checked={wizardData.repeatMode === 'weeks'}
                onChange={() => setWizardData((p) => ({ ...p, repeatMode: 'weeks' }))}
              />
              <span>Repeat for</span>
              <input
                type="number"
                min="1"
                value={wizardData.weeks}
                onChange={(e) => setWizardData((p) => ({ ...p, weeks: parseInt(e.target.value, 10) || 1 }))}
              />
              <span>weeks</span>
            </label>
            <label className={`repeat-pill ${wizardData.repeatMode === 'until' ? 'active' : ''}`}>
              <input
                type="radio"
                name="repeat"
                checked={wizardData.repeatMode === 'until'}
                onChange={() => setWizardData((p) => ({ ...p, repeatMode: 'until' }))}
              />
              <span>Repeat weekly until a specific date</span>
            </label>
          </div>
        </>
      );
    }

    return (
      <>
        <h2 className="card-title">Review availability</h2>
        <p className="card-subtitle">Confirm before saving.</p>
        <div className="review-box">
          <div className="review-line">
            <strong>Days:</strong> {wizardData.days.join(', ') || '—'}
          </div>
          <div className="review-line">
            <strong>Time:</strong> {wizardData.startTime || '--:--'} – {wizardData.endTime || '--:--'}
          </div>
          <div className="review-line">
            <strong>Location:</strong> {wizardData.branchId === null ? 'Online Consultation' : wizardData.branchId || '—'}
          </div>
          <div className="review-line">
            <strong>Repeat:</strong> {wizardData.repeatMode === 'weeks' ? `${wizardData.weeks} weeks` : 'Until date'}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="availability-page availability-centered">
      <div className="wizard-shell">
        <div className="page-header">
          <h1>Set Your Availability</h1>
          <p>Follow these simple steps to let clients book appointments with you</p>
        </div>

        <div className="wizard-stepper">
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const status = wizardStep === stepNum ? 'active' : wizardStep > stepNum ? 'done' : 'idle';
            return (
              <div key={label} className="step-item">
                {idx !== 0 && <span className="step-line" />}
                <div className={`step-circle ${status}`}>{status === 'done' ? '✔' : stepNum}</div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>

        <div className="wizard-card main-card">
          {renderStepContent()}
          {(errors.save || saveMessage) && (
            <div className={`inline-feedback ${errors.save ? 'error' : 'success'}`}>
              {errors.save || saveMessage}
            </div>
          )}
          <div className="card-actions">
            {wizardStep > 1 && (
              <button className="ghost-btn" type="button" onClick={prevStep}>
                Back
              </button>
            )}
            <div className="spacer" />
            <button
              className="cta-btn"
              type="button"
              disabled={!canContinue() || saving}
              onClick={wizardStep === 5 ? saveAvailability : nextStep}
            >
              {wizardStep === 5 ? (saving ? 'Saving...' : 'Save') : 'Next'}
            </button>
          </div>
        </div>

        <button className="cancel-link" type="button" onClick={cancelAndBack}>
          Cancel and go back
        </button>
      </div>
    </div>
  );
};

export default AvailabilityEditor;
