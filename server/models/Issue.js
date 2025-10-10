const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an issue title'],
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an issue description'],
    maxLength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: [
        'roads-transport', 
        'water-supply', 
        'electricity', 
        'sanitation', 
        'public-safety', 
        'health-services', 
        'education', 
        'environment', 
        'infrastructure', 
        'other'
      ],
      message: 'Please select a valid category'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'in-review', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'reported'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please provide location coordinates'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Invalid coordinates provided'
      }
    }
  },
  address: {
    street: String,
    area: String,
    city: {
      type: String,
      required: [true, 'Please provide city name']
    },
    state: String,
    pincode: String,
    landmark: String
  },
  images: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    voters: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      voteType: {
        type: String,
        enum: ['up', 'down']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxLength: [500, 'Comment cannot be more than 500 characters']
    },
    isOfficial: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['reported', 'in-review', 'in-progress', 'resolved', 'closed', 'rejected']
    },
    changedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    comment: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedResolutionDate: {
    type: Date,
    default: null
  },
  actualResolutionDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
issueSchema.index({ location: '2dsphere' }); // Geospatial index for location queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, priority: -1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ 'votes.upvotes': -1 }); // For sorting by popularity

// Virtual for total votes
issueSchema.virtual('totalVotes').get(function() {
  return this.votes.upvotes - this.votes.downvotes;
});

// Virtual for days since reported
issueSchema.virtual('daysSinceReported').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if user has voted
issueSchema.methods.hasUserVoted = function(userId) {
  return this.votes.voters.find(voter => 
    voter.user.toString() === userId.toString()
  );
};

// Method to add vote
issueSchema.methods.addVote = function(userId, voteType) {
  const existingVote = this.hasUserVoted(userId);
  
  if (existingVote) {
    if (existingVote.voteType === voteType) {
      return { success: false, message: 'User has already voted' };
    }
    // Change vote type
    if (existingVote.voteType === 'up') {
      this.votes.upvotes--;
      this.votes.downvotes++;
    } else {
      this.votes.downvotes--;
      this.votes.upvotes++;
    }
    existingVote.voteType = voteType;
  } else {
    // New vote
    if (voteType === 'up') {
      this.votes.upvotes++;
    } else {
      this.votes.downvotes++;
    }
    this.votes.voters.push({
      user: userId,
      voteType: voteType
    });
  }
  
  return { success: true, message: 'Vote updated successfully' };
};

// Method to update status with history
issueSchema.methods.updateStatus = function(newStatus, changedBy, comment = '') {
  this.statusHistory.push({
    status: this.status,
    changedBy: changedBy,
    comment: comment
  });
  
  this.status = newStatus;
  
  // Set resolution date if resolved
  if (newStatus === 'resolved' && !this.actualResolutionDate) {
    this.actualResolutionDate = new Date();
  }
};

module.exports = mongoose.model('Issue', issueSchema);