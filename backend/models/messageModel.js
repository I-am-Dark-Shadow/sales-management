import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true },
    contentType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileInfo: {
        url: String,
        publicId: String,
        name: String,
    }
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;