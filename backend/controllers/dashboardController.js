import Sale from '../models/saleModel.js';
import Leave from '../models/leaveModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import Expense from '../models/expenseModel.js';
import Income from '../models/incomeModel.js';
import Target from '../models/targetModel.js';
import Attendance from '../models/attendanceModel.js';

// @desc    Get stats for Manager Dashboard
// @route   GET /api/dashboard/manager
// @access  Private/Manager
const getManagerDashboardStats = async (req, res) => {
  try {
    const managerId = new mongoose.Types.ObjectId(req.user._id);
    const { view = 'monthly', year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    // 1. Total Sales of the team (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const salesThisMonth = await Sale.aggregate([
      { $match: { managerId: managerId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 2. Pending Leave Requests
    const pendingLeaves = await Leave.countDocuments({
      managerId: managerId,
      status: 'PENDING',
    });

    // 3. Team Size
    const teamSize = await User.countDocuments({ managerId: managerId });

    // 4. Sales Trend 
    let salesTrend = [];
    if (view === 'monthly') {
      // Fetch monthly sales for a given year
      salesTrend = await Sale.aggregate([
        { $match: { managerId: managerId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
        { $group: { _id: { month: { $month: '$date' } }, totalSales: { $sum: '$amount' } } },
        { $sort: { '_id.month': 1 } },
        { $project: { _id: 0, month: '$_id.month', sales: '$totalSales' } }
      ]);
    } else if (view === 'daily') {
      // Fetch daily sales for a given month and year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      salesTrend = await Sale.aggregate([
        { $match: { managerId: managerId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { day: { $dayOfMonth: '$date' } }, totalSales: { $sum: '$amount' } } },
        { $sort: { '_id.day': 1 } },
        { $project: { _id: 0, day: '$_id.day', sales: '$totalSales' } }
      ]);
    }

    // 5. Get the start of the current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    // 6. Count approved leaves since the start of the week
    const approvalsThisWeek = await Leave.countDocuments({
      managerId: managerId,
      status: 'APPROVED',
      updatedAt: { $gte: startOfWeek } // We check updatedAt because that's when the status changes
    });


    res.json({
      totalSales: salesThisMonth.length > 0 ? salesThisMonth[0].total : 0,
      pendingLeaves,
      teamSize,
      salesTrend: salesTrend,
      approvalsThisWeek: approvalsThisWeek,
    });
  } catch (error) {
    console.error('Error fetching manager dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Get stats for Executive Dashboard
// @route   GET /api/dashboard/executive
// @access  Private/Executive
const getExecutiveDashboardStats = async (req, res) => {
  try {
    const executiveId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentTarget = await Target.findOne({
      executive: executiveId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Calculate sales achieved during the current target's period
    let salesForTargetPeriod = 0;
    if (currentTarget) {
      const salesData = await Sale.aggregate([
        { $match: { executiveId: executiveId, date: { $gte: currentTarget.startDate, $lte: currentTarget.endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      if (salesData.length > 0) {
        salesForTargetPeriod = salesData[0].total;
      }
    }

    // Date calculations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);


    const attendanceRecords = await Attendance.find({
      executive: executiveId, 
      date: { $gte: monthStart },
    });

    const attendanceSummary = attendanceRecords.reduce((acc, record) => {
      if (record.status === 'Present') acc.present++;
      if (record.status === 'Leave' || record.status === 'Absent') acc.leave++;
      if (record.status === 'Half-day') acc.halfDay++;
      return acc;
    }, { present: 0, leave: 0, halfDay: 0 });

    let totalWorkingDaysSoFar = 0;
    for (let i = 1; i <= now.getDate(); i++) {
        const day = new Date(now.getFullYear(), now.getMonth(), i).getDay();
        if (day !== 0 && day !== 6) { // 0 is Sunday, 6 is Saturday
            totalWorkingDaysSoFar++;
        }
    }

    // 1. Today's Sales
    const todaySales = await Sale.aggregate([
      { $match: { executiveId: executiveId, date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 2. Monthly Sales
    const monthlySales = await Sale.aggregate([
      { $match: { executiveId: executiveId, date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 3. Aggregate daily sales for the current month
    // const salesProgressData = await Sale.aggregate([
    //   { $match: { executiveId: executiveId, date: { $gte: monthStart, $lte: now } } },
    //   {
    //     $group: {
    //       _id: { $dayOfMonth: '$date' },
    //       totalSales: { $sum: '$amount' },
    //     },
    //   },
    //   { $sort: { '_id': 1 } },
    //   { $project: { _id: 0, day: '$_id', sales: '$totalSales' } }
    // ]);

    // 4. Leave counts for the month
    const presentDays = 22; // This would typically come from a more complex attendance system
    const leavesThisMonth = await Leave.countDocuments({ executiveId, status: 'APPROVED', startDate: { $gte: monthStart } });

    const daysAttended = attendanceSummary.present + (attendanceSummary.halfDay * 0.5);
    const attendancePercentage = totalWorkingDaysSoFar > 0 ? (daysAttended / totalWorkingDaysSoFar) * 100 : 0;

    let attendanceStatus = "No data";
    if (totalWorkingDaysSoFar > 0) {
        if(attendancePercentage >= 90) attendanceStatus = "On track";
        else if (attendancePercentage >= 75) attendanceStatus = "Needs Improvement";
        else attendanceStatus = "At Risk";
    }

    res.json({
      todaySales: todaySales.length > 0 ? todaySales[0].total : 0,
      monthlySales: monthlySales.length > 0 ? monthlySales[0].total : 0,
      attendance: {
        present: attendanceSummary.present,
        leave: attendanceSummary.leave,
        off: 8,
      },
      attendancePercentage, 
      attendanceStatus,     

      target: currentTarget ? {
        amount: currentTarget.amount,
        achieved: salesForTargetPeriod,
        progress: currentTarget.amount > 0 ? (salesForTargetPeriod / currentTarget.amount * 100) : 0,
      } : null, // Send target data if it exists

      //salesProgressData: salesProgressData,
    });

  } catch (error) {
    console.error('Error fetching executive dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Get financial summary (income vs expense)
// @route   GET /api/dashboard/financial-summary
// @access  Private
const getFinancialSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { year = new Date().getFullYear() } = req.query;

    const expenses = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' } } },
    ]);

    // MODIFIED: This now queries the new 'incomes' collection for all users
    const incomes = await Income.aggregate([
      { $match: { user: userId, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' } } },
    ]);

    const summary = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthName = new Date(year, i, 1).toLocaleString('default', { month: 'short' });

      const monthIncome = incomes.find(s => s._id.month === month);
      const monthExpense = expenses.find(e => e._id.month === month);

      return {
        name: monthName,
        income: monthIncome ? monthIncome.total : 0,
        expenses: monthExpense ? monthExpense.total : 0,
      };
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getManagerDashboardStats, getExecutiveDashboardStats, getFinancialSummary };