import React, { useState, useEffect } from 'react';

// Types
interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  branch: 'Colombo' | 'Kandy' | 'Online';
  maxBookings: number;
}

interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

interface BlackoutDate {
  id: string;
  date: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  reason: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Components
const Toast: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgColor = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`}>
      {toast.message}
    </div>
  );
};

const TimeSlotRow: React.FC<{
  slot: TimeSlot;
  onUpdate: (id: string, updates: Partial<TimeSlot>) => void;
  onDelete: (id: string) => void;
}> = ({ slot, onUpdate, onDelete }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
      <input
        type="text"
        value={slot.startTime}
        onChange={(e) => onUpdate(slot.id, { startTime: e.target.value })}
        className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
        placeholder="09:00 AM"
      />
      <span className="text-gray-400 text-sm">to</span>
      <input
        type="text"
        value={slot.endTime}
        onChange={(e) => onUpdate(slot.id, { endTime: e.target.value })}
        className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
        placeholder="10:00 AM"
      />
      <select
        value={slot.branch}
        onChange={(e) => onUpdate(slot.id, { branch: e.target.value as 'Colombo' | 'Kandy' | 'Online' })}
        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
      >
        <option value="Colombo">Colombo</option>
        <option value="Kandy">Kandy</option>
        <option value="Online">Online</option>
      </select>
      <input
        type="number"
        value={slot.maxBookings}
        onChange={(e) => onUpdate(slot.id, { maxBookings: parseInt(e.target.value) || 1 })}
        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
        placeholder="Max"
        min="1"
      />
      <button
        onClick={() => onDelete(slot.id)}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

const DayAvailabilityRow: React.FC<{
  day: string;
  slots: TimeSlot[];
  onAddSlot: (day: string) => void;
  onUpdateSlot: (id: string, updates: Partial<TimeSlot>) => void;
  onDeleteSlot: (id: string) => void;
}> = ({ day, slots, onAddSlot, onUpdateSlot, onDeleteSlot }) => {
  return (
    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">{day}</h3>
          {slots.length > 0 && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              {slots.length} slot{slots.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => onAddSlot(day)}
          className="px-3 py-1 border border-amber-500/50 text-amber-400 text-sm rounded-lg hover:bg-amber-500/10 transition-colors"
        >
          + Add Time Slot
        </button>
      </div>
      
      <div className="space-y-2">
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No availability set for {day}</p>
        ) : (
          slots.map((slot) => (
            <TimeSlotRow
              key={slot.id}
              slot={slot}
              onUpdate={onUpdateSlot}
              onDelete={onDeleteSlot}
            />
          ))
        )}
      </div>
    </div>
  );
};

const WeeklyScheduleCard: React.FC<{
  weeklySchedule: DayAvailability[];
  onAddSlot: (day: string) => void;
  onUpdateSlot: (id: string, updates: Partial<TimeSlot>) => void;
  onDeleteSlot: (id: string) => void;
  onSave: () => void;
  onReset: () => void;
}> = ({ weeklySchedule, onAddSlot, onUpdateSlot, onDeleteSlot, onSave, onReset }) => {
  return (
    <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Weekly Consultation Schedule</h2>
        <p className="text-gray-400">
          Define your recurring weekly availability. Clients can book within these time windows.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {weeklySchedule.map((day) => (
          <DayAvailabilityRow
            key={day.day}
            day={day.day}
            slots={day.slots}
            onAddSlot={onAddSlot}
            onUpdateSlot={onUpdateSlot}
            onDeleteSlot={onDeleteSlot}
          />
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-700/50">
        <button
          onClick={onReset}
          className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          Reset Changes
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          Save Weekly Schedule
        </button>
      </div>
    </div>
  );
};

const BlackoutForm: React.FC<{
  onAdd: (blackout: Omit<BlackoutDate, 'id'>) => void;
}> = ({ onAdd }) => {
  const [date, setDate] = useState('');
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onAdd({
      date,
      isFullDay,
      startTime: isFullDay ? undefined : startTime,
      endTime: isFullDay ? undefined : endTime,
      reason: reason || 'Unspecified'
    });

    setDate('');
    setStartTime('');
    setEndTime('');
    setReason('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-amber-500 focus:outline-none"
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsFullDay(true)}
          className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
            isFullDay
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
          }`}
        >
          Full Day
        </button>
        <button
          type="button"
          onClick={() => setIsFullDay(false)}
          className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
            !isFullDay
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
          }`}
        >
          Partial Time
        </button>
      </div>

      {!isFullDay && (
        <div className="flex gap-2">
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start time"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-amber-500 focus:outline-none"
            required={!isFullDay}
          />
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End time"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-amber-500 focus:outline-none"
            required={!isFullDay}
          />
        </div>
      )}

      <div>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Court session, Annual leave"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
      >
        + Add Blackout
      </button>
    </form>
  );
};

const BlackoutCard: React.FC<{
  blackouts: BlackoutDate[];
  onAdd: (blackout: Omit<BlackoutDate, 'id'>) => void;
  onDelete: (id: string) => void;
}> = ({ blackouts, onAdd, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Blackout Dates</h2>
        <p className="text-gray-400">
          Temporarily block specific dates or times due to court sessions, leave, or emergencies.
        </p>
      </div>

      <div className="mb-6">
        <BlackoutForm onAdd={onAdd} />
      </div>

      <div className="space-y-3">
        {blackouts.map((blackout) => (
          <div key={blackout.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <div>
              <div className="font-medium text-white">{formatDate(blackout.date)}</div>
              <div className="text-sm text-gray-400">
                {blackout.isFullDay ? 'Full Day' : `${blackout.startTime}–${blackout.endTime}`}
                {blackout.reason && ` — ${blackout.reason}`}
              </div>
            </div>
            <button
              onClick={() => onDelete(blackout.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SidebarInfoCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
};

const NavBar: React.FC = () => {
  const navItems = [
    'Dashboard',
    'Availability',
    'Token Queue',
    'Incoming Bookings',
    'Branches',
    'Services',
    'Checklist',
    'KYC Status'
  ];

  return (
    <nav className="bg-gray-900/80 border-b border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-amber-500">LexiConnect</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item === 'Availability'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main Component
const Availability: React.FC = () => {
  const [weeklySchedule, setWeeklySchedule] = useState<DayAvailability[]>([
    {
      day: 'Monday',
      slots: [
        { id: '1', startTime: '09:00 AM', endTime: '11:00 AM', branch: 'Colombo', maxBookings: 4 },
        { id: '2', startTime: '02:00 PM', endTime: '04:00 PM', branch: 'Online', maxBookings: 3 }
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { id: '3', startTime: '10:00 AM', endTime: '12:00 PM', branch: 'Kandy', maxBookings: 3 },
        { id: '4', startTime: '03:00 PM', endTime: '05:00 PM', branch: 'Colombo', maxBookings: 4 }
      ]
    },
    { day: 'Wednesday', slots: [] },
    {
      day: 'Thursday',
      slots: [
        { id: '5', startTime: '09:00 AM', endTime: '12:00 PM', branch: 'Online', maxBookings: 5 }
      ]
    },
    {
      day: 'Friday',
      slots: [
        { id: '6', startTime: '01:00 PM', endTime: '03:00 PM', branch: 'Colombo', maxBookings: 3 }
      ]
    },
    { day: 'Saturday', slots: [] },
    { day: 'Sunday', slots: [] }
  ]);

  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([
    {
      id: 'b1',
      date: '2025-12-26',
      isFullDay: true,
      reason: 'Public Holiday'
    },
    {
      id: 'b2',
      date: '2025-12-28',
      isFullDay: false,
      startTime: '09:00',
      endTime: '12:00',
      reason: 'Court Session'
    }
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleAddSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '',
      endTime: '',
      branch: 'Colombo',
      maxBookings: 1
    };

    setWeeklySchedule(prev =>
      prev.map(d =>
        d.day === day ? { ...d, slots: [...d.slots, newSlot] } : d
      )
    );
  };

  const handleUpdateSlot = (id: string, updates: Partial<TimeSlot>) => {
    setWeeklySchedule(prev =>
      prev.map(day => ({
        ...day,
        slots: day.slots.map(slot =>
          slot.id === id ? { ...slot, ...updates } : slot
        )
      }))
    );
  };

  const handleDeleteSlot = (id: string) => {
    setWeeklySchedule(prev =>
      prev.map(day => ({
        ...day,
        slots: day.slots.filter(slot => slot.id !== id)
      }))
    );
  };

  const handleAddBlackout = (blackout: Omit<BlackoutDate, 'id'>) => {
    const newBlackout: BlackoutDate = {
      ...blackout,
      id: Date.now().toString()
    };
    setBlackouts(prev => [...prev, newBlackout]);
    addToast('Blackout date added successfully');
  };

  const handleDeleteBlackout = (id: string) => {
    setBlackouts(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveSchedule = () => {
    addToast('Weekly availability saved successfully');
  };

  const handleResetChanges = () => {
    // Reset to initial state
    setWeeklySchedule([
      {
        day: 'Monday',
        slots: [
          { id: '1', startTime: '09:00 AM', endTime: '11:00 AM', branch: 'Colombo', maxBookings: 4 },
          { id: '2', startTime: '02:00 PM', endTime: '04:00 PM', branch: 'Online', maxBookings: 3 }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          { id: '3', startTime: '10:00 AM', endTime: '12:00 PM', branch: 'Kandy', maxBookings: 3 },
          { id: '4', startTime: '03:00 PM', endTime: '05:00 PM', branch: 'Colombo', maxBookings: 4 }
        ]
      },
      { day: 'Wednesday', slots: [] },
      {
        day: 'Thursday',
        slots: [
          { id: '5', startTime: '09:00 AM', endTime: '12:00 PM', branch: 'Online', maxBookings: 5 }
        ]
      },
      {
        day: 'Friday',
        slots: [
          { id: '6', startTime: '01:00 PM', endTime: '03:00 PM', branch: 'Colombo', maxBookings: 3 }
        ]
      },
      { day: 'Saturday', slots: [] },
      { day: 'Sunday', slots: [] }
    ]);
    addToast('Changes reset successfully', 'info');
  };

  // Calculate stats
  const totalWeeklyHours = weeklySchedule.reduce((total, day) => {
    return total + day.slots.reduce((dayTotal, slot) => {
      if (slot.startTime && slot.endTime) {
        // Simple calculation - in real app would parse times properly
        return dayTotal + 2; // Assuming 2 hour slots
      }
      return dayTotal;
    }, 0);
  }, 0);

  const maxDailyCapacity = Math.max(...weeklySchedule.map(day => 
    day.slots.reduce((total, slot) => total + slot.maxBookings, 0)
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Availability</h1>
          <p className="text-gray-400">
            Set your weekly consultation schedule and manage unavailable dates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WeeklyScheduleCard
              weeklySchedule={weeklySchedule}
              onAddSlot={handleAddSlot}
              onUpdateSlot={handleUpdateSlot}
              onDeleteSlot={handleDeleteSlot}
              onSave={handleSaveSchedule}
              onReset={handleResetChanges}
            />
            
            <BlackoutCard
              blackouts={blackouts}
              onAdd={handleAddBlackout}
              onDelete={handleDeleteBlackout}
            />
          </div>

          <div className="space-y-6">
            <SidebarInfoCard title="How It Works">
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span><strong>Weekly Schedule:</strong> Clients see available slots after applying blackout rules.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span><strong>Auto-Recurring:</strong> Weekly schedules repeat automatically unless changed.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span><strong>Blackout Priority:</strong> Blackouts override weekly availability.</span>
                </li>
              </ul>
            </SidebarInfoCard>

            <SidebarInfoCard title="Current Status">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Weekly Hours:</span>
                  <span className="text-white font-medium">{totalWeeklyHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Blackouts:</span>
                  <span className="text-white font-medium">{blackouts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Daily Capacity:</span>
                  <span className="text-white font-medium">{maxDailyCapacity} clients</span>
                </div>
              </div>
            </SidebarInfoCard>

            <SidebarInfoCard title="Pro Tip">
              <p className="text-sm text-gray-300">
                Set buffer times between consultations by reducing max bookings per slot.
              </p>
            </SidebarInfoCard>
          </div>
        </div>
      </div>

      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default Availability;
