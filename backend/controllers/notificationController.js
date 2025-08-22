import Notification from '../models/notificationModel.js';

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    const { year, month, startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    // --- UPDATED DATE LOGIC TO BE TIMEZONE-PROOF ---
    if (startDate && endDate) {
        // Use the precise range provided by the frontend
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (year && month) {
        // Keep the month/year logic as a fallback
        const startOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        const endOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
        filter.createdAt = { $gte: startOfMonth, $lt: endOfMonth };
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(notifications);
};



// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-read
// @access  Private
const markNotificationsAsRead = async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );
    res.status(200).json({ message: 'Notifications marked as read.' });
};


export { getMyNotifications, markNotificationsAsRead };