const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Issue = require('./models/Issue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: {
          street: '123 Admin Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        name: 'John Doe',
        email: 'user@demo.com',
        password: hashedPassword,
        role: 'user',
        phone: '9876543210',
        address: {
          street: '456 User Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@demo.com',
        password: hashedPassword,
        role: 'user',
        phone: '1122334455',
        address: {
          street: '789 Community Road',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          country: 'USA'
        }
      }
    ]);

    console.log(`👥 Created ${users.length} users`);

    // Create sample issues
    const issues = await Issue.insertMany([
      {
        title: 'Broken Street Light on Main Street',
        description: 'The street light at the intersection of Main Street and 5th Avenue has been out for over a week. This creates safety concerns for pedestrians and drivers, especially during evening hours.',
        category: 'electricity',
        priority: 'high',
        status: 'reported',
        reportedBy: users[1]._id,
        votes: {
          upvotes: 15,
          downvotes: 2,
          users: [],
          userVotes: []
        },
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128]
        },
        address: {
          street: 'Main Street & 5th Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        tags: ['lighting', 'safety', 'intersection'],
        viewCount: 45
      },
      {
        title: 'Large Pothole on Oak Avenue',
        description: 'There is a significant pothole on Oak Avenue that is causing damage to vehicles. Multiple cars have reported tire damage from this pothole. It needs immediate repair.',
        category: 'roads-transport',
        priority: 'urgent',
        status: 'in-progress',
        reportedBy: users[2]._id,
        votes: {
          upvotes: 28,
          downvotes: 1,
          users: [],
          userVotes: []
        },
        location: {
          type: 'Point',
          coordinates: [-74.0050, 40.7120]
        },
        address: {
          street: '456 Oak Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA'
        },
        tags: ['road', 'emergency', 'vehicle-damage'],
        viewCount: 78,
        assignedTo: users[0]._id
      },
      {
        title: 'Overflowing Trash Bins in Central Park',
        description: 'The trash bins near the central park playground are consistently overflowing, creating unsanitary conditions and attracting pests.',
        category: 'sanitation',
        priority: 'medium',
        status: 'reported',
        reportedBy: users[1]._id,
        votes: {
          upvotes: 12,
          downvotes: 3,
          users: [],
          userVotes: []
        },
        location: {
          type: 'Point',
          coordinates: [-74.0040, 40.7110]
        },
        address: {
          street: 'Central Park Playground',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          country: 'USA'
        },
        tags: ['sanitation', 'park', 'health'],
        viewCount: 32
      },
      {
        title: 'Water Leak at Community Center',
        description: 'There is a significant water leak in the community center basement that has been ongoing for several days. This could lead to structural damage if not addressed soon.',
        category: 'water-supply',
        priority: 'high',
        status: 'in-review',
        reportedBy: users[2]._id,
        votes: {
          upvotes: 19,
          downvotes: 0,
          users: [],
          userVotes: []
        },
        location: {
          type: 'Point',
          coordinates: [-74.0070, 40.7140]
        },
        address: {
          street: '789 Community Center Drive',
          city: 'New York',
          state: 'NY',
          zipCode: '10004',
          country: 'USA'
        },
        tags: ['water', 'building', 'emergency'],
        viewCount: 56,
        assignedTo: users[0]._id
      },
      {
        title: 'Graffiti on Public Building',
        description: 'Extensive graffiti has appeared on the side of the public library building. This impacts the appearance of our community and should be cleaned.',
        category: 'public-safety',
        priority: 'low',
        status: 'resolved',
        reportedBy: users[1]._id,
        votes: {
          upvotes: 8,
          downvotes: 5,
          users: [],
          userVotes: []
        },
        location: {
          type: 'Point',
          coordinates: [-74.0080, 40.7150]
        },
        address: {
          street: '123 Library Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10005',
          country: 'USA'
        },
        tags: ['vandalism', 'cleaning', 'aesthetics'],
        viewCount: 23,
        assignedTo: users[0]._id,
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Resolved yesterday
      }
    ]);

    console.log(`📋 Created ${issues.length} issues`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n🎯 Sample Login Credentials:');
    console.log('👑 Admin: admin@demo.com / password123');
    console.log('👤 User1: user@demo.com / password123');
    console.log('👤 User2: jane@demo.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();