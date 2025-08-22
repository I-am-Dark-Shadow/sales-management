import Product from '../models/productModel.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Manager
const createProduct = async (req, res) => {
  const { name, sku, price, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required.' });
  }
  const product = new Product({
    name,
    sku,
    price,
    category,
    createdBy: req.user._id,
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Get all products for the manager
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  // Executives need to get all products, managers get what they created
  const filter = req.user.role === 'MANAGER' ? { createdBy: req.user._id } : {};
  const products = await Product.find(filter).sort({ name: 1 });
  res.json(products);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Manager
const updateProduct = async (req, res) => {
  const { name, sku, price, category } = req.body;
  const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });

  if (product) {
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.price = price || product.price;
    product.category = category || product.category;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found or you are not authorized.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Manager
const deleteProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found or you are not authorized.' });
    }
};

export { createProduct, getProducts, updateProduct, deleteProduct };