import mongoose from 'mongoose';

const targetSchema = mongoose.Schema(
  {
    executive: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    period: { type: String, required: true }, // e.g., "July 2025"
  },
  {
    timestamps: true,
  }
);

// Ensure an executive can only have one target for a given period
targetSchema.index({ executive: 1, period: 1 }, { unique: true });

const Target = mongoose.model('Target', targetSchema);

export default Target;