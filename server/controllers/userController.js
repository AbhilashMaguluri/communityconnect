const User = require('../models/User');

// @desc Get all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, count: users.length, users });
};

// @desc Get user by ID
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true, user });
};

// @desc Update user
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).select('-password');
  res.json({ success: true, user });
};

// @desc Delete user
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
};
