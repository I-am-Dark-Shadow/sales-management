import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      // Stock Keeping Unit - Optional but good practice
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple documents to have a null sku
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;