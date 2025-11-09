import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import { 
  StatusBadge, 
  PriorityBadge, 
  CategoryBadge, 
  getTimeAgo, 
  ImageGallery
} from '../components/IssueComponents';
import VotingSystem from '../components/VotingSystem';
import { getIssue, voteOnIssue, addComment, deleteIssue, updateIssueStatus } from '../services/api';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Comment form
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Admin actions
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await getIssue(id);
      // Server sometimes returns { success: true, data: issue } or { success: true, issue }
      // Be defensive: accept either shape and also fallback to the whole body
      const body = response?.data;
      const issuePayload = body?.data || body?.issue || body || null;
      setIssue(issuePayload);
    } catch (error) {
      setError('Failed to load issue details. Please try again.');
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (issueId, voteData) => {
    setIssue(prev => ({
      ...prev,
      votes: voteData,
      userVote: voteData.userVote
    }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await addComment(id, { text: newComment });
      
      setIssue(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data.comment]
      }));
      
      setNewComment('');
      setSuccess('Comment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add comment. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      const response = await updateIssueStatus(id, {
        status: newStatus,
        comment: statusComment
      });
      
      setIssue(prev => ({
        ...prev,
        status: newStatus,
        statusHistory: response.data.statusHistory,
        comments: response.data.comments
      }));
      
      setShowStatusModal(false);
      setNewStatus('');
      setStatusComment('');
      setSuccess('Issue status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update issue status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteIssue = async () => {
    try {
      await deleteIssue(id);
      setSuccess('Issue deleted successfully!');
      setTimeout(() => {
        navigate('/issues');
      }, 2000);
    } catch (error) {
      setError('Failed to delete issue. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
    setShowDeleteModal(false);
  };

  const canEditIssue = () => {
    return user && (user.role === 'admin' || user.id === issue?.reportedBy?._id);
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'danger',
      'In Progress': 'warning',
      'Under Review': 'info',
      'Resolved': 'success',
      'Closed': 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'danger',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success'
    };
    return colors[priority] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading issue details...</p>
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Issue Not Found</Alert.Heading>
          <p>The issue you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline-danger" onClick={() => navigate('/issues')}>
            Back to Issues
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Button variant="link" className="p-0" onClick={() => navigate('/issues')}>
              Issues
            </Button>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {issue.title}
          </li>
        </ol>
      </nav>

      <Row>
        {/* Main Content */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-start">
              <div className="d-flex flex-wrap gap-2">
                <CategoryBadge category={issue.category} />
                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />
              </div>
              
              {canEditIssue() && (
                <div className="d-flex gap-2">
                  {isAdmin() && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowStatusModal(true)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Update Status
                    </Button>
                  )}
                  
                  {(isAdmin() || user.id === issue.reportedBy?._id) && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </Card.Header>
            
            <Card.Body>
              {/* Title */}
              <h2 className="mb-3">{issue.title}</h2>
              
              {/* Description */}
              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {issue.description}
                </p>
              </div>

              {/* Images */}
              {issue.images && issue.images.length > 0 && (
                <div className="mb-4">
                  <h5>Images</h5>
                  <ImageGallery images={issue.images} />
                </div>
              )}

              {/* Location */}
              <div className="mb-4">
                <h5>Location</h5>
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-map-marker-alt text-danger me-2"></i>
                  <span>
                    {issue.address?.street && `${issue.address.street}, `}
                    {issue.address?.area && `${issue.address.area}, `}
                    {issue.address?.city}
                    {issue.address?.state && `, ${issue.address.state}`}
                    {issue.address?.zipCode && ` - ${issue.address.zipCode}`}
                  </span>
                </div>
                
                {issue.location?.coordinates && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Coordinates: {issue.location.coordinates[1].toFixed(6)}, {issue.location.coordinates[0].toFixed(6)}
                    </small>
                  </div>
                )}

                {/* Map placeholder */}
                <div 
                  className="mt-3 bg-light d-flex align-items-center justify-content-center"
                  style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}
                >
                  <p className="text-muted mb-0">Interactive map coming soon...</p>
                </div>
              </div>

              {/* Voting */}
              <div className="mb-4">
                <h5>Community Support</h5>
                <VotingSystem
                  issue={issue}
                  onVoteUpdate={handleVoteUpdate}
                  size="lg"
                  showDetails={true}
                />
              </div>
            </Card.Body>
          </Card>

          {/* Comments Section */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-comments me-2"></i>
                Comments ({issue.comments?.length || 0})
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Add Comment Form */}
              {isAuthenticated && (
                <Form onSubmit={handleAddComment} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Add a comment</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts, ask questions, or provide updates..."
                      required
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-comment me-1"></i>
                        Post Comment
                      </>
                    )}
                  </Button>
                </Form>
              )}

              {/* Comments List */}
              {issue.comments && issue.comments.length > 0 ? (
                <div className="comments-list">
                  {issue.comments.map((comment, index) => (
                    <div key={comment._id || index} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <strong>{comment.user?.name || 'Anonymous'}</strong>
                            {comment.user?.role === 'admin' && (
                              <Badge bg="primary" className="ms-2">Admin</Badge>
                            )}
                          </div>
                        </div>
                        <small className="text-muted">{getTimeAgo(comment.createdAt)}</small>
                      </div>
                      <p className="mb-0 ms-5" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-comment fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Issue Details</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Reported by:</strong>
                <div className="mt-1">
                  <i className="fas fa-user me-2"></i>
                  {issue.reportedBy?.name || 'Anonymous'}
                  {issue.reportedBy?.role === 'admin' && (
                    <Badge bg="primary" className="ms-2">Admin</Badge>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <strong>Reported on:</strong>
                <div className="mt-1">
                  <i className="fas fa-calendar me-2"></i>
                  {new Date(issue.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {issue.updatedAt !== issue.createdAt && (
                <div className="mb-3">
                  <strong>Last updated:</strong>
                  <div className="mt-1">
                    <i className="fas fa-clock me-2"></i>
                    {getTimeAgo(issue.updatedAt)}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <strong>Issue ID:</strong>
                <div className="mt-1">
                  <code>{issue._id}</code>
                </div>
              </div>

              <div className="mb-3">
                <strong>Views:</strong>
                <div className="mt-1">
                  <i className="fas fa-eye me-2"></i>
                  {issue.viewCount || 0} views
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Status History */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <Card>
              <Card.Header>
                <h6 className="mb-0">Status History</h6>
              </Card.Header>
              <Card.Body>
                {issue.statusHistory.map((entry, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Badge bg={getStatusColor(entry.status)}>{entry.status}</Badge>
                      <small className="text-muted">{getTimeAgo(entry.timestamp)}</small>
                    </div>
                    {entry.comment && (
                      <p className="small text-muted mb-0">{entry.comment}</p>
                    )}
                    <small className="text-muted">by {entry.updatedBy?.name || 'System'}</small>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Issue Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                <option value="">Select new status...</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Update Comment (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add a comment about this status change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStatusUpdate}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this issue? This action cannot be undone.</p>
          <Alert variant="warning">
            <strong>Warning:</strong> All comments and associated data will also be deleted.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteIssue}>
            Delete Issue
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IssueDetail;