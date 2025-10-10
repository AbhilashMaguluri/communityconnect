const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory storage for demo (replace with database in production)
let users = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@demo.com',
    password: '$2a$10$example', // This would be hashed in real app
    role: 'admin',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: '2', 
    name: 'John Doe',
    email: 'user@demo.com',
    password: '$2a$10$example',
    role: 'user',
    isActive: true,
    createdAt: new Date()
  }
];

let issues = [
  {
    _id: '1',
    title: 'Broken Street Light on Main Street',
    description: 'The street light has been out for 3 days, creating safety concerns for pedestrians.',
    category: 'Street Lighting',
    priority: 'high',
    status: 'open',
    votes: { upvotes: 15, downvotes: 2, users: [], userVotes: [] },
    images: [],
    location: {
      type: 'Point',
      coordinates: [-74.006, 40.7128]
    },
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    reportedBy: '2',
    tags: ['lighting', 'safety'],
    comments: [],
    viewCount: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: 'Pothole on Oak Avenue',
    description: 'Large pothole causing damage to vehicles. Needs immediate repair.',
    category: 'Road Maintenance', 
    priority: 'critical',
    status: 'in-progress',
    votes: { upvotes: 23, downvotes: 1, users: [], userVotes: [] },
    images: [],
    location: {
      type: 'Point',
      coordinates: [-74.005, 40.7120]
    },
    address: {
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002'
    },
    reportedBy: '2',
    tags: ['road', 'emergency'],
    comments: [],
    viewCount: 78,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

// Demo routes
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      user: users[1] // Return demo user
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user) {
    res.json({
      success: true,
      data: {
        user,
        token: 'demo-jwt-token-12345'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const newUser = {
    _id: String(users.length + 1),
    name,
    email,
    password: '$2a$10$example',
    role: 'user',
    isActive: true,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    data: {
      user: newUser,
      token: 'demo-jwt-token-12345'
    }
  });
});

app.get('/api/issues', (req, res) => {
  res.json({
    success: true,
    count: issues.length,
    data: {
      issues: issues.map(issue => ({
        ...issue,
        reportedBy: users.find(u => u._id === issue.reportedBy)
      }))
    }
  });
});

app.get('/api/issues/analytics/trending', (req, res) => {
  const { limit = 10, timeRange = 'week', sortBy = 'votes' } = req.query;
  
  let sortedIssues = [...issues];
  
  if (sortBy === 'votes') {
    sortedIssues.sort((a, b) => (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes));
  } else if (sortBy === 'recent') {
    sortedIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  const trendingIssues = sortedIssues.slice(0, parseInt(limit)).map(issue => ({
    ...issue,
    reportedBy: users.find(u => u._id === issue.reportedBy)
  }));
  
  res.json({
    success: true,
    count: trendingIssues.length,
    data: {
      issues: trendingIssues,
      timeRange,
      sortBy,
      limit: parseInt(limit)
    }
  });
});

app.get('/api/issues/:id', (req, res) => {
  const issue = issues.find(i => i._id === req.params.id);
  if (issue) {
    res.json({
      success: true,
      data: {
        issue: {
          ...issue,
          reportedBy: users.find(u => u._id === issue.reportedBy)
        }
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }
});

app.post('/api/issues', (req, res) => {
  const newIssue = {
    _id: String(issues.length + 1),
    ...req.body,
    votes: { upvotes: 0, downvotes: 0, users: [], userVotes: [] },
    images: req.files ? req.files.map(f => f.filename) : [],
    reportedBy: '2', // Demo user
    comments: [],
    viewCount: 0,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  issues.push(newIssue);
  
  res.status(201).json({
    success: true,
    data: {
      issue: newIssue
    }
  });
});

app.post('/api/issues/:id/vote', (req, res) => {
  const { voteType } = req.body;
  const issue = issues.find(i => i._id === req.params.id);
  
  if (issue) {
    if (voteType === 'up') {
      issue.votes.upvotes += 1;
    } else if (voteType === 'down') {
      issue.votes.downvotes += 1;
    }
    
    res.json({
      success: true,
      data: issue.votes
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }
});

app.get('/api/users/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalIssues: issues.length,
      openIssues: issues.filter(i => i.status === 'open').length,
      resolvedIssues: issues.filter(i => i.status === 'resolved').length,
      inProgressIssues: issues.filter(i => i.status === 'in-progress').length
    }
  });
});

// Catch all handler
app.get('*', (req, res) => {
  res.json({
    success: true,
    message: 'Community Connect API - Demo Mode (No Database Required)',
    endpoints: [
      'GET /api/issues - Get all issues',
      'GET /api/issues/:id - Get single issue',
      'POST /api/auth/login - Login user',
      'POST /api/auth/register - Register user',
      'GET /api/issues/analytics/trending - Get trending issues'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🎯 Demo Mode: No database required!`);
  console.log(`👤 Demo Login: admin@demo.com / any password`);
});

module.exports = app;