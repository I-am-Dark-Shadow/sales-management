import Attendance from '../models/attendanceModel.js';

// @desc    Get attendance records for a specific month
// @route   GET /api/attendance
// @access  Private/Executive
const getAttendanceForMonth = async (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await Attendance.find({
        executive: req.user._id,
        date: { $gte: startDate, $lte: endDate },
    });
    res.json(records);
};

// @desc    Mark or update attendance for a specific day
// @route   POST /api/attendance
// @access  Private/Executive
const markAttendance = async (req, res) => {
    const { date, status, reason } = req.body;
    const dateObj = new Date(date);
    // Normalize date to the beginning of the day to prevent timezone issues
    const normalizedDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));

    try {
        const updatedRecord = await Attendance.findOneAndUpdate(
            { executive: req.user._id, date: normalizedDate },
            { status, reason },
            { new: true, upsert: true } // Upsert: create if it doesn't exist, update if it does
        );
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance.' });
    }
};

export { getAttendanceForMonth, markAttendance };