import Leave from '../models/leaveModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import Attendance from '../models/attendanceModel.js';

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private/Executive
const applyForLeave = async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'Start date, end date, and reason are required.' });
  }

  const executive = await User.findById(req.user._id);

  const leave = new Leave({
    startDate,
    endDate,
    reason,
    executiveId: req.user._id,
    managerId: executive.managerId,
  });

  const createdLeave = await leave.save();

  if (createdLeave) {
    const notification = await Notification.create({
      user: executive.managerId,
      message: `${req.user.name} has submitted a new leave request.`,
      link: '/manager/leaves',
      type: 'leave',
    });
    req.io.to(executive.managerId.toString()).emit('notification', notification);
  }
  res.status(201).json(createdLeave);
};

// @desc    Get leave history for the logged-in executive
// @route   GET /api/leaves/my-history
// @access  Private/Executive
const getMyLeaveHistory = async (req, res) => {
  const leaves = await Leave.find({ executiveId: req.user._id }).sort({ createdAt: -1 });
  res.json(leaves);
};

// @desc    Get all leave requests for a manager's team
// @route   GET /api/leaves/team-requests
// @access  Private/Manager
const getTeamLeaveRequests = async (req, res) => {
  const leaves = await Leave.find({ managerId: req.user._id })
    .populate('executiveId', 'name')
    .sort({ createdAt: -1 });
  res.json(leaves);
};

// @desc    Update leave status (approve/reject)
// @route   PATCH /api/leaves/:id/status
// @access  Private/Manager
const updateLeaveStatus = async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  const leave = await Leave.findOne({ _id: req.params.id, managerId: req.user._id });

  // if (leave && status === 'APPROVED') {
  //   // Logic to add attendance records for the leave period
  //   const startDate = new Date(leave.startDate);
  //   const endDate = new Date(leave.endDate);

  //   for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
  //     const normalizedDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  //     await Attendance.findOneAndUpdate(
  //       { executive: leave.executiveId, date: normalizedDate },
  //       { status: 'Leave' },
  //       { upsert: true }
  //     );
  //   }

  if (leave) {
    leave.status = status;
    const updatedLeave = await leave.save();

    if (status === 'APPROVED') {
      // --- CORRECTED DATE ITERATION LOGIC ---
      let currentDate = new Date(leave.startDate);
      let stopDate = new Date(leave.endDate);

      while (currentDate <= stopDate) {
        const normalizedDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
        await Attendance.findOneAndUpdate(
          { executive: leave.executiveId, date: normalizedDate },
          { status: 'Leave' },
          { upsert: true }
        );
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    // Create and emit notification for the executive
    const notification = await Notification.create({
      user: updatedLeave.executiveId,
      message: `Your leave request for ${new Date(updatedLeave.startDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
      link: '/executive/leaves',
      type: 'leave',
    });
    req.io.to(updatedLeave.executiveId.toString()).emit('notification', notification);

    res.json(updatedLeave);
  } else {
    res.status(404).json({ message: 'Leave request not found or not authorized.' });
  }
}

export { applyForLeave, getMyLeaveHistory, getTeamLeaveRequests, updateLeaveStatus };