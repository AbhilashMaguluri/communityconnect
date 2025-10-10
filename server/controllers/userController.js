const User = require('../models/User');
const Issue = require('../models/Issue');
const { asyncHandler } = require('../middleware/validation');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;

  let query = {};

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password')
    .populate('issuesReported', 'title status createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalUsers = await User.countDocuments(query);

  res.json({
    success: true,
    count: users.length,
    totalPages: Math.ceil(totalUsers / parseInt(limit)),
    currentPage: parseInt(page),
    total: totalUsers,
    data: users
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('issuesReported', 'title status category createdAt');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user statistics
  const userStats = await Issue.aggregate([
    { $match: { reportedBy: user._id } },
    {
      $group: {
        _id: null,
        totalReported: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        totalVotesReceived: { $sum: '$votes.upvotes' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      user,
      stats: userStats[0] || {
        totalReported: 0,
        resolved: 0,
        inProgress: 0,
        totalVotesReceived: 0
      }
    }
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either "user" or "admin"'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: user
  });
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User account ${user.isActive ? 'activated' : 'deactivated'}`,
    data: user
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user has any issues
  const userIssues = await Issue.countDocuments({ reportedBy: user._id });

  if (userIssues > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with reported issues. Deactivate account instead.'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private (Admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  // User statistics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        admins: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        regularUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
        }
      }
    }
  ]);

  // Recent registrations (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Issue statistics
  const issueStats = await Issue.aggregate([
    {
      $group: {
        _id: null,
        totalIssues: { $sum: 1 },
        resolvedIssues: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        pendingIssues: {
          $sum: { 
            $cond: [
              { $in: ['$status', ['reported', 'in-review', 'in-progress']] }, 
              1, 0
            ] 
          }
        }
      }
    }
  ]);

  // Recent issues (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentIssues = await Issue.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  res.json({
    success: true,
    data: {
      users: userStats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        regularUsers: 0
      },
      recentRegistrations,
      issues: issueStats[0] || {
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0
      },
      recentIssues
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats
};