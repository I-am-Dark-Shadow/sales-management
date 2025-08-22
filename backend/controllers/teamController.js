import Team from '../models/teamModel.js';
import User from '../models/userModel.js';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private/Manager
const createTeam = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Team name is required.' });
  }
  const team = new Team({ name, manager: req.user._id });
  const createdTeam = await team.save();
  res.status(201).json(createdTeam);
};

// @desc    Get all teams for the manager
// @route   GET /api/teams
// @access  Private/Manager
const getMyTeams = async (req, res) => {
  const teams = await Team.find({ manager: req.user._id }).populate('members', 'name email');
  res.json(teams);
};

// @desc    Update a team's members
// @route   PUT /api/teams/:id/members
// @access  Private/Manager
const updateTeamMembers = async (req, res) => {
    const { memberIds } = req.body; // Expect an array of user IDs
    const team = await Team.findOne({ _id: req.params.id, manager: req.user._id });

    if (!team) {
        return res.status(404).json({ message: 'Team not found.' });
    }
    
    // First, clear the team field for all old members of this team
    await User.updateMany({ team: team._id }, { $set: { team: null } });

    // Then, assign the new members to this team
    await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });

    // Finally, update the team's member list
    team.members = memberIds;
    await team.save();

    const updatedTeam = await Team.findById(team._id).populate('members', 'name email');

    res.json(updatedTeam);
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private/Manager
const deleteTeam = async (req, res) => {
    const team = await Team.findOne({ _id: req.params.id, manager: req.user._id });
    if (!team) {
        return res.status(404).json({ message: 'Team not found.' });
    }
    // Unassign all members before deleting the team
    await User.updateMany({ team: team._id }, { $set: { team: null } });
    await team.deleteOne();
    res.json({ message: 'Team removed successfully.' });
};


export { createTeam, getMyTeams, updateTeamMembers, deleteTeam };