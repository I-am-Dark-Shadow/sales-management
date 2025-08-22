import cron from 'node-cron';
import User from '../models/userModel.js';
import Attendance from '../models/attendanceModel.js';

const startAttendanceCron = () => {
    // This schedule runs every day at 11:59 PM
    cron.schedule('59 23 * * *', async () => {
        console.log('Running daily cron job: Auto-marking missed attendance...');

        const today = new Date();
        // We check for yesterday's attendance. Set hours to normalize the date.
        const yesterday = new Date(today.setDate(today.getDate() - 1));
        const normalizedYesterday = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()));

        const dayOfWeek = yesterday.getDay();
        // Skip on weekends (Saturday=6, Sunday=0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log('Skipping attendance check: Weekend.');
            return;
        }

        try {
            // Find all active executives
            const executives = await User.find({ role: 'EXECUTIVE', isActive: true });
            
            for (const executive of executives) {
                // Check if an attendance record already exists for this executive on this day
                const existingRecord = await Attendance.findOne({
                    executive: executive._id,
                    date: normalizedYesterday,
                });

                // If no record exists, mark them as absent
                if (!existingRecord) {
                    await Attendance.create({
                        executive: executive._id,
                        date: normalizedYesterday,
                        status: 'Absent',
                        reason: 'Auto-marked: No attendance recorded.'
                    });
                    console.log(`Marked ${executive.name} as Absent for ${normalizedYesterday.toLocaleDateString()}`);
                }
            }
            console.log('Finished attendance cron job.');
        } catch (error) {
            console.error('Error in attendance cron job:', error);
        }
    });
};

export default startAttendanceCron;