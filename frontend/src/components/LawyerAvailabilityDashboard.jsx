import React, { useState } from 'react';

const LawyerAvailabilityDashboard = () => {
  const [timeSlots, setTimeSlots] = useState({
    Monday: [
      { id: 1, startTime: '08:00 AM', endTime: '12:00 PM', branch: 'Colombo', maxBookings: 5 },
      { id: 2, startTime: '01:00 PM', endTime: '04:00 PM', branch: 'Colombo', maxBookings: 4 }
    ],
    Tuesday: [
      { id: 3, startTime: '09:00 AM', endTime: '12:00 PM', branch: 'Online', maxBookings: 10 },
      { id: 4, startTime: '03:00 PM', endTime: '05:00 PM', branch: 'Colombo', maxBookings: 5 }
    ],
    Wednesday: [],
    Thursday: [
      { id: 5, startTime: '08:00 AM', endTime: '05:00 PM', branch: 'Kandy', maxBookings: 3 }
    ],
    Friday: [
      { id: 6, startTime: '08:00 AM', endTime: '12:00 PM', branch: 'Colombo', maxBookings: 5 }
    ],
    Saturday: [],
    Sunday: []
  });

  const branches = ['Colombo', 'Online', 'Kandy'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // SVG Icons
  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const InfoIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const addTimeSlot = (day) => {
    const newSlot = {
      id: Date.now(),
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      branch: 'Colombo',
      maxBookings: 5
    };
    setTimeSlots(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot]
    }));
  };

  const deleteTimeSlot = (day, slotId) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: prev[day].filter(slot => slot.id !== slotId)
    }));
  };

  const updateSlot = (day, slotId, field, value) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: prev[day].map(slot => 
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const getTotalWeeklyHours = () => {
    let totalHours = 0;
    Object.values(timeSlots).forEach(slots => {
      slots.forEach(slot => {
        const start = parseInt(slot.startTime.split(':')[0]);
        const end = parseInt(slot.endTime.split(':')[0]);
        const startPeriod = slot.startTime.includes('PM') && start !== 12 ? start + 12 : start;
        const endPeriod = slot.endTime.includes('PM') && end !== 12 ? end + 12 : end;
        totalHours += Math.max(0, endPeriod - startPeriod);
      });
    });
    return totalHours;
  };

  const getTotalDailyCapacity = () => {
    return Object.values(timeSlots).reduce((total, slots) => 
      total + slots.reduce((dayTotal, slot) => dayTotal + slot.maxBookings, 0), 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LC</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">LedConnect</span>
              </div>
              <nav className="flex space-x-6">
                {['Dashboard', 'Availability', 'Token Queue', 'Incoming Bookings', 'Branches', 'Services', 'Checklist', 'KYC Status'].map((item) => (
                  <button
                    key={item}
                    className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                      item === 'Availability'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Information Panel */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Section 3 - Information Panel</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Client Visibility</h4>
                <p className="text-sm text-blue-700">Your availability is visible to clients based on the schedule you set here.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Weekly Schedule</h4>
                <p className="text-sm text-green-700">Set your regular weekly consultation hours for each day.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Blackout Dates</h4>
                <p className="text-sm text-orange-700">Mark specific dates when you're unavailable regardless of your weekly schedule.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
              <p className="text-gray-600 mt-2">Set your weekly consultation schedule and manage unavailable dates.</p>
            </div>

            {/* Weekly Consultation Schedule */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Consultation Schedule</h2>
              
              <div className="space-y-6">
                {weekDays.map((day) => (
                  <div key={day} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{day}</h3>
                        {timeSlots[day].length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {timeSlots[day].length} slot{timeSlots[day].length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addTimeSlot(day)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon />
                        <span className="text-sm font-medium">Add Time Slot</span>
                      </button>
                    </div>

                    {timeSlots[day].length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No availability set for {day}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {timeSlots[day].map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 flex-1">
                              <ClockIcon />
                              <input
                                type="text"
                                value={slot.startTime}
                                onChange={(e) => updateSlot(day, slot.id, 'startTime', e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="text"
                                value={slot.endTime}
                                onChange={(e) => updateSlot(day, slot.id, 'endTime', e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <MapPinIcon />
                              <select
                                value={slot.branch}
                                onChange={(e) => updateSlot(day, slot.id, 'branch', e.target.value)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {branches.map((branch) => (
                                  <option key={branch} value={branch}>{branch}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <UsersIcon />
                              <input
                                type="number"
                                value={slot.maxBookings}
                                onChange={(e) => updateSlot(day, slot.id, 'maxBookings', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                              />
                              <span className="text-sm text-gray-600">max bookings</span>
                            </div>

                            <button
                              onClick={() => deleteTimeSlot(day, slot.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6">
          {/* How It Works */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CalendarIcon />
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Schedule</h4>
                  <p className="text-sm text-gray-600">Set your regular availability patterns</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon />
                <div>
                  <h4 className="font-medium text-gray-900">Auto-Recurring</h4>
                  <p className="text-sm text-gray-600">Schedule repeats weekly automatically</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <InfoIcon />
                <div>
                  <h4 className="font-medium text-gray-900">Blackout Priority</h4>
                  <p className="text-sm text-gray-600">Blackout dates override weekly schedule</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Weekly Hours</span>
                <span className="font-semibold text-gray-900">{getTotalWeeklyHours()} hrs</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Blackouts</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Daily Capacity</span>
                <span className="font-semibold text-gray-900">{getTotalDailyCapacity()} clients</span>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Pro Tip</h4>
            <p className="text-sm text-yellow-800">
              Set realistic time buffers between slots to account for session overruns and preparation time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LawyerAvailabilityDashboard;
