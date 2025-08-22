import User from '../models/userModel.js';
import Sale from '../models/saleModel.js';
import Attendance from '../models/attendanceModel.js';
import Target from '../models/targetModel.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all executives under the logged-in manager
// @route   GET /api/users
// @access  Private/Manager
const getTeamExecutives = async (req, res) => {
  const executives = await User.find({ managerId: req.user._id }).populate('team', 'name');
  res.json(executives);
};

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/users/:id/status
// @access  Private/Manager
const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findOne({ _id: req.params.id, managerId: req.user._id });

  if (user) {
    user.isActive = isActive;
    await user.save();
    res.json({ message: `User ${user.name} has been ${isActive ? 'activated' : 'deactivated'}.` });
  } else {
    res.status(404).json({ message: 'Executive not found or you are not their manager.' });
  }
};

// @desc    Reset password for an executive
// @route   POST /api/users/:id/reset-password
// @access  Private/Manager
const resetExecutivePassword = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, managerId: req.user._id });

    if (user) {
        const newPassword = crypto.randomBytes(8).toString('hex');
        user.password = newPassword;
        await user.save();
        res.json({ 
            message: `Password for ${user.name} has been reset successfully.`,
            newPassword: newPassword,
        });
    } else {
        res.status(404).json({ message: 'Executive not found or you are not their manager.' });
    }
};


// @desc    Update user profile (name, picture)
// @route   PATCH /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;

    if (req.body.profilePicture) {
      // If user already has a picture, delete it from Cloudinary
      if (user.profilePicture && user.profilePicture.publicId) {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      }
      user.profilePicture = {
        url: req.body.profilePicture.url,
        publicId: req.body.profilePicture.publicId,
      };
    }
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// @desc    Get a detailed performance overview for a single executive
// @route   GET /api/users/:id/details
// @access  Private/Manager
const getExecutiveDetails = async (req, res) => {
    try {
        const executiveId = new mongoose.Types.ObjectId(req.params.id);
        
        // 1. Basic User Info (with Team)
        const userInfo = await User.findById(executiveId).populate('team', 'name');
        if (!userInfo || !userInfo.managerId.equals(req.user._id)) {
            return res.status(404).json({ message: 'Executive not found under your management.' });
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // 2. Sales KPIs
        const todaySalesData = await Sale.aggregate([
            { $match: { executiveId, date: { $gte: todayStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const monthlySalesData = await Sale.aggregate([
            { $match: { executiveId, date: { $gte: monthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // 3. Sales for a specific date (if provided)
        let specificDateSales = null;
        if(req.query.date) {
            const specificDate = new Date(req.query.date);
            const specificDateStart = new Date(Date.UTC(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate()));
            const specificDateEnd = new Date(specificDateStart.getTime() + 24 * 60 * 60 * 1000 - 1);
            const specificDateSalesData = await Sale.aggregate([
                 { $match: { executiveId, date: { $gte: specificDateStart, $lte: specificDateEnd } } },
                 { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            specificDateSales = specificDateSalesData.length > 0 ? specificDateSalesData[0].total : 0;
        }

        // 4. Attendance for the current month
        const attendance = await Attendance.find({ executive: executiveId, date: { $gte: monthStart } });
        
        // 5. Current Target Status
        const currentTarget = await Target.findOne({ executive: executiveId, startDate: { $lte: now }, endDate: { $gte: now }});
        let targetWithProgress = null;
        if(currentTarget) {
             const salesData = await Sale.aggregate([
                { $match: { executiveId, date: { $gte: currentTarget.startDate, $lte: currentTarget.endDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            const achievedAmount = salesData.length > 0 ? salesData[0].total : 0;
            targetWithProgress = { ...currentTarget.toObject(), achievedAmount };
        }

        res.json({
            user: userInfo,
            todaySales: todaySalesData.length > 0 ? todaySalesData[0].total : 0,
            monthlySales: monthlySalesData.length > 0 ? monthlySalesData[0].total : 0,
            specificDateSales,
            attendance,
            target: targetWithProgress
        });

    } catch (error) {
        console.error("Error fetching executive details:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


export { getTeamExecutives, updateUserStatus, resetExecutivePassword, updateUserProfile, getExecutiveDetails };