import mongoose from 'mongoose';

const saleSchema = mongoose.Schema(
  {
    executiveId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        pricePerUnit: {
          // Storing price at the time of sale is crucial
          type: Number,
          required: true,
        },
      },
    ],
    attachments: [{
      url: { type: String },
      publicId: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;