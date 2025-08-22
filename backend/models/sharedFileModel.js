import mongoose from 'mongoose';

const sharedFileSchema = mongoose.Schema(
  {
    fileName: { // User-friendly display name
      type: String,
      required: true,
      trim: true,
    },
    fileInfo: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const SharedFile = mongoose.model('SharedFile', sharedFileSchema);

export default SharedFile;