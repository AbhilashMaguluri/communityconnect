import React from 'react';
import { Badge } from 'react-bootstrap';

// Get category configuration
export const getCategoryConfig = (category) => {
  const categories = {
    'roads-transport': { icon: 'fas fa-road', color: 'primary', label: 'Roads & Transport' },
    'water-supply': { icon: 'fas fa-tint', color: 'info', label: 'Water Supply' },
    'electricity': { icon: 'fas fa-bolt', color: 'warning', label: 'Electricity' },
    'sanitation': { icon: 'fas fa-trash-alt', color: 'success', label: 'Sanitation' },
    'public-safety': { icon: 'fas fa-shield-alt', color: 'danger', label: 'Public Safety' },
    'health-services': { icon: 'fas fa-hospital', color: 'info', label: 'Health Services' },
    'education': { icon: 'fas fa-graduation-cap', color: 'primary', label: 'Education' },
    'environment': { icon: 'fas fa-leaf', color: 'success', label: 'Environment' },
    'infrastructure': { icon: 'fas fa-building', color: 'secondary', label: 'Infrastructure' },
    'other': { icon: 'fas fa-ellipsis-h', color: 'secondary', label: 'Other' }
  };
  
  return categories[category] || categories.other;
};

// Status Badge Component
export const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'reported': { variant: 'warning', label: 'Reported' },
      'in-review': { variant: 'info', label: 'In Review' },
      'in-progress': { variant: 'primary', label: 'In Progress' },
      'resolved': { variant: 'success', label: 'Resolved' },
      'closed': { variant: 'secondary', label: 'Closed' },
      'rejected': { variant: 'danger', label: 'Rejected' }
    };
    
    return configs[status] || configs.reported;
  };

  const config = getStatusConfig(status);
  
  return (
    <Badge bg={config.variant} className="me-1">
      {config.label}
    </Badge>
  );
};

// Priority Badge Component
export const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (priority) => {
    const configs = {
      'low': { variant: 'secondary', label: 'Low', icon: 'fas fa-chevron-down' },
      'medium': { variant: 'warning', label: 'Medium', icon: 'fas fa-minus' },
      'high': { variant: 'danger', label: 'High', icon: 'fas fa-chevron-up' },
      'urgent': { variant: 'danger', label: 'Urgent', icon: 'fas fa-exclamation-triangle' }
    };
    
    return configs[priority] || configs.medium;
  };

  const config = getPriorityConfig(priority);
  
  return (
    <Badge bg={config.variant} className="me-1">
      <i className={`${config.icon} me-1`}></i>
      {config.label}
    </Badge>
  );
};

// Category Badge Component
export const CategoryBadge = ({ category, showIcon = true }) => {
  const config = getCategoryConfig(category);
  
  return (
    <Badge bg={config.color} className="me-1">
      {showIcon && <i className={`${config.icon} me-1`}></i>}
      {config.label}
    </Badge>
  );
};

// Time ago utility
export const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
};

// Vote Display Component
export const VoteDisplay = ({ upvotes = 0, downvotes = 0, userVote = null, onVote, isAuthenticated = false }) => {
  const totalVotes = upvotes - downvotes;
  
  return (
    <div className="d-flex align-items-center">
      <button
        className={`vote-btn ${userVote === 'up' ? 'active text-success' : ''}`}
        onClick={() => isAuthenticated && onVote && onVote('up')}
        disabled={!isAuthenticated}
        title={isAuthenticated ? 'Upvote this issue' : 'Login to vote'}
      >
        <i className="fas fa-chevron-up"></i>
      </button>
      
      <span className={`vote-count ${totalVotes > 0 ? 'text-success' : totalVotes < 0 ? 'text-danger' : 'text-muted'}`}>
        {totalVotes > 0 ? `+${totalVotes}` : totalVotes}
      </span>
      
      <button
        className={`vote-btn ${userVote === 'down' ? 'active text-danger' : ''}`}
        onClick={() => isAuthenticated && onVote && onVote('down')}
        disabled={!isAuthenticated}
        title={isAuthenticated ? 'Downvote this issue' : 'Login to vote'}
      >
        <i className="fas fa-chevron-down"></i>
      </button>
    </div>
  );
};

// Distance Display Component
export const DistanceDisplay = ({ distance, unit = 'km' }) => {
  if (distance === undefined || distance === null) return null;
  
  const formatDistance = (dist) => {
    if (dist < 1 && unit === 'km') {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}${unit}`;
  };
  
  return (
    <small className="text-muted">
      <i className="fas fa-map-marker-alt me-1"></i>
      {formatDistance(distance)} away
    </small>
  );
};

// Image Gallery Component
export const ImageGallery = ({ images = [], maxDisplay = 3 }) => {
  if (!images || images.length === 0) return null;
  
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;
  
  return (
    <div className="row g-2 mt-2">
      {displayImages.map((image, index) => (
        <div key={index} className="col-4">
          <img
            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${image.path}`}
            alt={`Issue evidence ${index + 1}`}
            className="img-fluid rounded"
            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="col-4 d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <i className="fas fa-plus-circle fa-2x mb-1"></i>
            <div className="small">+{remainingCount} more</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  getCategoryConfig,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  getTimeAgo,
  VoteDisplay,
  DistanceDisplay,
  ImageGallery
};