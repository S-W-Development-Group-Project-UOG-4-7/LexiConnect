import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Trash2, Info, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

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

  const [blackoutDates, setBlackoutDates] = useState([
    { id: 1, date: '12/25/2025', availability: 'Full Day', startTime: '', endTime: '', reason: 'Christmas Holiday' },
    { id: 2, date: '01/01/2026', availability: 'Full Day', startTime: '', endTime: '', reason: 'New Year Day' }
  ]);

  const [newBlackout, setNewBlackout] = useState({
    date: '',
    availability: 'Full Day',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    reason: ''
  });

  const branches = ['Colombo', 'Online', 'Kandy'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Icons using lucide-react
  const TrashIcon = () => <Trash2 className="w-4 h-4" />;
  const PlusIcon = () => <Plus className="w-4 h-4" />;
  const ClockIcon = () => <Clock className="w-4 h-4" />;
  const MapPinIcon = () => <MapPin className="w-4 h-4" />;
  const UsersIcon = () => <Users className="w-4 h-4" />;
  const CalendarIcon = () => <Calendar className="w-5 h-5" />;
  const CheckCircleIcon = () => <CheckCircle className="w-5 h-5" />;
  const InfoIcon = () => <Info className="w-5 h-5" />;
  const AlertCircleIcon = () => <AlertCircle className="w-5 h-5" />;

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

  const addBlackoutDate = () => {
    if (!newBlackout.date) return;
    
    const blackout = {
      id: Date.now(),
      date: newBlackout.date,
      availability: newBlackout.availability,
      startTime: newBlackout.availability === 'Full Day' ? '' : newBlackout.startTime,
      endTime: newBlackout.availability === 'Full Day' ? '' : newBlackout.endTime,
      reason: newBlackout.reason
    };
    
    setBlackoutDates(prev => [...prev, blackout]);
    setNewBlackout({
      date: '',
      availability: 'Full Day',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      reason: ''
    });
  };

  const deleteBlackoutDate = (id) => {
    setBlackoutDates(prev => prev.filter(blackout => blackout.id !== id));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Availability</h1>
              <p className="text-slate-600">Set your weekly consultation schedule and manage unavailable dates.</p>
            </div>

            {/* Weekly Consultation Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Weekly Consultation Schedule</h2>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <CalendarIcon />
                  <span>Auto-recurring weekly</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {weekDays.map((day) => (
                  <div key={day} className="border-b border-slate-100 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-slate-900">{day}</h3>
                        {timeSlots[day].length > 0 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {timeSlots[day].length} slot{timeSlots[day].length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addTimeSlot(day)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <PlusIcon />
                        <span className="text-sm font-semibold">Add Time Slot</span>
                      </button>
                    </div>

                    {timeSlots[day].length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500">No availability set for {day}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {timeSlots[day].map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <ClockIcon />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={slot.startTime}
                                  onChange={(e) => updateSlot(day, slot.id, 'startTime', e.target.value)}
                                  placeholder="08:00 AM"
                                  className="w-24 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-slate-400 font-medium">-</span>
                                <input
                                  type="text"
                                  value={slot.endTime}
                                  onChange={(e) => updateSlot(day, slot.id, 'endTime', e.target.value)}
                                  placeholder="05:00 PM"
                                  className="w-24 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <MapPinIcon />
                              </div>
                              <select
                                value={slot.branch}
                                onChange={(e) => updateSlot(day, slot.id, 'branch', e.target.value)}
                                className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {branches.map((branch) => (
                                  <option key={branch} value={branch}>{branch}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <UsersIcon />
                              </div>
                              <input
                                type="number"
                                value={slot.maxBookings}
                                onChange={(e) => updateSlot(day, slot.id, 'maxBookings', parseInt(e.target.value) || 0)}
                                placeholder="5"
                                className="w-20 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                              />
                              <span className="text-sm text-slate-600 font-medium">max</span>
                            </div>

                            <button
                              onClick={() => deleteTimeSlot(day, slot.id)}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
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

            {/* Blackout Dates Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Blackout Dates</h2>
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <AlertCircleIcon />
                  <span>Overrides weekly schedule</span>
                </div>
              </div>

              {/* Add Blackout Date Form */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
                <h3 className="font-semibold text-slate-900 mb-6">Add New Blackout Date</h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newBlackout.date}
                        onChange={(e) => setNewBlackout(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2 pl-10 text-sm font-medium bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="absolute left-3 top-2.5 text-slate-400">
                        <CalendarIcon />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                    <select
                      value={newBlackout.availability}
                      onChange={(e) => setNewBlackout(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Partial Time">Partial Time</option>
                    </select>
                  </div>

                  {newBlackout.availability === 'Partial Time' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                        <input
                          type="text"
                          value={newBlackout.startTime}
                          onChange={(e) => setNewBlackout(prev => ({ ...prev, startTime: e.target.value }))}
                          placeholder="09:00 AM"
                          className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                        <input
                          type="text"
                          value={newBlackout.endTime}
                          onChange={(e) => setNewBlackout(prev => ({ ...prev, endTime: e.target.value }))}
                          placeholder="05:00 PM"
                          className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </>
                  )}

                  <div className={`${newBlackout.availability === 'Partial Time' ? 'col-span-2' : 'col-span-4'}`}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Court session, Annual leave"
                      value={newBlackout.reason}
                      onChange={(e) => setNewBlackout(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <button
                      onClick={addBlackoutDate}
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                    >
                      Add Blackout
                    </button>
                  </div>
                </div>
              </div>

              {/* Blackout Dates List */}
              <div className="space-y-3">
                {blackoutDates.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">No blackout dates set</p>
                  </div>
                ) : (
                  blackoutDates.map((blackout) => (
                    <div key={blackout.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <CalendarIcon />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{blackout.date}</div>
                          <div className="text-sm text-slate-600">
                            {blackout.availability === 'Full Day' ? 'Full Day' : `${blackout.startTime} - ${blackout.endTime}`}
                            {blackout.reason && ` • ${blackout.reason}`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBlackoutDate(blackout.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6">
          {/* How It Works */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Weekly Schedule</h4>
                  <p className="text-sm text-slate-600">Set your regular availability patterns</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Auto-Recurring</h4>
                  <p className="text-sm text-slate-600">Schedule repeats weekly automatically</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircleIcon />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Blackout Priority</h4>
                  <p className="text-sm text-slate-600">Blackout dates override weekly schedule</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Current Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div>
                  <div className="text-sm text-slate-600 font-medium">Total Weekly Hours</div>
                  <div className="text-xl font-bold text-slate-900">{getTotalWeeklyHours()} hrs</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <ClockIcon />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div>
                  <div className="text-sm text-slate-600 font-medium">Active Blackouts</div>
                  <div className="text-xl font-bold text-slate-900">{blackoutDates.length}</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <AlertCircleIcon />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div>
                  <div className="text-sm text-slate-600 font-medium">Daily Capacity</div>
                  <div className="text-xl font-bold text-slate-900">{getTotalDailyCapacity()} clients</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <UsersIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <InfoIcon />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Pro Tip</h4>
                <p className="text-sm text-purple-800 leading-relaxed">
                  Set realistic time buffers between slots to account for session overruns and preparation time.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LawyerAvailabilityDashboard;
