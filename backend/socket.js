import jwt from 'jsonwebtoken';
import User from './models/userModel.js';
import Team from './models/teamModel.js';
import Message from './models/messageModel.js';
import Notification from './models/notificationModel.js';

const initializeSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });


  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.user.name}`);
    //console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join a room for the user's assigned team
    if (socket.user.team) {
      socket.join(socket.user.team.toString());
    }

    // If the user is a manager, also join rooms for all teams they manage
    if (socket.user.role === 'MANAGER') {
      const managedTeams = await Team.find({ manager: socket.user._id });
      managedTeams.forEach(team => socket.join(team._id.toString()));
    }

    // Join a personal room for direct notifications
    socket.join(socket.user._id.toString());

    // Listen for chat messages from the client
    socket.on('sendMessage', async (data) => {
      const { teamId, content, contentType, fileInfo } = data;

      // 1. Save the new message to the database
      const message = new Message({
        team: teamId,
        sender: socket.user._id,
        content,
        contentType,
        fileInfo
      });
      await message.save();
      const populatedMessage = await Message.findById(message._id).populate('sender', 'name profilePicture');

      // 2. Broadcast the new message to all clients in the team room
      io.to(teamId).emit('newMessage', populatedMessage);

      // --- NEW NOTIFICATION LOGIC ---
      // 3. Find the team and create notifications for other members
      const team = await Team.findById(teamId);
      if (team) {
        const recipients = team.members.filter(memberId => memberId.toString() !== socket.user._id.toString());

        // Also notify the manager if they aren't the sender
        if (team.manager.toString() !== socket.user._id.toString()) {
          recipients.push(team.manager);
        }

        for (const recipientId of recipients) {
          const notification = await Notification.create({
            user: recipientId,
            message: `New message from ${socket.user.name} in team "${team.name}".`,
            link: '/chat',
            type: 'chat',
          });
          // 4. Emit notification to each recipient's personal room
          io.to(recipientId.toString()).emit('notification', notification);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      //console.log(`🔌 User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};

export default initializeSocket;