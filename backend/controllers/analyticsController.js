import Sale from '../models/saleModel.js';
import mongoose from 'mongoose';
import Attendance from '../models/attendanceModel.js';

// @desc    Get daily sales progress for an executive for a specific month
// @route   GET /api/analytics/sales-progress
// @access  Private/Executive
const getSalesProgress = async (req, res) => {
    try {
        const executiveId = new mongoose.Types.ObjectId(req.user._id);
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // End of the last day of the month

        const salesProgressData = await Sale.aggregate([
            { $match: { executiveId: executiveId, date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    totalSales: { $sum: '$amount' },
                },
            },
            { $sort: { '_id': 1 } },
            { $project: { _id: 0, day: '$_id', sales: '$totalSales' } }
        ]);

        res.json(salesProgressData);

    } catch (error) {
        console.error('Error fetching sales progress:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get attendance summary for an executive for a specific month
// @route   GET /api/analytics/attendance-summary
// @access  Private/Executive
const getAttendanceSummary = async (req, res) => {
    try {
        const executiveId = new mongoose.Types.ObjectId(req.user._id);
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const records = await Attendance.find({
            executive: executiveId,
            date: { $gte: startDate, $lte: endDate },
        });

        const summary = records.reduce((acc, record) => {
            const status = record.status.toLowerCase().replace('-', ''); // 'half-day' -> 'halfday'
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            present: summary.present || 0,
            absent: summary.absent || 0,
            leave: summary.leave || 0,
            halfday: summary.halfday || 0,
        });

    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getSalesProgress, getAttendanceSummary };