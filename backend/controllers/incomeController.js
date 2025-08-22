import Income from '../models/incomeModel.js';

// @desc    Create a new income entry
// @route   POST /api/incomes
// @access  Private
const createIncome = async (req, res) => {
  const { date, source, amount, description } = req.body;
  if (!date || !source || !amount) {
    return res.status(400).json({ message: 'Date, source, and amount are required.' });
  }
  const income = new Income({
    user: req.user._id,
    date,
    source,
    amount,
    description,
  });
  const createdIncome = await income.save();
  res.status(201).json(createdIncome);
};

// @desc    Get incomes for the logged-in user
// @route   GET /api/incomes
// @access  Private
const getMyIncomes = async (req, res) => {
  const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
  res.json(incomes);
};

// @desc    Delete an income entry
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (income) {
        await income.deleteOne();
        res.json({ message: 'Income entry removed' });
    } else {
        res.status(404).json({ message: 'Income entry not found or you are not authorized.' });
    }
};


export { createIncome, getMyIncomes, deleteIncome };