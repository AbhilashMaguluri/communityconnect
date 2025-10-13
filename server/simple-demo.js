const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

// Configure multer for file uploads (in-memory for demo)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample data
let users = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin'
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'user@demo.com',
    role: 'user'
  }
];

let issues = [
  {
    _id: '1',
    title: 'Broken Street Light on Main Street',
    description: 'The street light has been out for 3 days, creating safety concerns.',
    category: 'roads-transport',
    priority: 'high',
    status: 'reported',
    location: { type: 'Point', coordinates: [-74.006, 40.7128] },
    address: { street: '123 Main Street', city: 'New York', state: 'NY' },
    votes: { upvotes: 15, downvotes: 2 },
    reportedBy: '2',
    createdAt: new Date()
  }
];

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    req.user = users[0]; // Demo: always authenticate as first user
  }
  next();
};

// Routes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Community Connect API - Demo Mode (No Database Required)',
    timestamp: new Date().toISOString()
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

app.get('/api/issues', (req, res) => {
  res.json({
    success: true,
    count: issues.length,
    data: {
      issues: issues
    }
  });
});

app.post('/api/issues', authenticate, upload.array('images', 5), (req, res) => {
  try {
    console.log('Creating issue with data:', {
      body: req.body,
      files: req.files?.length || 0
    });

    // Parse location from FormData
    let location = { type: 'Point', coordinates: [0, 0] };
    if (req.body['location[coordinates][0]'] && req.body['location[coordinates][1]']) {
      location.coordinates = [
        parseFloat(req.body['location[coordinates][0]']),
        parseFloat(req.body['location[coordinates][1]'])
      ];
    }

    // Parse address from FormData
    const address = {};
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('address[')) {
        const field = key.slice(8, -1);
        address[field] = req.body[key];
      }
    });

    const newIssue = {
      _id: String(issues.length + 1),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'medium',
      location: location,
      address: address,
      status: 'reported',
      votes: { upvotes: 0, downvotes: 0 },
      reportedBy: req.user._id,
      createdAt: new Date()
    };

    issues.push(newIssue);
    
    console.log('Issue created successfully:', newIssue._id);
    
    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: newIssue
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create issue'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Community Connect Demo Server Started!');
  console.log(`📱 Server running on port ${PORT}`);
  console.log(`🎯 Demo Mode - No Database Required`);
  console.log(`👤 Login: admin@demo.com / demo123`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});

module.exports = app;