import Sale from '../models/saleModel.js';
import mongoose from 'mongoose';

// @desc    Get sales leaderboard
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        let startDate;

        const now = new Date();
        if (period === 'yearly') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else if (period === 'alltime') {
            startDate = new Date(0); // The beginning of time
        } else { // Default to monthly
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const leaderboardData = await Sale.aggregate([
            // 1. Filter sales within the selected period
            { $match: { date: { $gte: startDate } } },
            // 2. Group by executive and sum their sales
            {
                $group: {
                    _id: '$executiveId',
                    totalSales: { $sum: '$amount' },
                },
            },
            // 3. Sort by total sales in descending order
            { $sort: { totalSales: -1 } },
            // 4. Limit to the top 20 performers
            { $limit: 20 },
            // 5. Look up user details from the 'users' collection
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'executiveInfo',
                },
            },
            // 6. Deconstruct the user info array and handle cases where user might not be found
            { $unwind: { path: '$executiveInfo', preserveNullAndEmptyArrays: true } },
            // 7. Project the final fields for the response
            {
                $project: {
                    _id: 0,
                    executiveId: '$_id',
                    totalSales: '$totalSales',
                    name: '$executiveInfo.name',
                    profilePicture: '$executiveInfo.profilePicture',
                },
            },
        ]);

        res.json(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard.' });
    }
};

export { getLeaderboard };