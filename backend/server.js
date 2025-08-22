import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Socket.io
import { createServer } from 'http';
import { Server } from 'socket.io';
import initializeSocket from './socket.js';

// Database
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import productRoutes from './routes/productRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import targetRoutes from './routes/targetRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import startAttendanceCron from './cron/attendanceCron.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();
startAttendanceCron();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { // <-- Attach socket.io to the server
  cors: {
    origin: 'https://sales-management-azy6269r1.vercel.app',
    //origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
  },
});

// Make io instance available to all routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Initialize socket event handlers
initializeSocket(io);

// Middlewares
app.use(cors({
  origin: 'https://sales-management-azy6269r1.vercel.app',
  //origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/products', productRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/calendar', calendarRoutes);


// Simple root route
app.get('/', (req, res) => {
  res.json({ message: 'Sales Management API is running...' });
});


const PORT = process.env.PORT || 5001;

// Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`✅ Server with WebSockets is running on port ${PORT}`);
});