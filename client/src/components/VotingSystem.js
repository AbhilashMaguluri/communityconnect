import React, { useState, useContext } from 'react';
import { Button, Modal, Card, Row, Col, Badge, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import { voteOnIssue } from '../services/api';

const VotingSystem = ({ 
  issue, 
  onVoteUpdate, 
  size = 'md', 
  showLabels = true, 
  showDetails = false 
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [voting, setVoting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVoteDetails, setShowVoteDetails] = useState(false);
  const [error, setError] = useState('');

  // Get user's current vote
  const userVote = issue?.userVote;
  const upvotes = issue?.votes?.upvotes || 0;
  const downvotes = issue?.votes?.downvotes || 0;
  const totalVotes = upvotes + downvotes;
  const netVotes = upvotes - downvotes;

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (voting) return;

    try {
      setVoting(true);
      setError('');

      const response = await voteOnIssue(issue._id, voteType);
      
      if (onVoteUpdate) {
        onVoteUpdate(issue._id, response.data);
      }

      // Show success feedback
      // You could add a toast notification here
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record vote');
      setTimeout(() => setError(''), 3000);
    } finally {
      setVoting(false);
    }
  };

  const getVotePercentage = (voteCount) => {
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(1);
  };

  const getButtonVariant = (voteType) => {
    if (userVote === voteType) {
      return voteType === 'up' ? 'success' : 'danger';
    }
    return `outline-${voteType === 'up' ? 'success' : 'danger'}`;
  };

  const getButtonSize = () => {
    const sizes = {
      'sm': 'sm',
      'md': '',
      'lg': 'lg'
    };
    return sizes[size] || '';
  };

  const VoteButton = ({ voteType, icon, count, label }) => {
    const tooltip = isAuthenticated 
      ? `${userVote === voteType ? 'Remove' : 'Add'} ${label.toLowerCase()}`
      : 'Login to vote';

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltip}</Tooltip>}
      >
        <Button
          variant={getButtonVariant(voteType)}
          size={getButtonSize()}
          onClick={() => handleVote(voteType)}
          disabled={voting}
          className={`vote-btn ${userVote === voteType ? 'active' : ''}`}
          style={{ minWidth: size === 'sm' ? '60px' : '80px' }}
        >
          <i className={`fas fa-${icon} ${size !== 'sm' ? 'me-1' : ''}`}></i>
          {(size !== 'sm' && showLabels) && <span className="d-none d-sm-inline">{label}</span>}
          <span className={size === 'sm' ? 'ms-1' : 'ms-2'}>{count}</span>
        </Button>
      </OverlayTrigger>
    );
  };

  if (size === 'compact') {
    return (
      <div className="d-flex align-items-center">
        <Button
          variant={getButtonVariant('up')}
          size="sm"
          onClick={() => handleVote('up')}
          disabled={voting}
          className="me-1 p-1"
        >
          <i className="fas fa-thumbs-up"></i>
        </Button>
        <span className="mx-2 fw-bold text-success">{netVotes > 0 ? `+${netVotes}` : netVotes}</span>
        <Button
          variant={getButtonVariant('down')}
          size="sm"
          onClick={() => handleVote('down')}
          disabled={voting}
          className="ms-1 p-1"
        >
          <i className="fas fa-thumbs-down"></i>
        </Button>
      </div>
    );
  }

  return (
    <div className="voting-system">
      {error && (
        <Alert variant="danger" className="mb-2 p-2">
          <small>{error}</small>
        </Alert>
      )}
      
      <div className={`d-flex ${size === 'lg' ? 'flex-column' : 'align-items-center'} gap-2`}>
        <div className={`d-flex ${size === 'lg' ? 'justify-content-center' : ''} gap-2`}>
          <VoteButton 
            voteType="up" 
            icon="thumbs-up" 
            count={upvotes} 
            label="Support" 
          />
          
          <VoteButton 
            voteType="down" 
            icon="thumbs-down" 
            count={downvotes} 
            label="Oppose" 
          />
        </div>

        {showDetails && totalVotes > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowVoteDetails(true)}
            className="text-muted p-0"
          >
            <i className="fas fa-chart-bar me-1"></i>
            View details
          </Button>
        )}

        {size === 'lg' && (
          <div className="text-center mt-2">
            <div className="fw-bold">
              Net Score: <span className={netVotes >= 0 ? 'text-success' : 'text-danger'}>
                {netVotes > 0 ? `+${netVotes}` : netVotes}
              </span>
            </div>
            <small className="text-muted">
              {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
            </small>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <i className="fas fa-vote-yea fa-3x text-primary mb-3"></i>
          <p>You need to be logged in to vote on issues.</p>
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              href="/login"
              onClick={() => setShowLoginModal(false)}
            >
              Login
            </Button>
            <Button 
              variant="outline-primary" 
              href="/register"
              onClick={() => setShowLoginModal(false)}
            >
              Sign Up
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Vote Details Modal */}
      <Modal show={showVoteDetails} onHide={() => setShowVoteDetails(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Voting Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="text-center mb-4">
            <Col>
              <Card className="border-success">
                <Card.Body>
                  <i className="fas fa-thumbs-up fa-2x text-success mb-2"></i>
                  <h4>{upvotes}</h4>
                  <small className="text-muted">Support</small>
                  <div className="progress mt-2">
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${getVotePercentage(upvotes)}%` }}
                    ></div>
                  </div>
                  <small>{getVotePercentage(upvotes)}%</small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col>
              <Card className="border-danger">
                <Card.Body>
                  <i className="fas fa-thumbs-down fa-2x text-danger mb-2"></i>
                  <h4>{downvotes}</h4>
                  <small className="text-muted">Oppose</small>
                  <div className="progress mt-2">
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${getVotePercentage(downvotes)}%` }}
                    ></div>
                  </div>
                  <small>{getVotePercentage(downvotes)}%</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center">
            <h5>Net Score</h5>
            <Badge 
              bg={netVotes >= 0 ? 'success' : 'danger'} 
              className="fs-6 p-2"
            >
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </Badge>
            <div className="mt-2">
              <small className="text-muted">
                Total: {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </small>
            </div>
          </div>

          {userVote && (
            <Alert variant="info" className="mt-3 text-center">
              <i className={`fas fa-thumbs-${userVote} me-1`}></i>
              You {userVote === 'up' ? 'support' : 'oppose'} this issue
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={() => setShowVoteDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VotingSystem;