const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.match(/image\/(jpeg|jpg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all issues
router.get('/', async (req, res) => {
  try {
    // In demo mode, return mock data
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        success: true,
        issues: [
          {
            _id: '1',
            title: 'Pothole on Main Street',
            description: 'Large pothole causing traffic issues',
            category: 'Infrastructure',
            priority: 'High',
            status: 'Open',
            location: { lat: 40.7128, lng: -74.0060 },
            address: '123 Main St, New York, NY',
            createdBy: 'admin@demo.com',
            createdAt: new Date().toISOString(),
            upvotes: 5,
            downvotes: 1,
            comments: []
          },
          {
            _id: '2',
            title: 'Broken Streetlight',
            description: 'Streetlight has been out for a week',
            category: 'Infrastructure',
            priority: 'Medium',
            status: 'In Progress',
            location: { lat: 40.7138, lng: -74.0070 },
            address: '456 Oak Ave, New York, NY',
            createdBy: 'user@demo.com',
            createdAt: new Date().toISOString(),
            upvotes: 3,
            downvotes: 0,
            comments: []
          }
        ]
      });
    }
    
    // In production, fetch from database
    // const issues = await Issue.find().sort({ createdAt: -1 });
    // res.json({ success: true, issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new issue
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, priority, location, address } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !priority) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    // Parse location if it's a string
    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        parsedLocation = { lat: 0, lng: 0 };
      }
    }
    
    // Create new issue object
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
      comments: []
    };
    
    // Handle images if uploaded
    if (req.files && req.files.length > 0) {
      newIssue.images = req.files.map(file => ({
        data: file.buffer.toString('base64'),
        contentType: file.mimetype
      }));
    }
    
    // In demo mode, just return success with the issue data
    if (process.env.NODE_ENV !== 'production') {
      return res.status(201).json({
        success: true,
        message: 'Issue reported successfully!',
        issue: newIssue
      });
    }
    
    // In production, save to database
    // const issue = new Issue(newIssue);
    // await issue.save();
    // res.status(201).json({ success: true, message: 'Issue reported successfully!', issue });
    
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Vote on an issue
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid vote type' 
      });
    }
    
    // In demo mode, just return success
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        success: true,
        message: `Issue ${voteType}d successfully!`
      });
    }
    
    // In production, update in database
    // const issue = await Issue.findById(req.params.id);
    // if (!issue) {
    //   return res.status(404).json({ success: false, message: 'Issue not found' });
    // }
    // 
    // if (voteType === 'upvote') {
    //   issue.upvotes += 1;
    // } else {
    //   issue.downvotes += 1;
    // }
    // 
    // await issue.save();
    // res.json({ success: true, message: `Issue ${voteType}d successfully!` });
    
  } catch (error) {
    console.error('Error voting on issue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add comment to an issue
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment text is required' 
      });
    }
    
    const newComment = {
      _id: Date.now().toString(),
      text,
      createdBy: req.user.email,
      createdAt: new Date().toISOString()
    };
    
    // In demo mode, just return success
    if (process.env.NODE_ENV !== 'production') {
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully!',
        comment: newComment
      });
    }
    
    // In production, update in database
    // const issue = await Issue.findById(req.params.id);
    // if (!issue) {
    //   return res.status(404).json({ success: false, message: 'Issue not found' });
    // }
    // 
    // issue.comments.push(newComment);
    // await issue.save();
    // res.status(201).json({ success: true, message: 'Comment added successfully!', comment: newComment });
    
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;