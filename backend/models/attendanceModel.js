import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
  executive: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Halfday', 'Leave'],
  },
  reason: { // Only required if status is 'Absent'
    type: String,
    trim: true,
  },
});

// An executive can only have one status for a given day
attendanceSchema.index({ executive: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;