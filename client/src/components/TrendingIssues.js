import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, ButtonGroup, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import VotingSystem from './VotingSystem';
import { StatusBadge, PriorityBadge, CategoryBadge, getTimeAgo } from './IssueComponents';
import { getTrendingIssues, getIssues } from '../services/api';

const TrendingIssues = ({ limit = 10, showFilters = true }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // week, month, all
  const [sortBy, setSortBy] = useState('votes'); // votes, recent, controversial

  useEffect(() => {
    fetchTrendingIssues();
  }, [timeRange, sortBy]);

  const fetchTrendingIssues = async () => {
    try {
      setLoading(true);
      setError('');

      let params = { 
        limit,
        sortBy: sortBy === 'votes' ? 'votes' : sortBy === 'recent' ? 'newest' : 'controversial'
      };

      if (timeRange !== 'all') {
        params.timeRange = timeRange;
      }

      const response = await getTrendingIssues(params);
      setIssues(response.data.issues || []);
    } catch (error) {
      setError('Failed to load trending issues');
      console.error('Error fetching trending issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (issueId, voteData) => {
    setIssues(prev =>
      prev.map(issue =>
        issue._id === issueId
          ? { ...issue, votes: voteData, userVote: voteData.userVote }
          : issue
      )
    );
  };

  const getTimeRangeLabel = () => {
    const labels = {
      'week': 'This Week',
      'month': 'This Month',
      'all': 'All Time'
    };
    return labels[timeRange] || 'This Week';
  };

  const getSortLabel = () => {
    const labels = {
      'votes': 'Most Voted',
      'recent': 'Most Recent',
      'controversial': 'Most Controversial'
    };
    return labels[sortBy] || 'Most Voted';
  };

  const getNetVotes = (issue) => {
    const upvotes = issue.votes?.upvotes || 0;
    const downvotes = issue.votes?.downvotes || 0;
    return upvotes - downvotes;
  };

  const getControversyScore = (issue) => {
    const upvotes = issue.votes?.upvotes || 0;
    const downvotes = issue.votes?.downvotes || 0;
    const total = upvotes + downvotes;
    
    if (total < 5) return 0; // Need minimum votes to be controversial
    
    const ratio = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes);
    return ratio * total; // Higher score means more controversial
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading trending issues...</p>
      </div>
    );
  }

  return (
    <div className="trending-issues">
      {/* Header and Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>
            <i className="fas fa-fire text-danger me-2"></i>
            Trending Issues
          </h3>
          <p className="text-muted mb-0">
            {getSortLabel()} • {getTimeRangeLabel()}
          </p>
        </div>

        {showFilters && (
          <div className="d-flex gap-2">
            <ButtonGroup size="sm">
              <Button
                variant={timeRange === 'week' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'all' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('all')}
              >
                All Time
              </Button>
            </ButtonGroup>

            <ButtonGroup size="sm">
              <Button
                variant={sortBy === 'votes' ? 'success' : 'outline-success'}
                onClick={() => setSortBy('votes')}
              >
                <i className="fas fa-thumbs-up me-1"></i>
                Votes
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'success' : 'outline-success'}
                onClick={() => setSortBy('recent')}
              >
                <i className="fas fa-clock me-1"></i>
                Recent
              </Button>
              <Button
                variant={sortBy === 'controversial' ? 'success' : 'outline-success'}
                onClick={() => setSortBy('controversial')}
              >
                <i className="fas fa-balance-scale me-1"></i>
                Debated
              </Button>
            </ButtonGroup>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Issues List */}
      {issues.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="fas fa-vote-yea fa-3x text-muted mb-3"></i>
            <h5>No Trending Issues</h5>
            <p className="text-muted">
              No issues are trending in the selected time range.
            </p>
            <Button variant="primary" as={Link} to="/issues">
              View All Issues
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {issues.map((issue, index) => (
            <Col key={issue._id} md={12} className="mb-3">
              <Card className="h-100 trending-issue-card">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      {/* Ranking Badge */}
                      <div className="d-flex align-items-start mb-2">
                        <Badge 
                          bg={index < 3 ? 'warning' : 'secondary'} 
                          className="me-2 fs-6"
                        >
                          #{index + 1}
                        </Badge>
                        
                        <div className="flex-grow-1">
                          {/* Title and Badges */}
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                            <Link 
                              to={`/issues/${issue._id}`} 
                              className="text-decoration-none text-dark"
                            >
                              <h5 className="mb-0">{issue.title}</h5>
                            </Link>
                            
                            {sortBy === 'controversial' && getControversyScore(issue) > 10 && (
                              <Badge bg="warning">
                                <i className="fas fa-fire me-1"></i>
                                Debated
                              </Badge>
                            )}
                          </div>

                          {/* Category, Priority, Status */}
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            <CategoryBadge category={issue.category} />
                            <PriorityBadge priority={issue.priority} />
                            <StatusBadge status={issue.status} />
                          </div>

                          {/* Description */}
                          <p className="text-muted mb-2">
                            {issue.description.length > 120 
                              ? `${issue.description.substring(0, 120)}...` 
                              : issue.description
                            }
                          </p>

                          {/* Meta Info */}
                          <div className="d-flex align-items-center text-muted small">
                            <i className="fas fa-user me-1"></i>
                            <span className="me-3">{issue.reportedBy?.name || 'Anonymous'}</span>
                            
                            <i className="fas fa-clock me-1"></i>
                            <span className="me-3">{getTimeAgo(issue.createdAt)}</span>
                            
                            <i className="fas fa-map-marker-alt me-1"></i>
                            <span>{issue.address?.city}</span>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="d-flex flex-column align-items-end h-100">
                        {/* Voting System */}
                        <VotingSystem
                          issue={issue}
                          onVoteUpdate={handleVoteUpdate}
                          size="md"
                          showDetails={true}
                        />

                        {/* Stats */}
                        <div className="mt-3 text-end">
                          <div className="d-flex justify-content-end gap-3 small text-muted">
                            {issue.comments && issue.comments.length > 0 && (
                              <span>
                                <i className="fas fa-comment me-1"></i>
                                {issue.comments.length}
                              </span>
                            )}
                            
                            {issue.viewCount > 0 && (
                              <span>
                                <i className="fas fa-eye me-1"></i>
                                {issue.viewCount}
                              </span>
                            )}
                          </div>

                          {sortBy === 'votes' && (
                            <div className="mt-1">
                              <strong className={getNetVotes(issue) >= 0 ? 'text-success' : 'text-danger'}>
                                {getNetVotes(issue) > 0 ? '+' : ''}{getNetVotes(issue)} net votes
                              </strong>
                            </div>
                          )}

                          {sortBy === 'controversial' && (
                            <div className="mt-1">
                              <small className="text-warning">
                                <i className="fas fa-balance-scale me-1"></i>
                                {getControversyScore(issue).toFixed(1)} controversy score
                              </small>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="mt-auto">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            as={Link}
                            to={`/issues/${issue._id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* View More Link */}
      {issues.length >= limit && (
        <div className="text-center mt-4">
          <Button variant="outline-primary" as={Link} to="/issues">
            View All Issues
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrendingIssues;