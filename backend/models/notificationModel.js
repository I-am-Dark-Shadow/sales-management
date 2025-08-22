import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    user: { // The user who will RECEIVE the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: { // A URL for the frontend to navigate to when clicked
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: { 
      type: String,
      required: true,
      enum: ['leave', 'chat'],
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;