import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const [date, setDate] = useState(new Date());
  const [eventData, setEventData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState('');

  const fetchCalendarEvents = async (viewDate) => {
    try {
      // <-- Changed to new endpoint
      const { data } = await axiosInstance.get(`/api/calendar/events?month=${viewDate.getMonth() + 1}&year=${viewDate.getFullYear()}`);
      setEventData(data);
    } catch (error) {
      toast.error("Failed to load calendar data.");
    }
  };

  useEffect(() => {
    fetchCalendarEvents(date);
  }, [date]);

  const markAttendance = async (status) => {
    try {
      const { data: newRecord } = await axiosInstance.post('/api/attendance', { date: selectedDate, status, reason });
      toast.success(`Marked as ${status}`);
      const dateKey = new Date(newRecord.date).toDateString();
      const updatedEvents = eventData.filter(e => new Date(e.date).toDateString() !== dateKey);
      setEventData([...updatedEvents, { date: newRecord.date, status: newRecord.status }]);

      setSelectedDate(null);
      setReason('');
    } catch (error) {
      toast.error("Failed to mark attendance.");
    }
  };

  const getTileClassName = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const record = eventData.find(d => new Date(d.date).toDateString() === tileDate.toDateString());
      if (record) {
        return record.status.toLowerCase().replace('-', '');
      }
    }
  };

  const isDateDisabled = ({ date, view }) => {
    if (view === 'month') {
      const today = new Date();
      // Set hours to 0 to compare dates without time
      today.setHours(0, 0, 0, 0);
      return date < today;
    }
    return false;
  };

  const handleDayClick = (value) => {
    const today = new Date();
    const clickedDateStr = value.toDateString();
    
    const event = eventData.find(e => new Date(e.date).toDateString() === clickedDateStr);

    // Rule 1: If the date is part of a leave request, show a message and stop.
    if (event && event.status.includes('Leave')) {
        toast.error(`This date is now ${event.status.split('-')[1].toLowerCase()} leave request.`);
        return;
    }

    // Rule 2: Only allow clicking on today's date.
    if (clickedDateStr === today.toDateString()) {
        // --- NEW LOGIC: Check if attendance is already marked for today ---
        if (event) {
            toast.error("You have already marked your attendance for today.");
            return;
        }
        // If no record exists for today, open the modal.
        setSelectedDate(value);
    } else {
        toast.error("You can only mark attendance for the current date.");
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-tight mb-4">My Attendance</h2>
      <Calendar
        onChange={setDate}
        value={date}
        onClickDay={handleDayClick}
        onActiveStartDateChange={({ activeStartDate }) => fetchCalendarEvents(activeStartDate)}
        tileClassName={getTileClassName}
        tileDisabled={isDateDisabled}
      />

      {/* Attendance Marking Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center" onClick={() => setSelectedDate(null)}>
          <div className="relative rounded-2xl bg-white p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Mark Attendance for {selectedDate.toLocaleDateString()}</h3>
            <div className="mt-4 space-y-2">
              <button onClick={() => markAttendance('Present')} className="w-full text-center py-2 bg-pran-green text-white rounded-lg">Present</button>
              <button onClick={() => markAttendance('Halfday')} className="w-full text-center py-2 bg-pran-yellow text-white rounded-lg">Halfday</button>
              <div className="space-y-2 rounded-lg border border-black/10 p-3">
                <label className="text-sm font-medium">Mark Absent</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for absence..." className="w-full rounded-md border border-black/10 px-2 py-1 text-sm" rows="2"></textarea>
                <button onClick={() => markAttendance('Absent')} disabled={!reason} className="w-full text-center py-2 bg-pran-red text-white rounded-lg disabled:opacity-50">Submit Absent</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;