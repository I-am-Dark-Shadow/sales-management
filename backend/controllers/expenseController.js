import Expense from '../models/expenseModel.js';

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  const { date, category, amount, description } = req.body;
  if (!date || !category || !amount) {
    return res.status(400).json({ message: 'Date, category, and amount are required.' });
  }
  const expense = new Expense({
    user: req.user._id,
    date,
    category,
    amount,
    description,
  });
  const createdExpense = await expense.save();
  res.status(201).json(createdExpense);
};

// @desc    Get expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getMyExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
  res.json(expenses);
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (expense) {
        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } else {
        res.status(404).json({ message: 'Expense not found or you are not authorized.' });
    }
};


export { createExpense, getMyExpenses, deleteExpense };