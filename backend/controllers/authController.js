import User from '../models/userModel.js';
import Team from '../models/teamModel.js';
import generateTokens from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.isActive && (await user.matchPassword(password))) {
    const accessToken = generateTokens(res, user._id, user.role);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      accessToken,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password, or user is inactive.' });
  }
};

// @desc    Register a new sales executive
// @route   POST /api/auth/register
// @access  Private/Manager
const registerExecutive = async (req, res) => {
  const { name, email, password, teamId } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'EXECUTIVE',
    managerId: req.user._id, // Assign manager's ID
    team: teamId || null,
  });


  if (user) {
    if (teamId) {
      await Team.findByIdAndUpdate(teamId, { $push: { members: user._id } });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('team', 'name');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      team: user.team,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        
        // Generate a new access token (the generateTokens function handles the refresh token cookie automatically)
        const accessToken = generateTokens(res, user._id, user.role);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            accessToken,
        });

    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export { loginUser, registerExecutive, logoutUser, getMe, refreshToken };