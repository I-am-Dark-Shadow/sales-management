import Attendance from '../models/attendanceModel.js';
import Leave from '../models/leaveModel.js';
import mongoose from 'mongoose';

const getCalendarEvents = async (req, res) => {
    try {
        const executiveId = new mongoose.Types.ObjectId(req.user._id);
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        const startDateOfMonth = new Date(year, month - 1, 1);
        const endDateOfMonth = new Date(year, month, 0, 23, 59, 59);

        const [attendanceRecords, leaveRecords] = await Promise.all([
            Attendance.find({ executive: executiveId, date: { $gte: startDateOfMonth, $lte: endDateOfMonth } }),
            Leave.find({ executiveId: executiveId, endDate: { $gte: startDateOfMonth }, startDate: { $lte: endDateOfMonth } })
        ]);

        const events = {};

        attendanceRecords.forEach(rec => {
            const dateKey = new Date(rec.date).toDateString();
            events[dateKey] = { date: rec.date, status: rec.status };
        });

        // --- CORRECTED DATE ITERATION LOGIC ---
        leaveRecords.forEach(leave => {
            if (leave.status === 'REJECTED') {
                return; // Skip this record and do not add it to the calendar
            }

            // Use a while loop for safer date iteration
            let currentDate = new Date(leave.startDate);
            let stopDate = new Date(leave.endDate);

            while (currentDate <= stopDate) {
                if (currentDate >= startDateOfMonth && currentDate <= endDateOfMonth) {
                    const dateKey = currentDate.toDateString();
                    const status = leave.status === 'PENDING' ? 'Leave-Pending' : 'Leave-Approved';
                    // Create a new Date object for each event to avoid mutation issues
                    events[dateKey] = { date: new Date(currentDate), status };
                }
                // Move to the next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        res.json(Object.values(events));

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getCalendarEvents };