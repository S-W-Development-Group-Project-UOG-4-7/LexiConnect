import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Clock, MapPin, Repeat, Check, X, AlertCircle } from 'lucide-react';
import availabilityService from '../features/availability/services/availability.service';

const DEBUG_AVAIL = true; // Set to false for production

const AvailabilityWizard = ({ isOpen, onClose, onSaved }) => {
  if (DEBUG_AVAIL) console.log('🧙 WIZARD RENDER - isOpen:', isOpen);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branchLabel, setBranchLabel] = useState('');
  const [repeatMode, setRepeatMode] = useState('weeks'); // 'weeks' or 'until'
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [repeatUntilDate, setRepeatUntilDate] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maxBookings, setMaxBookings] = useState(3);

  // Log wizard state changes
  useEffect(() => {
    if (DEBUG_AVAIL) {
      console.log('🧙 WIZARD STATE CHANGED:', {
        isOpen,
        currentStep,
        selectedDay,
        startTime,
        endTime,
        branchId,
        branchLabel,
        repeatMode,
        repeatWeeks,
        repeatUntilDate
      });
    }
  }, [isOpen, currentStep, selectedDay, startTime, endTime, branchId, branchLabel, repeatMode, repeatWeeks, repeatUntilDate]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullWeekDays = {
    'Mon': 'monday',
    'Tue': 'tuesday', 
    'Wed': 'wednesday',
    'Thu': 'thursday',
    'Fri': 'friday',
    'Sat': 'saturday',
    'Sun': 'sunday'
  };

  const timeOptions = [
    { value: '09:00:00', label: '09:00 AM' },
    { value: '10:00:00', label: '10:00 AM' },
    { value: '11:00:00', label: '11:00 AM' },
    { value: '12:00:00', label: '12:00 PM' },
    { value: '13:00:00', label: '01:00 PM' },
    { value: '14:00:00', label: '02:00 PM' },
    { value: '15:00:00', label: '03:00 PM' },
    { value: '16:00:00', label: '04:00 PM' },
    { value: '17:00:00', label: '05:00 PM' },
    { value: '18:00:00', label: '06:00 PM' }
  ];

  // Time formatter: Convert HH:MM:SS to HH:MM AM/PM
  const formatTimeForBackend = (timeString) => {
    if (!timeString) return '';
    
    // If already in correct format, return as-is
    if (/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(timeString)) {
      return timeString;
    }
    
    // Convert from HH:MM:SS to HH:MM AM/PM
    const [hours, minutes, seconds] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const steps = [
    { id: 1, name: 'Day', icon: Calendar },
    { id: 2, name: 'Time', icon: Clock },
    { id: 3, name: 'Location', icon: MapPin },
    { id: 4, name: 'Repeat', icon: Repeat },
    { id: 5, name: 'Review', icon: Check }
  ];

  // Fetch branches when wizard opens or step 3 is reached
  useEffect(() => {
    if (isOpen && (currentStep === 3 || branches.length === 0)) {
      fetchBranches();
    }
  }, [isOpen, currentStep]);

  const fetchBranches = async () => {
    if (DEBUG_AVAIL) console.log('🔍 FETCHING BRANCHES...');
    try {
      const branchesData = await availabilityService.getBranches();
      if (DEBUG_AVAIL) {
        console.log('✅ BRANCHES DATA RECEIVED:', branchesData);
        console.log('🔍 BRANCHES TYPE:', typeof branchesData);
        console.log('🔍 BRANCHES LENGTH:', Array.isArray(branchesData) ? branchesData.length : 'Not an array');
        
        if (Array.isArray(branchesData)) {
          branchesData.forEach((branch, index) => {
            console.log(`🔍 BRANCH[${index}]:`, {
              id: branch.id,
              id_type: typeof branch.id,
              name: branch.name,
              description: branch.description
            });
          });
        }
      }
      setBranches(branchesData);
    } catch (error) {
      if (DEBUG_AVAIL) {
        console.error('❌ FAILED TO FETCH BRANCHES:', error);
        console.log('🔍 USING STATIC FALLBACK LOCATIONS');
      }
      // Use static locations as fallback
      const staticBranches = [
        { id: 1, name: 'Firm Office – Colombo', description: 'Main office in the city center' },
        { id: 2, name: 'Home Office – Dehiwala', description: 'Convenient suburban location' },
        { id: 3, name: 'Online Consultation', description: 'Video call via Zoom or Teams' }
      ];
      if (DEBUG_AVAIL) {
        console.log('🔍 STATIC BRANCHES:', staticBranches);
        staticBranches.forEach((branch, index) => {
          console.log(`🔍 STATIC BRANCH[${index}]:`, {
            id: branch.id,
            id_type: typeof branch.id,
            name: branch.name
          });
        });
      }
      setBranches(staticBranches);
    }
  };

  // Reset wizard when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedDay('');
      setStartTime('');
      setEndTime('');
      setBranchId('');
      setBranchLabel('');
      setRepeatMode('weeks');
      setRepeatWeeks(4);
      setRepeatUntilDate('');
      setError('');
      setMaxBookings(3);
    }
  }, [isOpen]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDay !== '';
      case 2:
        return startTime && endTime && endTime > startTime;
      case 3:
        return branchId !== '';
      case 4:
        return (repeatMode === 'weeks' && repeatWeeks >= 1 && repeatWeeks <= 52) || 
               (repeatMode === 'until' && repeatUntilDate);
      case 5:
        return true;
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

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setError('');
  };

  const handleBranchSelect = (branch) => {
    if (branch.disabled) {
      console.log('🔍 BRANCH DISABLED - SELECTION BLOCKED:', branch);
      return;
    }
    
    console.log('🔍 BRANCH SELECTED:', branch);
    console.log('🔍 BRANCH ID TYPE:', typeof branch.id);
    console.log('🔍 BRANCH ID VALUE:', branch.id);
    console.log('🔍 PARSED BRANCH ID:', parseInt(branch.id));
    
    const numericBranchId = parseInt(branch.id);
    if (isNaN(numericBranchId)) {
      console.error('❌ INVALID BRANCH ID - NOT A NUMBER:', branch.id);
      setError('Invalid branch selected. Please try again.');
      return;
    }
    
    setBranchId(numericBranchId);
    setBranchLabel(branch.name);
    setError('');
  };

  // Build weekly payload with exact backend format (no lawyer_id in body)
  const buildWeeklyPayload = (state) => {
    console.log('🔍 BUILDING PAYLOAD WITH STATE:', {
      branchId: state.branchId,
      branchIdType: typeof state.branchId,
      selectedDay: state.selectedDay,
      startTime: state.startTime,
      endTime: state.endTime,
      maxBookings: state.maxBookings
    });
    
    const branchId = parseInt(state.branchId);
    console.log('🔍 PARSED BRANCH ID:', branchId);
    console.log('🔍 PARSED BRANCH ID TYPE:', typeof branchId);
    console.log('🔍 PARSED BRANCH ID IS NaN:', isNaN(branchId));
    
    const payload = {
      branch_id: branchId,
      day_of_week: fullWeekDays[state.selectedDay] || '',
      start_time: formatTimeForBackend(state.startTime),
      end_time: formatTimeForBackend(state.endTime),
      max_bookings: parseInt(state.maxBookings) || 5
    };
    
    // Debug payload before validation
    console.log("WEEKLY PAYLOAD BUILT:", payload);
    
    // Validate payload structure
    const missingFields = [];
    if (!payload.branch_id || isNaN(payload.branch_id)) {
      missingFields.push('branch_id');
      console.error('❌ BRANCH_ID VALIDATION FAILED:', {
        value: payload.branch_id,
        type: typeof payload.branch_id,
        isNaN: isNaN(payload.branch_id)
      });
    }
    if (!payload.day_of_week) missingFields.push('day_of_week');
    if (!payload.start_time) missingFields.push('start_time');
    if (!payload.end_time) missingFields.push('end_time');
    if (!payload.max_bookings || isNaN(payload.max_bookings)) missingFields.push('max_bookings');
    
    if (missingFields.length > 0) {
      console.log("MISSING FIELDS:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return payload;
  };

  const normalizePayload = (state) => {
    const payload = {
      lawyer_id: parseInt(state.lawyerId),
      branch_id: parseInt(state.branchId),
      day_of_week: fullWeekDays[state.selectedDay] || '',
      start_time: formatTimeForBackend(state.startTime),
      end_time: formatTimeForBackend(state.endTime),
      max_bookings: parseInt(state.maxBookings) || 5
    };
    
    // Debug payload before validation
    console.log("NORMALIZED PAYLOAD BEFORE VALIDATION:", payload);
    
    // Validate payload structure
    const missingFields = [];
    if (!payload.lawyer_id) missingFields.push('lawyer_id');
    if (!payload.branch_id) missingFields.push('branch_id');
    if (!payload.day_of_week) missingFields.push('day_of_week');
    if (!payload.start_time) missingFields.push('start_time');
    if (!payload.end_time) missingFields.push('end_time');
    
    if (missingFields.length > 0) {
      console.log("MISSING FIELDS:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return payload;
  };

  const handleConfirm = async () => {
    if (DEBUG_AVAIL) console.log('🔍 CONFIRM CLICKED - Starting confirmation process');
    
    // Log wizard state for debugging
    const wizardState = {
      selectedDay,
      startTime,
      endTime,
      branchId,
      branchIdType: typeof branchId,
      branchLabel,
      maxBookings,
      repeatMode,
      repeatWeeks,
      repeatUntilDate
    };
    console.log("WIZARD STATE", wizardState);
    console.log("BRANCHES AVAILABLE", branches);
    console.log("SELECTED BRANCH DETAILS", branches.find(b => b.id == branchId));
    
    if (!canProceedToNext()) {
      if (DEBUG_AVAIL) console.log('❌ CONFIRM FAILED - Cannot proceed to next');
      return;
    }

    // Enhanced validation with specific field checking
    const validationErrors = [];
    
    if (!selectedDay) {
      validationErrors.push('Please select a day');
    }
    
    if (!startTime) {
      validationErrors.push('Please select a start time');
    }
    
    if (!endTime) {
      validationErrors.push('Please select an end time');
    }
    
    // Specific branch validation
    console.log('🔍 BRANCH VALIDATION:', {
      branchId: branchId,
      branchIdType: typeof branchId,
      branchLabel: branchLabel
    });
    
    if (!branchId) {
      validationErrors.push('Please select a branch location');
    } else if (isNaN(parseInt(branchId))) {
      validationErrors.push('Invalid branch selection - please select a valid branch');
    } else if (parseInt(branchId) <= 0) {
      validationErrors.push('Invalid branch ID - please select a valid branch');
    }
    
    // Validate maxBookings
    if (!maxBookings || maxBookings < 1) {
      setMaxBookings(5); // Set default silently
      console.log('🔍 SETTING DEFAULT MAX_BOOKINGS TO 5');
    }
    
    // Additional validation for time logic
    if (startTime && endTime && endTime <= startTime) {
      validationErrors.push('End time must be after start time');
    }
    
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join('; ');
      if (DEBUG_AVAIL) console.log('❌ CONFIRM FAILED - Validation errors:', errorMsg);
      setError(errorMsg);
      return;
    }

    // Format times for backend
    const formattedStartTime = formatTimeForBackend(startTime);
    const formattedEndTime = formatTimeForBackend(endTime);
    
    // Validate time format
    const timeFormatRegex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (!timeFormatRegex.test(formattedStartTime) || !timeFormatRegex.test(formattedEndTime)) {
      const errorMsg = 'Time must be in format HH:MM AM/PM (e.g., "09:00 AM")';
      if (DEBUG_AVAIL) console.log('❌ CONFIRM FAILED - Time format error:', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lawyerId = await availabilityService.getCurrentLawyerId();
      if (DEBUG_AVAIL) console.log('✅ LAWYER ID OBTAINED:', lawyerId);
      
      if (!lawyerId) {
        throw new Error('Unable to identify current lawyer - please log in again');
      }

      const payload = buildWeeklyPayload({
        lawyerId,
        branchId,
        selectedDay,
        startTime,
        endTime,
        maxBookings
      });

      console.log("WIZARD CONFIRM PAYLOAD:", payload);
      console.log("WIZARD CONFIRM - Exact payload being sent:", JSON.stringify(payload, null, 2));

      if (DEBUG_AVAIL) {
        console.log('🚀 SUBMIT PAYLOAD:', payload);
        console.log('🔍 API CALL STARTING...');
      }

      // Direct API call to avoid duplicate lawyer_id issue
      const response = await availabilityService.createAvailability(payload, lawyerId);
      if (DEBUG_AVAIL) console.log('✅ API CALL SUCCESSFUL - Response:', response);
      
      // Close wizard and trigger refresh with the created slot data
      if (DEBUG_AVAIL) console.log('🔍 CLOSING WIZARD AND TRIGGERING REFRESH...');
      onClose();
      
      if (onSaved) {
        if (DEBUG_AVAIL) console.log('🔍 CALLING ONSAVED CALLBACK WITH CREATED SLOT...');
        onSaved(response.data || payload); // Pass the created slot or payload
      }
      
      if (DEBUG_AVAIL) console.log('✅ CONFIRM PROCESS COMPLETED SUCCESSFULLY');
    } catch (error) {
      // Enhanced error logging
      console.log("ERROR RESPONSE", error.response);
      console.log("ERROR DATA", error.response?.data);
      console.log("ERROR STATUS", error.response?.status);
      
      if (DEBUG_AVAIL) {
        console.error('❌ CONFIRM FAILED - Full error details:', error);
        console.error('❌ ERROR RESPONSE:', error.response);
        console.error('❌ ERROR DATA:', error.response?.data);
        console.error('❌ ERROR STATUS:', error.response?.status);
      }
      
      // Better error handling - handle 422 validation errors
      let errorMessage = 'Failed to save availability';
      
      if (error.response?.status === 422) {
        // Enhanced 422 error logging
        const errorData = error.response?.data;
        const errorDetails = errorData?.detail;
        
        console.log("422 DETAIL RAW", errorDetails);
        console.log("422 DETAIL JSON", JSON.stringify(errorDetails, null, 2));
        
        if (Array.isArray(errorDetails)) {
          // Handle all validation errors in the array
          const errorMessages = errorDetails.map((err, index) => {
            console.log(`422 DETAIL[${index}]`, err);
            console.log(`422 DETAIL[${index}] TYPE`, typeof err);
            console.log(`422 DETAIL[${index}] KEYS`, Object.keys(err || {}));
            
            if (typeof err === 'string') {
              return err;
            }
            
            if (err && typeof err === 'object') {
              if (err.loc && err.msg) {
                // FastAPI style: {loc: ["field_name"], msg: "error message", type: "value_error"}
                const fieldName = Array.isArray(err.loc) ? err.loc.join('.') : err.loc;
                return `${fieldName}: ${err.msg}`;
              } else if (err.field && err.message) {
                // Django style: {field: "field_name", message: "error message"}
                return `${err.field}: ${err.message}`;
              } else if (err.msg) {
                return err.msg;
              } else if (err.message) {
                return err.message;
              } else {
                return JSON.stringify(err, null, 2);
              }
            }
            
            return `Unknown error at index ${index}`;
          });
          
          errorMessage = errorMessages.join('; ');
          console.log('🔍 COMBINED ERROR MESSAGES:', errorMessage);
        } else if (typeof errorDetails === 'string') {
          errorMessage = errorDetails;
        } else if (errorDetails?.msg) {
          errorMessage = errorDetails.msg;
        } else if (typeof errorDetails === 'object') {
          errorMessage = JSON.stringify(errorDetails, null, 2);
        } else {
          errorMessage = 'Validation failed. Please check your input and try again.';
        }
        
        if (DEBUG_AVAIL) {
          console.log('🔍 422 ERROR DETAILS:', errorDetails);
          console.log('🔍 422 ERROR TYPE:', typeof errorDetails);
          console.log('🔍 FINAL ERROR MESSAGE:', errorMessage);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Set error and keep modal open - DO NOT close on error
      setError(errorMessage);
      setLoading(false);
      
      // DO NOT call onClose() - keep modal open for user to fix the issue
      if (DEBUG_AVAIL) console.log('❌ CONFIRM FAILED - Modal kept open for user to retry');
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-3 ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const DaySelector = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Day</h3>
      <p className="text-gray-600 mb-6">Choose the day you want to set availability for</p>
      
      <div className="grid grid-cols-7 gap-3 mb-8">
        {weekDays.map((day) => (
          <button
            key={day}
            onClick={() => handleDaySelect(day)}
            className={`py-3 px-2 rounded-lg font-medium text-sm transition-all ${
              selectedDay === day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {error && currentStep === 1 && (
        <div className="flex items-center text-red-600 text-sm mt-2">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );

  const TimeSelector = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Time Range</h3>
      <p className="text-gray-600 mb-6">Choose your available hours</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <select
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select time</option>
            {timeOptions.map(time => (
              <option key={time.value} value={time.value}>{time.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
          <select
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select time</option>
            {timeOptions.map(time => (
              <option key={time.value} value={time.value}>{time.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && currentStep === 2 && (
        <div className="flex items-center text-red-600 text-sm mt-2">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );

  const LocationSelector = () => {
    // Find Online Consultation branch in API data
    const onlineConsultationBranch = branches.find(branch => 
      branch.name.toLowerCase().includes('online') || 
      branch.name.toLowerCase().includes('consultation')
    );
    
    // Use API branches if available, otherwise fallback to static locations
    let locations = [];
    
    if (branches.length > 0) {
      // Use real API branches
      locations = branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        subtitle: branch.description || 'Consultation location',
        icon: branch.name.toLowerCase().includes('online') ? 'video' : 'office'
      }));
      
      // If no Online Consultation branch found, add a disabled message
      if (!onlineConsultationBranch) {
        locations.push({
          id: 'online-disabled',
          name: 'Online Consultation (Unavailable)',
          subtitle: 'Please create an "Online Consultation" branch in the system first',
          icon: 'video',
          disabled: true
        });
      }
    } else {
      // Fallback to static locations (for development/testing)
      locations = [
        {
          id: 1,
          name: 'Firm Office – Colombo',
          subtitle: 'Main office in the city center',
          icon: 'office'
        },
        {
          id: 2,
          name: 'Home Office – Dehiwala',
          subtitle: 'Convenient suburban location',
          icon: 'home'
        },
        {
          id: 3,
          name: 'Online Consultation',
          subtitle: 'Video call via Zoom or Teams',
          icon: 'video'
        }
      ];
    }

    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Where will the consultation take place?</h3>
        <p className="text-gray-600 mb-6">Choose the location for your availability</p>
        
        {locations.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No locations available</p>
            <p className="text-sm text-gray-400 mt-2">Please contact support to add locations</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => !location.disabled && handleBranchSelect(location)}
                disabled={location.disabled}
                role="radio"
                aria-checked={branchId === location.id}
                tabIndex={currentStep === 3 && !location.disabled ? 0 : -1}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  location.disabled
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                    : branchId === location.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {location.icon === 'office' && (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    {location.icon === 'home' && (
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    {location.icon === 'video' && (
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{location.name}</div>
                    <div className="text-sm text-gray-500 truncate">{location.subtitle}</div>
                  </div>
                  
                  {branchId === location.id.toString() && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {error && currentStep === 3 && (
          <div className="flex items-center text-red-600 text-sm mt-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>
    );
  };

  const RepeatSelector = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Repeat Schedule</h3>
      <p className="text-gray-600 mb-6">How often should this availability repeat?</p>
      
      <div className="space-y-4 mb-8">
        <div className="p-4 border-2 rounded-lg">
          <label className="flex items-center">
            <input
              type="radio"
              value="weeks"
              checked={repeatMode === 'weeks'}
              onChange={(e) => setRepeatMode(e.target.value)}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="font-medium">Repeat for a number of weeks</div>
              <div className="text-sm text-gray-600">Set availability for multiple weeks</div>
            </div>
          </label>
          {repeatMode === 'weeks' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of weeks</label>
              <input
                type="number"
                min="1"
                max="52"
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-2 rounded-lg">
          <label className="flex items-center">
            <input
              type="radio"
              value="until"
              checked={repeatMode === 'until'}
              onChange={(e) => setRepeatMode(e.target.value)}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="font-medium">Every week until a specific date</div>
              <div className="text-sm text-gray-600">Repeat weekly until end date</div>
            </div>
          </label>
          {repeatMode === 'until' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
              <input
                type="date"
                value={repeatUntilDate}
                onChange={(e) => setRepeatUntilDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {error && currentStep === 4 && (
        <div className="flex items-center text-red-600 text-sm mt-2">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );

  const ReviewStep = () => {
    const getSummarySentence = () => {
      const dayName = selectedDay;
      const startTimeLabel = timeOptions.find(t => t.value === startTime)?.label || startTime;
      const endTimeLabel = timeOptions.find(t => t.value === endTime)?.label || endTime;
      const repeatText = repeatMode === 'weeks' ? `repeating for ${repeatWeeks} weeks` : `repeating until ${repeatUntilDate}`;
      
      return `You are available every ${dayName} from ${startTimeLabel} to ${endTimeLabel} at ${branchLabel}, ${repeatText}.`;
    };

    return (
      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Review availability</h3>
          <p className="text-gray-600">Please confirm details below</p>
        </div>
        
        {/* Summary Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-blue-900 font-medium leading-relaxed text-center">{getSummarySentence()}</p>
        </div>
        
        {/* Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Day Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Day</div>
                <div className="font-semibold text-gray-900">{selectedDay}</div>
              </div>
            </div>
          </div>
          
          {/* Time Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Time</div>
                <div className="font-semibold text-gray-900">
                  {timeOptions.find(t => t.value === startTime)?.label} - {timeOptions.find(t => t.value === endTime)?.label}
                </div>
              </div>
            </div>
          </div>
          
          {/* Location Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-semibold text-gray-900">{branchLabel}</div>
              </div>
            </div>
          </div>
          
          {/* Repeat Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <Repeat className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Repeat</div>
                <div className="font-semibold text-gray-900">
                  {repeatMode === 'weeks' ? `For ${repeatWeeks} weeks` : `Until ${repeatUntilDate}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && currentStep === 5 && (
          <div className="flex items-center text-red-600 text-sm mb-6">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <DaySelector />;
      case 2:
        return <TimeSelector />;
      case 3:
        return <LocationSelector />;
      case 4:
        return <RepeatSelector />;
      case 5:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Your Availability</h1>
            <p className="text-gray-600">Configure when and where you're available for consultations</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
          <StepIndicator />
        </div>

        {/* Step Content */}
        <div className="px-8 py-6 min-h-[400px] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Cancel and go back
            </button>
            
            <div className="flex items-center space-x-3">
              {/* Back Button */}
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              )}
              
              {/* Edit Button (only on Review step) */}
              {currentStep === 5 && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              
              {/* Next/Confirm Button */}
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    canProceedToNext()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Confirm availability'}
                  <Check className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityWizard;
