import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  StatusBadge, 
  PriorityBadge, 
  CategoryBadge, 
  getTimeAgo, 
  DistanceDisplay,
  ImageGallery
} from './IssueComponents';
import VotingSystem from './VotingSystem';

const IssueCard = ({ 
  issue, 
  onVoteUpdate, 
  showDistance = false,
  userLocation = null 
}) => {
  // Calculate distance if user location is available
  const calculateDistance = () => {
    if (!userLocation || !issue.location?.coordinates) return null;
    
    const [issueLng, issueLat] = issue.location.coordinates;
    const { latitude: userLat, longitude: userLng } = userLocation;
    
    const R = 6371; // Earth's radius in km
    const dLat = (issueLat - userLat) * Math.PI / 180;
    const dLng = (issueLng - userLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(issueLat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distance = showDistance ? calculateDistance() : null;

  return (
    <Card className="h-100 issue-card fade-in">
      <Card.Body className="d-flex flex-column">
        {/* Header with badges */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex flex-wrap gap-1">
            <CategoryBadge category={issue.category} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Title */}
        <Card.Title className="mb-2">
          <Link 
            to={`/issues/${issue._id}`} 
            className="text-decoration-none text-dark"
          >
            {issue.title}
          </Link>
        </Card.Title>

        {/* Description */}
        <Card.Text className="text-muted flex-grow-1">
          {issue.description.length > 120 
            ? `${issue.description.substring(0, 120)}...` 
            : issue.description
          }
        </Card.Text>

        {/* Images */}
        {issue.images && issue.images.length > 0 && (
          <ImageGallery images={issue.images} maxDisplay={3} />
        )}

        {/* Location */}
        <div className="mt-2 mb-2">
          <small className="text-muted">
            <i className="fas fa-map-marker-alt me-1"></i>
            {issue.address?.area && `${issue.address.area}, `}
            {issue.address?.city}
            {issue.address?.state && `, ${issue.address.state}`}
          </small>
          {distance && (
            <div>
              <DistanceDisplay distance={distance} />
            </div>
          )}
        </div>

        {/* Footer */}
        <Row className="align-items-center mt-auto pt-2 border-top">
          <Col xs={8}>
            <div className="d-flex align-items-center flex-wrap gap-3">
              {issue.comments && issue.comments.length > 0 && (
                <span className="text-muted small">
                  <i className="fas fa-comment me-1"></i>
                  {issue.comments.length}
                </span>
              )}

              {issue.viewCount > 0 && (
                <span className="text-muted small">
                  <i className="fas fa-eye me-1"></i>
                  {issue.viewCount}
                </span>
              )}

              <small className="text-muted">
                by {issue.reportedBy?.name || 'Anonymous'}
              </small>
              
              <small className="text-muted">
                <i className="fas fa-clock me-1"></i>
                {getTimeAgo(issue.createdAt)}
              </small>
            </div>
          </Col>
          <Col xs={4} className="text-end">
            <VotingSystem
              issue={issue}
              onVoteUpdate={onVoteUpdate}
              size="sm"
              showDetails={false}
            />
          </Col>
        </Row>

        {/* Action buttons */}
        <div className="mt-2">
          <Link to={`/issues/${issue._id}`}>
            <Button variant="outline-primary" size="sm" className="w-100">
              <i className="fas fa-eye me-1"></i>
              View Details
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default IssueCard;