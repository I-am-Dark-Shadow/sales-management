import Message from '../models/messageModel.js';
import Team from '../models/teamModel.js';

// @desc    Get message history for a team
// @route   GET /api/chats/:teamId/messages
// @access  Private
const getMessagesForTeam = async (req, res) => {
    try {
        // First, verify the user is a member of the team they are requesting messages for
        const team = await Team.findById(req.params.teamId);
        const isMember = team.members.some(memberId => memberId.equals(req.user._id));
        const isManager = team.manager.equals(req.user._id);

        if (!isMember && !isManager) {
            return res.status(403).json({ message: 'Not authorized to view these messages.' });
        }

        const messages = await Message.find({ team: req.params.teamId })
            .populate('sender', 'name profilePicture')
            .sort({ createdAt: 'asc' });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
};

export { getMessagesForTeam };