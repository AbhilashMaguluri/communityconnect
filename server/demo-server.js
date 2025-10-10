const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json());

// Sample community issues data
const sampleIssues = [
  {
    id: 1,
    title: 'Major Pothole on Oak Street',
    description: 'Large pothole near the intersection of Oak Street and 5th Avenue is causing damage to vehicles. Multiple residents have reported tire damage. The pothole is approximately 3 feet wide and 8 inches deep.',
    category: 'roads-transport',
    priority: 'urgent',
    status: 'reported',
    location: { lat: 40.7128, lng: -74.0060 },
    address: 'Oak Street & 5th Avenue, New York, NY 10001',
    reportedBy: 'John Smith',
    reportedAt: '2024-10-08T10:30:00Z',
    votes: { upvotes: 24, downvotes: 1 },
    tags: ['road-damage', 'vehicle-safety', 'urgent-repair']
  },
  {
    id: 2,
    title: 'Storm Drain Blocked - Flooding Issues',
    description: 'The storm drain on Maple Avenue has been completely blocked for over a month. During recent rains, the entire street floods, making it impassable for pedestrians and causing water to enter nearby businesses.',
    category: 'water-supply',
    priority: 'high',
    status: 'in-review',
    location: { lat: 40.7140, lng: -74.0070 },
    address: '456 Maple Avenue, New York, NY 10002',
    reportedBy: 'Maria Rodriguez',
    reportedAt: '2024-10-07T14:15:00Z',
    votes: { upvotes: 18, downvotes: 0 },
    tags: ['drainage', 'flooding', 'storm-water']
  },
  {
    id: 3,
    title: 'Broken Streetlight Creating Safety Hazard',
    description: 'The streetlight at the corner of Pine Street and 2nd Avenue has been out for 3 weeks. This area is poorly lit at night, creating safety concerns for residents walking home from the subway station.',
    category: 'electricity',
    priority: 'high',
    status: 'reported',
    location: { lat: 40.7110, lng: -74.0050 },
    address: 'Pine Street & 2nd Avenue, New York, NY 10003',
    reportedBy: 'David Chen',
    reportedAt: '2024-10-06T19:45:00Z',
    votes: { upvotes: 15, downvotes: 2 },
    tags: ['lighting', 'safety', 'pedestrian-safety']
  },
  {
    id: 4,
    title: 'Overflowing Garbage Bins Attracting Pests',
    description: 'The garbage bins on Central Park North have been overflowing for days. This is attracting rats and creating unsanitary conditions. The smell is becoming unbearable for nearby residents.',
    category: 'sanitation',
    priority: 'medium',
    status: 'reported',
    location: { lat: 40.7100, lng: -74.0040 },
    address: '789 Central Park North, New York, NY 10025',
    reportedBy: 'Sarah Johnson',
    reportedAt: '2024-10-09T08:20:00Z',
    votes: { upvotes: 12, downvotes: 3 },
    tags: ['waste-management', 'sanitation', 'pest-control']
  },
  {
    id: 5,
    title: 'Sidewalk Completely Cracked and Dangerous',
    description: 'The sidewalk in front of the community center has multiple large cracks and raised sections. Several elderly residents have tripped and fallen. This poses a serious liability issue for the city.',
    category: 'infrastructure',
    priority: 'high',
    status: 'in-progress',
    location: { lat: 40.7090, lng: -74.0030 },
    address: '321 Community Center Drive, New York, NY 10004',
    reportedBy: 'Robert Wilson',
    reportedAt: '2024-10-05T16:30:00Z',
    votes: { upvotes: 22, downvotes: 1 },
    tags: ['sidewalk', 'accessibility', 'elderly-safety']
  },
  {
    id: 6,
    title: 'Park Playground Equipment Broken',
    description: 'Several pieces of playground equipment in Washington Park are broken or unsafe. The swing set has a broken chain, the slide has sharp edges, and the seesaw is completely detached.',
    category: 'infrastructure',
    priority: 'medium',
    status: 'reported',
    location: { lat: 40.7080, lng: -74.0020 },
    address: 'Washington Park Playground, New York, NY 10005',
    reportedBy: 'Lisa Thompson',
    reportedAt: '2024-10-08T11:15:00Z',
    votes: { upvotes: 19, downvotes: 0 },
    tags: ['playground', 'children-safety', 'park-maintenance']
  },
  {
    id: 7,
    title: 'Traffic Light Malfunction Causing Accidents',
    description: 'The traffic light at Broadway and Main Street is stuck on red in all directions, causing confusion and near-accidents. Drivers are treating it as a 4-way stop but many are not aware of proper protocol.',
    category: 'roads-transport',
    priority: 'urgent',
    status: 'reported',
    location: { lat: 40.7070, lng: -74.0010 },
    address: 'Broadway & Main Street, New York, NY 10006',
    reportedBy: 'Michael Brown',
    reportedAt: '2024-10-09T07:45:00Z',
    votes: { upvotes: 31, downvotes: 0 },
    tags: ['traffic-safety', 'intersection', 'signal-malfunction']
  },
  {
    id: 8,
    title: 'Water Main Break Flooding Street',
    description: 'A water main has burst on Elm Street, causing significant flooding. Water is rushing down the street and several basements have been flooded. City water pressure is affected in the area.',
    category: 'water-supply',
    priority: 'urgent',
    status: 'in-progress',
    location: { lat: 40.7060, lng: -74.0000 },
    address: '123 Elm Street, New York, NY 10007',
    reportedBy: 'Jennifer Davis',
    reportedAt: '2024-10-09T12:00:00Z',
    votes: { upvotes: 28, downvotes: 0 },
    tags: ['water-main', 'flooding', 'emergency']
  },
  {
    id: 9,
    title: 'Graffiti Vandalism on Public Library',
    description: 'Extensive graffiti has been spray-painted on the exterior walls of the public library. This defaces a historic building and creates a negative impression of our community.',
    category: 'public-safety',
    priority: 'low',
    status: 'reported',
    location: { lat: 40.7050, lng: -73.9990 },
    address: '456 Library Avenue, New York, NY 10008',
    reportedBy: 'Thomas Anderson',
    reportedAt: '2024-10-07T20:30:00Z',
    votes: { upvotes: 8, downvotes: 5 },
    tags: ['vandalism', 'graffiti', 'historic-building']
  },
  {
    id: 10,
    title: 'Bus Stop Shelter Damaged by Storm',
    description: 'The bus shelter on River Road was damaged during last week\'s storm. The roof is partially collapsed and broken glass is scattered around the area, making it unsafe for commuters.',
    category: 'infrastructure',
    priority: 'medium',
    status: 'resolved',
    location: { lat: 40.7040, lng: -73.9980 },
    address: 'River Road Bus Stop, New York, NY 10009',
    reportedBy: 'Amanda Clark',
    reportedAt: '2024-10-04T09:00:00Z',
    resolvedAt: '2024-10-08T15:30:00Z',
    votes: { upvotes: 14, downvotes: 1 },
    tags: ['bus-shelter', 'storm-damage', 'public-transport']
  }
];

// Sample user data
const sampleUsers = [
  {
    id: 1,
    name: 'Demo Admin',
    email: 'admin@demo.com',
    role: 'admin'
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john@demo.com',
    role: 'user'
  }
];

// Routes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Community Connect Backend API is working!',
    timestamp: new Date().toISOString(),
    cors: 'Enabled for localhost:3000 and localhost:8080',
    sampleDataAvailable: true
  });
});

app.get('/api/issues', (req, res) => {
  res.json({
    success: true,
    count: sampleIssues.length,
    totalPages: 1,
    currentPage: 1,
    total: sampleIssues.length,
    data: sampleIssues
  });
});

app.get('/api/issues/:id', (req, res) => {
  const issueId = parseInt(req.params.id);
  const issue = sampleIssues.find(issue => issue.id === issueId);
  
  if (!issue) {
    return res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }
  
  res.json({
    success: true,
    data: issue
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@demo.com' && password === 'demo123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'demo-jwt-token-admin',
      user: sampleUsers[0]
    });
  } else if (email === 'john@demo.com' && password === 'demo123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'demo-jwt-token-user',
      user: sampleUsers[1]
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  const newUser = {
    id: sampleUsers.length + 1,
    name,
    email,
    role: 'user'
  };
  
  sampleUsers.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token: `demo-jwt-token-${newUser.id}`,
    user: newUser
  });
});

app.post('/api/issues', (req, res) => {
  const newIssue = {
    id: sampleIssues.length + 1,
    ...req.body,
    reportedAt: new Date().toISOString(),
    status: 'reported',
    votes: { upvotes: 0, downvotes: 0 }
  };
  
  sampleIssues.push(newIssue);
  
  res.status(201).json({
    success: true,
    message: 'Issue created successfully',
    data: newIssue
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🎯 Community Connect Demo Server Started!');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: demo mode with sample data`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log('');
  console.log('📋 Available Sample Issues:');
  sampleIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.title} (${issue.priority} priority)`);
  });
  console.log('');
  console.log('👤 Demo Login Credentials:');
  console.log('   Admin: admin@demo.com / demo123');
  console.log('   User:  john@demo.com / demo123');
  console.log('');
  console.log('🧪 Test the API at: http://localhost:5000/api/test');
});

module.exports = app;