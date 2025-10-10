import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, ButtonGroup, Pagination, Alert, Spinner, Modal } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import { getIssues, voteOnIssue } from '../services/api';

const IssueList = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Display states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMap, setShowMap] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [issuesPerPage] = useState(12);
  
  // User location for distance calculation
  const [userLocation, setUserLocation] = useState(null);
  const [showDistance, setShowDistance] = useState(false);

  // Categories and other filter options
  const categories = [
    'Road Maintenance', 'Street Lighting', 'Waste Management', 'Water Supply',
    'Public Safety', 'Traffic', 'Parks & Recreation', 'Noise Complaint',
    'Public Transport', 'Other'
  ];

  const statuses = ['Open', 'In Progress', 'Under Review', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    fetchIssues();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, searchTerm, selectedCategory, selectedStatus, selectedPriority, sortBy]);

  const fetchIssues = async () => {
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

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setShowDistance(true);
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.address?.area && issue.address.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (issue.address?.city && issue.address.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(issue => issue.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(issue => issue.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === selectedPriority);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'votes':
          const aVotes = (a.votes?.upvotes || 0) - (a.votes?.downvotes || 0);
          const bVotes = (b.votes?.upvotes || 0) - (b.votes?.downvotes || 0);
          return bVotes - aVotes;
        case 'distance':
          if (!userLocation) return 0;
          // Distance calculation would go here
          return 0;
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
    setCurrentPage(1);
  };

  const handleVoteUpdate = (issueId, voteData) => {
    // Update the issues state with new vote data
    setIssues(prevIssues =>
      prevIssues.map(issue =>
        issue._id === issueId
          ? { ...issue, votes: voteData, userVote: voteData.userVote }
          : issue
      )
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSortBy('newest');
  };

  // Pagination logic
  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = filteredIssues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(filteredIssues.length / issuesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => paginate(currentPage - 1)}
      />
    );

    // First page
    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => paginate(1)}>1</Pagination.Item>);
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Page numbers
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => paginate(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => paginate(currentPage + 1)}
      />
    );

    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading community issues...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        {/* Sidebar Filters */}
        <Col md={3} className="mb-4">
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filters
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Search */}
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search issues, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>

              {/* Category Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Status Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Priority Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Sort By */}
              <Form.Group className="mb-3">
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                  <option value="votes">Most Supported</option>
                  {userLocation && <option value="distance">Distance</option>}
                </Form.Select>
              </Form.Group>

              {/* Clear Filters */}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearAllFilters}
                className="w-100"
              >
                <i className="fas fa-times me-1"></i>
                Clear All Filters
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={9}>
          {/* Header with view controls */}
          <Row className="mb-4">
            <Col>
              <h2>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Community Issues
                <small className="text-muted ms-2">
                  ({filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'})
                </small>
              </h2>
            </Col>
            <Col xs="auto">
              <ButtonGroup>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th-large"></i>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </Button>
                <Button
                  variant={showMap ? 'primary' : 'outline-primary'}
                  onClick={() => setShowMap(!showMap)}
                >
                  <i className="fas fa-map"></i>
                </Button>
              </ButtonGroup>
            </Col>
          </Row>

          {/* Map View Modal */}
          <Modal show={showMap} onHide={() => setShowMap(false)} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>Issues Map</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div style={{ height: '500px', backgroundColor: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
                <p className="text-muted">Map integration coming soon...</p>
              </div>
            </Modal.Body>
          </Modal>

          {/* Issues Display */}
          {filteredIssues.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No Issues Found</h4>
                <p className="text-muted">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Be the first to report an issue in your community!'
                  }
                </p>
                <Button variant="primary" href="/report-issue">
                  <i className="fas fa-plus me-1"></i>
                  Report New Issue
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <Row>
                  {currentIssues.map(issue => (
                    <Col key={issue._id} md={6} lg={4} className="mb-4">
                      <IssueCard
                        issue={issue}
                        onVoteUpdate={handleVoteUpdate}
                        showDistance={showDistance}
                        userLocation={userLocation}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="list-view">
                  {currentIssues.map(issue => (
                    <div key={issue._id} className="mb-3">
                      <IssueCard
                        issue={issue}
                        onVoteUpdate={handleVoteUpdate}
                        showDistance={showDistance}
                        userLocation={userLocation}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default IssueList;