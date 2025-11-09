const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth'); // ✅ use named import (middleware must be a function)

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpeg|jpg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// In-memory demo store used when NODE_ENV !== 'production'
// New issues will be pushed here so they appear in subsequent GET requests
const demoIssues = [
  {
    _id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'Infrastructure',
    priority: 'High',
    status: 'Open',
    location: { lat: 40.7128, lng: -74.006 },
    address: '123 Main St, New York, NY',
    createdBy: 'admin@demo.com',
    createdAt: new Date().toISOString(),
    upvotes: 5,
    downvotes: 1,
    comments: [],
  },
  {
    _id: '2',
    title: 'Broken Streetlight',
    description: 'Streetlight has been out for a week',
    category: 'Infrastructure',
    priority: 'Medium',
    status: 'In Progress',
    location: { lat: 40.7138, lng: -74.007 },
    address: '456 Oak Ave, New York, NY',
    createdBy: 'user@demo.com',
    createdAt: new Date().toISOString(),
    upvotes: 3,
    downvotes: 0,
    comments: [],
  },
];

// ✅ Get all issues
router.get('/', async (req, res) => {
  try {
    // If MongoDB is connected, load persisted reports from DB
    if (mongoose.connection.readyState === 1) {
      try {
        // Populate reportedBy with basic user info when available
        const reports = await Report.find().populate('reportedBy', 'name email').sort({ createdAt: -1 });
        return res.json({ success: true, issues: reports });
      } catch (dbErr) {
        console.error('Error loading reports from DB:', dbErr.message || dbErr);
        // fallback to demoIssues below
      }
    }

    // Fallback: in dev or if DB not available, return the in-memory demoIssues list
    return res.json({
      success: true,
      issues: demoIssues.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Trending issues (analytics) - demo response
router.get('/analytics/trending', async (req, res) => {
  try {
    const { limit = 6, timeRange = 'week', sortBy = 'votes' } = req.query;

    // Demo trending items
    const trending = [
      {
        _id: 't1',
        title: 'Pothole cluster near Riverside',
        description: 'Multiple potholes forming a dangerous cluster',
        category: 'roads-transport',
        priority: 'high',
        status: 'reported',
        votes: { upvotes: 25, downvotes: 2 },
        images: [],
        location: { coordinates: [-74.006, 40.7128] },
        address: { city: 'New York' },
        tags: ['urgent', 'traffic'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 't2',
        title: 'Water leakage on 5th Ave',
        description: 'Water pipe leaking and flooding sidewalk',
        category: 'water-supply',
        priority: 'urgent',
        status: 'in-progress',
        votes: { upvotes: 18, downvotes: 1 },
        images: [],
        location: { coordinates: [-74.010, 40.710] },
        address: { city: 'New York' },
        tags: ['flooding'],
        createdAt: new Date().toISOString()
      }
    ];

    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        success: true,
        count: Math.min(trending.length, parseInt(limit)),
        data: {
          issues: trending.slice(0, parseInt(limit)),
          timeRange,
          sortBy,
          limit: parseInt(limit)
        }
      });
    }

    // Production: implement aggregation-based trending query
    res.status(501).json({ success: false, message: 'Not implemented in production' });
  } catch (error) {
    console.error('Error fetching trending issues:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get single issue by ID (demo mode will search `demoIssues`)
// --- Dev helper: list current in-memory demo issues
// Use only in development to inspect what's stored in the demo store
router.get('/debug/demo-issues', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not available in production' });
  }

  return res.json({ success: true, count: demoIssues.length, issues: demoIssues });
});

// Note: keep debug route above the '/:id' handler so it doesn't get treated as an id
// ✅ Get single issue by ID (demo mode will search `demoIssues`)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (process.env.NODE_ENV !== 'production') {
      // Not connected to production DB — running in demo mode
      console.warn('⚠️  Running in demo mode (MongoDB not used). Only demo issue IDs are available.');
      const issue = demoIssues.find(i => i._id === id);
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }
      return res.json({ success: true, data: issue });
    }

    // If DB is connected, fetch from DB
    if (mongoose.connection.readyState === 1) {
      // Validate ObjectId early to provide a clearer error
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid issue ID format' });
      }
      try {
        const report = await Report.findById(id).populate('reportedBy', 'name email');
        if (!report) return res.status(404).json({ success: false, message: 'Issue not found' });
        return res.json({ success: true, data: report });
      } catch (dbErr) {
        console.error('Error fetching report by id from DB:', dbErr.message || dbErr);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    }

    // DB not available
    res.status(503).json({ success: false, message: 'Service unavailable' });
  } catch (error) {
    console.error('Error fetching issue by id:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Create a new issue
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    // Debug logs to inspect incoming submission payload and auth
    console.log('--- POST /api/issues received ---');
    console.log('Authorization header present:', !!req.headers.authorization);
    console.log('req.user (from token):', req.user);
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('req.files count:', req.files ? req.files.length : 0);

    const { title, description, category, priority, location, address } = req.body;

    if (!title || !description || !category || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch {
        parsedLocation = { lat: 0, lng: 0 };
      }
    }

    const newIssue = {
      _id: Date.now().toString(),
      title,
      description,
      category,
      priority,
      status: 'Open',
      location: parsedLocation,
      address,
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
    };

    if (req.files && req.files.length > 0) {
      newIssue.images = req.files.map(file => ({
        data: file.buffer.toString('base64'),
        contentType: file.mimetype,
      }));
    }

    if (process.env.NODE_ENV !== 'production') {
      // Try to persist to MongoDB if connected
      let saved = null;
      if (mongoose.connection.readyState === 1) {
        try {
          const reportDoc = new Report({
            title: newIssue.title,
            description: newIssue.description,
            category: newIssue.category,
            priority: newIssue.priority,
            status: newIssue.status,
            location: {
              type: newIssue.location.type || 'Point',
              coordinates: newIssue.location.coordinates || [0, 0]
            },
            address: typeof newIssue.address === 'string' ? {} : (newIssue.address || {}),
            tags: newIssue.tags || [],
            images: newIssue.images || [],
            reportedByEmail: newIssue.createdBy || (req.user && req.user.email),
            reportedBy: req.user && req.user.id ? req.user.id : undefined
          });

          saved = await reportDoc.save();
          console.log('Saved report to MongoDB with id:', saved._id.toString());
        } catch (dbErr) {
          console.error('Error saving report to MongoDB:', dbErr.message || dbErr);
        }
      }

      // Always add to demoIssues so dev list reflects the new item even if DB save failed
      demoIssues.push(newIssue);
      console.log('New demo issue created with id:', newIssue._id);

      return res.status(201).json({
        success: true,
        message: 'Issue reported successfully!',
        issue: saved ? saved : newIssue,
      });
    }

    // In production: save to DB
    // const issue = new Issue(newIssue);
    // await issue.save();
    // res.status(201).json({ success: true, message: 'Issue reported successfully!', issue });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Vote on an issue
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type',
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        success: true,
        message: `Issue ${voteType}d successfully!`,
      });
    }

    // In production:
    // const issue = await Issue.findById(req.params.id);
    // if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    // if (voteType === 'upvote') issue.upvotes += 1;
    // else issue.downvotes += 1;
    // await issue.save();
    // res.json({ success: true, message: `Issue ${voteType}d successfully!` });
  } catch (error) {
    console.error('Error voting on issue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Add a comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const newComment = {
      _id: Date.now().toString(),
      text,
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'production') {
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully!',
        comment: newComment,
      });
    }

    // In production:
    // const issue = await Issue.findById(req.params.id);
    // if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    // issue.comments.push(newComment);
    // await issue.save();
    // res.status(201).json({ success: true, message: 'Comment added successfully!', comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
  