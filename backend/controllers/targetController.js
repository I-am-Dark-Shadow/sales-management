import Target from '../models/targetModel.js';
import Sale from '../models/saleModel.js';
import User from '../models/userModel.js';

// @desc    Set a new target for an executive
// @route   POST /api/targets
// @access  Private/Manager
const setTarget = async (req, res) => {
    const { executiveId, amount, startDate, endDate } = req.body;

    // Generate a user-friendly period label
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodLabel = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    
    try {
        const newTarget = await Target.create({
            executive: executiveId,
            manager: req.user._id,
            amount,
            startDate,
            endDate,
            period: periodLabel,
        });
        res.status(201).json(newTarget);
    } catch (error) {
        // Handle the unique index error
        if (error.code === 11000) {
            // A more specific error for overlapping targets
            const existingTarget = await Target.findOne({ executive: executiveId, startDate: { $lte: endDate }, endDate: { $gte: startDate }});
            if (existingTarget) {
                 return res.status(400).json({ message: 'This executive already has an overlapping target for the selected date range.' });
            }
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// A helper function to calculate progress for targets
const calculateTargetProgress = async (targets) => {
    const now = new Date();
    const targetsWithProgress = [];

    for (const target of targets) {
        const salesData = await Sale.aggregate([
            { $match: { executiveId: target.executive._id, date: { $gte: target.startDate, $lte: target.endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        
        const achievedAmount = salesData.length > 0 ? salesData[0].total : 0;
        let status = 'In Progress'; // Default status

        // --- CORRECTED STATUS LOGIC ---
        // 1. First, check if the amount has been achieved. This has the highest priority.
        if (achievedAmount >= target.amount) {
            status = 'Achieved';
        } 
        // 2. If not achieved, then check if the time period has ended.
        else if (now > target.endDate) {
            status = 'Not Achieved';
        }
        // 3. Otherwise, it's still in progress.

        targetsWithProgress.push({
            ...target.toObject(),
            achievedAmount,
            status,
        });
    }
    return targetsWithProgress;
};

// @desc    Get targets set by a manager for their team
// @route   GET /api/targets/team
const getTeamTargets = async (req, res) => {
    const { year, month } = req.query;
    const filter = { manager: req.user._id };

    // --- NEW FILTERING LOGIC ---
    if (year && month) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        // Find targets that start within the selected month
        filter.startDate = { $gte: startDate, $lte: endDate };
    }

    const targets = await Target.find(filter).populate('executive', 'name').sort({ endDate: -1 });
    const targetsWithProgress = await calculateTargetProgress(targets);
    res.json(targetsWithProgress);
};


// @desc    Get targets for the logged-in executive
// @route   GET /api/targets/my
// @access  Private/Executive
const getMyTargets = async (req, res) => {
    const targets = await Target.find({ executive: req.user._id }).populate('executive', 'name').sort({ startDate: -1 });
    const targetsWithProgress = await calculateTargetProgress(targets);
    res.json(targetsWithProgress);
};

// @desc    Delete a target
// @route   DELETE /api/targets/:id
// @access  Private/Manager
const deleteTarget = async (req, res) => {
    const target = await Target.findOne({ _id: req.params.id, manager: req.user._id });
    if (target) {
        await target.deleteOne();
        res.json({ message: 'Target removed.' });
    } else {
        res.status(404).json({ message: 'Target not found.' });
    }
};


// @desc    Update a target
// @route   PUT /api/targets/:id
// @access  Private/Manager
const updateTarget = async (req, res) => {
    const { amount, startDate, endDate } = req.body;
    const target = await Target.findOne({ _id: req.params.id, manager: req.user._id });

    if (target) {
        // Generate a new period label based on the potentially new dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const periodLabel = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

        target.amount = amount || target.amount;
        target.startDate = startDate || target.startDate;
        target.endDate = endDate || target.endDate;
        target.period = periodLabel;

        const updatedTarget = await target.save();
        res.json(updatedTarget);
    } else {
        res.status(404).json({ message: 'Target not found or not authorized.' });
    }
};



export { setTarget, getTeamTargets, getMyTargets, deleteTarget, updateTarget };