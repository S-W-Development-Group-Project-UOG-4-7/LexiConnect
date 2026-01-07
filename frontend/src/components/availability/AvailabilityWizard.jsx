import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Clock, MapPin, Repeat, Check, X, ArrowLeft } from 'lucide-react';

const AvailabilityWizard = ({ isOpen, onClose, onSave, existingLocations = [] }) => {
  console.log('🧙 WIZARD OPENED - Availability wizard is now visible');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimeStart, setSelectedTimeStart] = useState('');
  const [selectedTimeEnd, setSelectedTimeEnd] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [repeatMode, setRepeatMode] = useState('weekly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeOptions = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const steps = [
    { id: 1, name: 'Day', icon: Calendar },
    { id: 2, name: 'Time', icon: Clock },
    { id: 3, name: 'Location', icon: MapPin },
    { id: 4, name: 'Repeat', icon: Repeat },
    { id: 5, name: 'Review', icon: Check }
  ];

  // Reset wizard when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedDays([]);
      setSelectedTimeStart('');
      setSelectedTimeEnd('');
      setSelectedLocation('');
      setRepeatMode('weekly');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDays.length > 0;
      case 2:
        return selectedTimeStart && selectedTimeEnd && selectedTimeStart < selectedTimeEnd;
      case 3:
        return selectedLocation;
      case 4:
        return repeatMode;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDayToggle = (day) => {
    const newSelection = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newSelection);
  };

  const handleSave = async () => {
    if (!canProceedToNext()) return;
    
    setIsSubmitting(true);
    try {
      const availabilityData = {
        days: selectedDays.map(day => fullWeekDays[weekDays.indexOf(day)]),
        startTime: selectedTimeStart,
        endTime: selectedTimeEnd,
        location: selectedLocation,
        repeatMode
      };
      
      await onSave(availabilityData);
      onClose();
    } catch (error) {
      console.error('Failed to save availability:', error);
    } finally {
      setIsSubmitting(false);
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
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Days</h3>
      <p className="text-gray-600 mb-6">Choose the days you want to be available</p>
      
      <div className="grid grid-cols-7 gap-3 mb-8">
        {weekDays.map((day) => (
          <button
            key={day}
            onClick={() => handleDayToggle(day)}
            className={`py-3 px-2 rounded-lg font-medium text-sm transition-all ${
              selectedDays.includes(day)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
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
            value={selectedTimeStart}
            onChange={(e) => setSelectedTimeStart(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select time</option>
            {timeOptions.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
          <select
            value={selectedTimeEnd}
            onChange={(e) => setSelectedTimeEnd(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select time</option>
            {timeOptions.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const LocationSelector = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Location</h3>
      <p className="text-gray-600 mb-6">Choose where you'll be available</p>
      
      <div className="space-y-3 mb-8">
        {existingLocations.map((location, index) => (
          <button
            key={index}
            onClick={() => setSelectedLocation(location)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedLocation === location
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-gray-400" />
              <span className="font-medium">{location}</span>
              {selectedLocation === location && (
                <Check className="w-5 h-5 ml-auto text-blue-600" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const RepeatSelector = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Repeat Schedule</h3>
      <p className="text-gray-600 mb-6">How often should this availability repeat?</p>
      
      <div className="space-y-3 mb-8">
        <button
          onClick={() => setRepeatMode('weekly')}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            repeatMode === 'weekly'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <Repeat className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <div className="font-medium">Weekly</div>
              <div className="text-sm text-gray-600">Repeat every week</div>
            </div>
            {repeatMode === 'weekly' && (
              <Check className="w-5 h-5 ml-auto text-blue-600" />
            )}
          </div>
        </button>
        
        <button
          onClick={() => setRepeatMode('custom')}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            repeatMode === 'custom'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <div className="font-medium">Custom</div>
              <div className="text-sm text-gray-600">Set specific dates</div>
            </div>
            {repeatMode === 'custom' && (
              <Check className="w-5 h-5 ml-auto text-blue-600" />
            )}
          </div>
        </button>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Availability</h3>
      <p className="text-gray-600 mb-6">Please review your availability settings before saving</p>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Days</div>
              <div className="font-medium">{selectedDays.join(', ')}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Time</div>
              <div className="font-medium">{selectedTimeStart} - {selectedTimeEnd}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Location</div>
              <div className="font-medium">{selectedLocation}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Repeat className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Repeat</div>
              <div className="font-medium capitalize">{repeatMode}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Set Your Availability</h2>
            <p className="text-gray-600 mt-1">Configure when and where you're available for consultations</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            Cancel and go back
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
            )}
            
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
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Availability'}
                <Check className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityWizard;
