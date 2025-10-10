const Issue = require('../models/Issue');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/validation');
const path = require('path');
const fs = require('fs');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    location,
    address,
    tags
  } = req.body;

  // Process uploaded images
  const images = req.files ? req.files.map(file => ({
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size
  })) : [];

  // Create issue
  const issue = await Issue.create({
    title,
    description,
    category,
    priority: priority || 'medium',
    location,
    address,
    images,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    reportedBy: req.user._id
  });

  // Add issue to user's reported issues
  await User.findByIdAndUpdate(req.user._id, {
    $push: { issuesReported: issue._id }
  });

  const populatedIssue = await Issue.findById(issue._id)
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email');

  res.status(201).json({
    success: true,
    message: 'Issue reported successfully',
    data: populatedIssue
  });
});

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Public
const getAllIssues = asyncHandler(async (req, res) => {
  const {
    status,
    category,
    priority,
    city,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
    lat,
    lng,
    radius
  } = req.query;

  // Build query
  let query = { isPublic: true };

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  // Filter by city
  if (city) {
    query['address.city'] = { $regex: city, $options: 'i' };
  }

  // Search in title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Geolocation filter (find issues within radius)
  if (lat && lng && radius) {
    query.location = {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6371] // radius in km
      }
    };
  }

  // Sort options
  const sortOptions = {};
  if (sortBy === 'popularity') {
    sortOptions['votes.upvotes'] = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'priority') {
    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
    sortOptions.priority = sortOrder === 'asc' ? 1 : -1;
  } else {
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const issues = await Issue.find(query)
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalIssues = await Issue.countDocuments(query);

  res.json({
    success: true,
    count: issues.length,
    totalPages: Math.ceil(totalIssues / parseInt(limit)),
    currentPage: parseInt(page),
    total: totalIssues,
    data: issues
  });
});

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Public
const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('reportedBy', 'name email phone')
    .populate('assignedTo', 'name email phone')
    .populate('comments.user', 'name email')
    .populate('statusHistory.changedBy', 'name email')
    .populate('votes.voters.user', 'name email');

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }

  // Increment view count
  issue.viewCount = (issue.viewCount || 0) + 1;
  await issue.save();

  res.json({
    success: true,
    data: issue
  });
});

// @desc    Update issue (Admin only)
// @route   PUT /api/issues/:id
// @access  Private (Admin)
const updateIssue = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, estimatedResolutionDate, comment } = req.body;

  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }

  // Update status with history if status is changing
  if (status && status !== issue.status) {
    issue.updateStatus(status, req.user._id, comment);
  }

  // Update other fields
  if (priority) issue.priority = priority;
  if (assignedTo) issue.assignedTo = assignedTo;
  if (estimatedResolutionDate) issue.estimatedResolutionDate = estimatedResolutionDate;

  await issue.save();

  const updatedIssue = await Issue.findById(issue._id)
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('statusHistory.changedBy', 'name email');

  res.json({
    success: true,
    message: 'Issue updated successfully',
    data: updatedIssue
  });
});

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (Admin or Issue Reporter)
const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }

  // Check if user is admin or the reporter
  if (req.user.role !== 'admin' && issue.reportedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this issue'
    });
  }

  // Delete associated images
  if (issue.images && issue.images.length > 0) {
    issue.images.forEach(image => {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }
    });
  }

  await Issue.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Issue deleted successfully'
  });
});

// @desc    Vote on issue
// @route   POST /api/issues/:id/vote
// @access  Private
const voteOnIssue = asyncHandler(async (req, res) => {
  const { voteType } = req.body; // 'up' or 'down'

  if (!['up', 'down'].includes(voteType)) {
    return res.status(400).json({
      success: false,
      message: 'Vote type must be "up" or "down"'
    });
  }

  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }

  // Add vote
  const voteResult = issue.addVote(req.user._id, voteType);

  if (!voteResult.success) {
    return res.status(400).json({
      success: false,
      message: voteResult.message
    });
  }

  await issue.save();

  // Update user's voted issues
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: {
      issuesVoted: {
        issue: issue._id,
        voteType: voteType
      }
    }
  });

  res.json({
    success: true,
    message: voteResult.message,
    data: {
      upvotes: issue.votes.upvotes,
      downvotes: issue.votes.downvotes,
      totalVotes: issue.totalVotes
    }
  });
});

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }

  const comment = {
    user: req.user._id,
    message,
    isOfficial: req.user.role === 'admin'
  };

  issue.comments.push(comment);
  await issue.save();

  const updatedIssue = await Issue.findById(issue._id)
    .populate('comments.user', 'name email role');

  const newComment = updatedIssue.comments[updatedIssue.comments.length - 1];

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: newComment
  });
});

// @desc    Get issues reported by user
// @route   GET /api/issues/my-issues
// @access  Private
const getMyIssues = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = { reportedBy: req.user._id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const issues = await Issue.find(query)
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalIssues = await Issue.countDocuments(query);

  res.json({
    success: true,
    count: issues.length,
    totalPages: Math.ceil(totalIssues / parseInt(limit)),
    currentPage: parseInt(page),
    total: totalIssues,
    data: issues
  });
});

// @desc    Get issues statistics
// @route   GET /api/issues/stats
// @access  Public
const getIssueStats = asyncHandler(async (req, res) => {
  const stats = await Issue.aggregate([
    {
      $group: {
        _id: null,
        totalIssues: { $sum: 1 },
        resolvedIssues: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        inProgressIssues: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        reportedIssues: {
          $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] }
        }
      }
    }
  ]);

  const categoryStats = await Issue.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const priorityStats = await Issue.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overall: stats[0] || {
        totalIssues: 0,
        resolvedIssues: 0,
        inProgressIssues: 0,
        reportedIssues: 0
      },
      byCategory: categoryStats,
      byPriority: priorityStats
    }
  });
});

// @desc    Get trending issues
// @route   GET /api/issues/analytics/trending
// @access  Public
const getTrendingIssues = asyncHandler(async (req, res) => {
  const { 
    limit = 10, 
    timeRange = 'week', 
    sortBy = 'votes' 
  } = req.query;

  // Calculate date filter based on time range
  let dateFilter = {};
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
      break;
    case 'all':
    default:
      dateFilter = {}; // No date filter for all time
      break;
  }

  let sortCriteria = {};
  
  switch (sortBy) {
    case 'votes':
      // Sort by net votes (upvotes - downvotes)
      sortCriteria = { 
        'votesSum': -1, 
        'votes.upvotes': -1, 
        createdAt: -1 
      };
      break;
    case 'recent':
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'controversial':
      // Sort by controversy score (high vote count with close upvote/downvote ratio)
      sortCriteria = { 
        'controversyScore': -1, 
        'votesTotal': -1, 
        createdAt: -1 
      };
      break;
    default:
      sortCriteria = { createdAt: -1 };
  }

  // Build aggregation pipeline
  const pipeline = [
    { $match: dateFilter },
    {
      $addFields: {
        votesTotal: { 
          $add: [
            { $ifNull: ['$votes.upvotes', 0] },
            { $ifNull: ['$votes.downvotes', 0] }
          ]
        },
        votesSum: { 
          $subtract: [
            { $ifNull: ['$votes.upvotes', 0] },
            { $ifNull: ['$votes.downvotes', 0] }
          ]
        },
        controversyScore: {
          $cond: {
            if: { 
              $and: [
                { $gt: [{ $ifNull: ['$votes.upvotes', 0] }, 0] },
                { $gt: [{ $ifNull: ['$votes.downvotes', 0] }, 0] }
              ]
            },
            then: {
              $multiply: [
                {
                  $divide: [
                    { 
                      $min: [
                        { $ifNull: ['$votes.upvotes', 0] },
                        { $ifNull: ['$votes.downvotes', 0] }
                      ]
                    },
                    { 
                      $max: [
                        { $ifNull: ['$votes.upvotes', 0] },
                        { $ifNull: ['$votes.downvotes', 0] }
                      ]
                    }
                  ]
                },
                { 
                  $add: [
                    { $ifNull: ['$votes.upvotes', 0] },
                    { $ifNull: ['$votes.downvotes', 0] }
                  ]
                }
              ]
            },
            else: 0
          }
        }
      }
    },
    { $sort: sortCriteria },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'reportedBy',
        foreignField: '_id',
        as: 'reportedBy'
      }
    },
    {
      $unwind: {
        path: '$reportedBy',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        category: 1,
        priority: 1,
        status: 1,
        votes: 1,
        images: 1,
        location: 1,
        address: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1,
        viewCount: 1,
        commentsCount: { $size: { $ifNull: ['$comments', []] } },
        votesTotal: 1,
        votesSum: 1,
        controversyScore: 1,
        'reportedBy.name': 1,
        'reportedBy.email': 1
      }
    }
  ];

  const issues = await Issue.aggregate(pipeline);

  // If user is authenticated, check their votes
  if (req.user) {
    const issueIds = issues.map(issue => issue._id);
    const userVotes = await Issue.find({
      _id: { $in: issueIds },
      'votes.users': req.user._id
    }, 'votes.users votes.userVotes');

    // Add user vote info to each issue
    issues.forEach(issue => {
      const userVoteData = userVotes.find(v => v._id.toString() === issue._id.toString());
      if (userVoteData) {
        const userVoteIndex = userVoteData.votes.users.indexOf(req.user._id);
        if (userVoteIndex !== -1) {
          issue.userVote = userVoteData.votes.userVotes[userVoteIndex];
        }
      }
    });
  }

  res.json({
    success: true,
    count: issues.length,
    data: {
      issues,
      timeRange,
      sortBy,
      limit: parseInt(limit)
    }
  });
});

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  voteOnIssue,
  addComment,
  getMyIssues,
  getIssueStats,
  getTrendingIssues
};