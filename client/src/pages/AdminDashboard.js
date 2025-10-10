import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge, getTimeAgo } from '../components/IssueComponents';
import { getIssues, updateIssueStatus, deleteIssue, getDashboardStats } from '../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    totalUsers: 0,
    issuesByCategory: [],
    recentIssues: []
  });
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Bulk actions
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');

  // Individual issue actions
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  const categories = [
    'Road Maintenance', 'Street Lighting', 'Waste Management', 'Water Supply',
    'Public Safety', 'Traffic', 'Parks & Recreation', 'Noise Complaint',
    'Public Transport', 'Other'
  ];

  const statuses = ['Open', 'In Progress', 'Under Review', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    fetchDashboardData();
    fetchAllIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, statusFilter, priorityFilter, categoryFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchAllIssues = async () => {
    try {
      setLoading(true);
      const response = await getIssues();
      setIssues(response.data.issues || []);
    } catch (error) {
      setError('Failed to load issues. Please try again.');
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // Sort by priority and then by date
    filtered.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredIssues(filtered);
  };

  const handleStatusUpdate = async (issueId, status, comment = '') => {
    try {
      await updateIssueStatus(issueId, { status, comment });
      
      // Update local state
      setIssues(prev => 
        prev.map(issue => 
          issue._id === issueId 
            ? { ...issue, status, updatedAt: new Date().toISOString() }
            : issue
        )
      );
      
      setSuccess(`Issue status updated to ${status}`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh stats
      fetchDashboardData();
    } catch (error) {
      setError('Failed to update issue status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIssues.length === 0) return;

    try {
      for (const issueId of selectedIssues) {
        await updateIssueStatus(issueId, { status: bulkStatus });
      }
      
      // Update local state
      setIssues(prev => 
        prev.map(issue => 
          selectedIssues.includes(issue._id)
            ? { ...issue, status: bulkStatus, updatedAt: new Date().toISOString() }
            : issue
        )
      );
      
      setSelectedIssues([]);
      setShowBulkModal(false);
      setBulkStatus('');
      setSuccess(`Updated ${selectedIssues.length} issues to ${bulkStatus}`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh stats
      fetchDashboardData();
    } catch (error) {
      setError('Failed to perform bulk update');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteIssue(issueId);
      setIssues(prev => prev.filter(issue => issue._id !== issueId));
      setSuccess('Issue deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh stats
      fetchDashboardData();
    } catch (error) {
      setError('Failed to delete issue');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleIssueSelect = (issueId) => {
    setSelectedIssues(prev => 
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIssues(
      selectedIssues.length === filteredIssues.length
        ? []
        : filteredIssues.map(issue => issue._id)
    );
  };

  const openStatusModal = (issue) => {
    setCurrentIssue(issue);
    setNewStatus(issue.status);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const handleModalStatusUpdate = async () => {
    if (!currentIssue || !newStatus) return;

    await handleStatusUpdate(currentIssue._id, newStatus, statusComment);
    setShowStatusModal(false);
    setCurrentIssue(null);
    setNewStatus('');
    setStatusComment('');
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
        <p className="mt-2">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Dashboard Header */}
      <Row className="mb-4">
        <Col>
          <h1>
            <i className="fas fa-tachometer-alt me-2"></i>
            Admin Dashboard
          </h1>
          <p className="text-muted">Manage community issues and monitor system activity</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.totalIssues}</h4>
                  <p className="mb-0">Total Issues</p>
                </div>
                <div>
                  <i className="fas fa-exclamation-triangle fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="bg-danger text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.openIssues}</h4>
                  <p className="mb-0">Open Issues</p>
                </div>
                <div>
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.resolvedIssues}</h4>
                  <p className="mb-0">Resolved Issues</p>
                </div>
                <div>
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.totalUsers}</h4>
                  <p className="mb-0">Total Users</p>
                </div>
                <div>
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Issue Management</h5>
            </Col>
            <Col xs="auto">
              {selectedIssues.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowBulkModal(true)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Bulk Actions ({selectedIssues.length})
                </Button>
              )}
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Status Filter</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Priority Filter</Form.Label>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Category Filter</Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                }}
              >
                <i className="fas fa-times me-1"></i>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Issues Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th width="40">
                    <Form.Check
                      type="checkbox"
                      checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Created</th>
                  <th>Votes</th>
                  <th width="180">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <i className="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                      <p className="text-muted mb-0">No issues found with current filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map(issue => (
                    <tr key={issue._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedIssues.includes(issue._id)}
                          onChange={() => handleIssueSelect(issue._id)}
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{issue.title}</strong>
                          <br />
                          <small className="text-muted">
                            {issue.description.substring(0, 60)}
                            {issue.description.length > 60 && '...'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <CategoryBadge category={issue.category} />
                      </td>
                      <td>
                        <PriorityBadge priority={issue.priority} />
                      </td>
                      <td>
                        <StatusBadge status={issue.status} />
                      </td>
                      <td>
                        <div>
                          {issue.reportedBy?.name || 'Anonymous'}
                          <br />
                          <small className="text-muted">{issue.reportedBy?.email}</small>
                        </div>
                      </td>
                      <td>
                        <small>{getTimeAgo(issue.createdAt)}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="text-success me-2">
                            <i className="fas fa-thumbs-up"></i> {issue.votes?.upvotes || 0}
                          </span>
                          <span className="text-danger">
                            <i className="fas fa-thumbs-down"></i> {issue.votes?.downvotes || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openStatusModal(issue)}
                            title="Update Status"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => window.open(`/issues/${issue._id}`, '_blank')}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteIssue(issue._id)}
                            title="Delete Issue"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Issue Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentIssue && (
            <>
              <h6>{currentIssue.title}</h6>
              <p className="text-muted small mb-3">{currentIssue.description.substring(0, 100)}...</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalStatusUpdate}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Actions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Selected {selectedIssues.length} issues for bulk action.</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Action</Form.Label>
            <Form.Select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Select action...</option>
              <option value="status">Update Status</option>
            </Form.Select>
          </Form.Group>
          
          {bulkAction === 'status' && (
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                <option value="">Select status...</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkStatusUpdate}
            disabled={!bulkAction || (bulkAction === 'status' && !bulkStatus)}
          >
            Apply Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;