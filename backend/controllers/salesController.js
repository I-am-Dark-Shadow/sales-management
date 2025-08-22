import Sale from '../models/saleModel.js';
import User from '../models/userModel.js';
import Team from '../models/teamModel.js';

// @desc    Add a daily sale record
// @route   POST /api/sales
// @access  Private/Executive
const addDailySale = async (req, res) => {
  const { date, remarks, location, products, attachments } = req.body;

  if (!date || !location || !products || products.length === 0) {
    return res.status(400).json({ message: 'Date, location, and at least one product are required.' });
  }

  // Calculate total amount from products array
  const totalAmount = products.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);

  const executive = await User.findById(req.user._id);

  const sale = new Sale({
    amount: totalAmount, // Calculated total amount
    date,
    remarks,
    location,
    products,
    attachments,
    executiveId: req.user._id,
    managerId: executive.managerId,
  });

  const createdSale = await sale.save();
  res.status(201).json(createdSale);
};

// @desc    Get sales for the logged-in executive
// @route   GET /api/sales/my-sales
// @access  Private/Executive
const getMySales = async (req, res) => {
    const { year, month, date } = req.query;
    const filter = { executiveId: req.user._id };

    if (date) {
        const specificDate = new Date(date + 'T00:00:00.000Z');
        const endDate = new Date(specificDate.getTime() + 24 * 60 * 60 * 1000);
        filter.date = { $gte: specificDate, $lt: endDate };
    } else if (year && month) {
        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
        filter.date = { $gte: startDate, $lt: endDate };
    }

    const sales = await Sale.find(filter)
        .populate('products.productId', 'name') // Populate the product name
        .sort({ date: -1 });
    res.json(sales);
};

// @desc    Get all sales for a manager's team
// @route   GET /api/sales/team-sales
// @access  Private/Manager
const getTeamSales = async (req, res) => {
    const { year, month, date, teamId } = req.query;
    const filter = { managerId: req.user._id };

    // --- NEW FILTERING LOGIC ---
    if (teamId && teamId !== 'all') {
        const team = await Team.findById(teamId);
        if (team && team.manager.equals(req.user._id)) { // Security check
            filter.executiveId = { $in: team.members };
        }
    }
    
    if (date) {
        const specificDate = new Date(date + 'T00:00:00.000Z');
        const endDate = new Date(specificDate.getTime() + 24 * 60 * 60 * 1000);
        filter.date = { $gte: specificDate, $lt: endDate };
    } else if (year && month) {
        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
        filter.date = { $gte: startDate, $lt: endDate };
    }

    const sales = await Sale.find(filter)
        .populate('executiveId', 'name') // <-- Also populate executive name
        .populate('products.productId', 'name')
        .sort({ date: -1 });
        
    res.json(sales);
};




export { addDailySale, getMySales, getTeamSales };