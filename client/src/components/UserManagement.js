import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, InputGroup } from 'react-bootstrap';
import { getAllUsers, updateUserRole, getDashboardStats } from '../services/api';
import { getTimeAgo } from '../components/IssueComponents';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // User actions
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Stats
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await getDashboardStats();
      setUserStats(response.data.userStats || {});
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.isActive !== false);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => user.isActive === false);
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredUsers(filtered);
  };

  const handleRoleUpdate = async () => {
    if (!currentUser || !newRole) return;

    try {
      await updateUserRole(currentUser._id, newRole);
      
      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user._id === currentUser._id
            ? { ...user, role: newRole }
            : user
        )
      );
      
      setShowRoleModal(false);
      setCurrentUser(null);
      setNewRole('');
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh stats
      fetchUserStats();
    } catch (error) {
      setError('Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openRoleModal = (user) => {
    setCurrentUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'danger',
      'moderator': 'warning',
      'user': 'primary'
    };
    return colors[role] || 'secondary';
  };

  const getStatusColor = (isActive) => {
    return isActive !== false ? 'success' : 'secondary';
  };

  const getStatusText = (isActive) => {
    return isActive !== false ? 'Active' : 'Inactive';
  };

  const formatUserStats = (user) => {
    return {
      issuesReported: user.issuesReported || 0,
      commentsPosted: user.commentsPosted || 0,
      votescast: user.votesCast || 0,
      lastActive: user.lastLogin || user.updatedAt
    };
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading users...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1>
            <i className="fas fa-users me-2"></i>
            User Management
          </h1>
          <p className="text-muted">Manage community members and their roles</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{userStats.totalUsers}</h4>
                  <p className="mb-0">Total Users</p>
                </div>
                <div>
                  <i className="fas fa-users fa-2x"></i>
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
                  <h4>{userStats.activeUsers}</h4>
                  <p className="mb-0">Active Users</p>
                </div>
                <div>
                  <i className="fas fa-user-check fa-2x"></i>
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
                  <h4>{userStats.adminUsers}</h4>
                  <p className="mb-0">Admin Users</p>
                </div>
                <div>
                  <i className="fas fa-user-shield fa-2x"></i>
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
                  <h4>{userStats.newUsersThisMonth}</h4>
                  <p className="mb-0">New This Month</p>
                </div>
                <div>
                  <i className="fas fa-user-plus fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Search Users</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Role Filter</Form.Label>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Status Filter</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="w-100"
              >
                <i className="fas fa-times me-1"></i>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            Users ({filteredUsers.length})
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Issues</th>
                  <th>Comments</th>
                  <th>Votes</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th width="120">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <i className="fas fa-users fa-3x text-muted mb-3 d-block"></i>
                      <p className="text-muted mb-0">No users found with current filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const stats = formatUserStats(user);
                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px' }}>
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <strong>{user.name}</strong>
                              <br />
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getRoleColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(user.isActive)}>
                            {getStatusText(user.isActive)}
                          </Badge>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {stats.issuesReported}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">
                            {stats.commentsPosted}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning">
                            {stats.votescast}
                          </span>
                        </td>
                        <td>
                          <small>{getTimeAgo(user.createdAt)}</small>
                        </td>
                        <td>
                          <small>{getTimeAgo(stats.lastActive)}</small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openRoleModal(user)}
                              title="Change Role"
                            >
                              <i className="fas fa-user-tag"></i>
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              title="View Profile"
                              onClick={() => {
                                // Navigate to user profile or show user details modal
                                console.log('View user profile:', user._id);
                              }}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Role Update Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <>
              <div className="text-center mb-3">
                <div className="bg-primary rounded-circle text-white d-inline-flex align-items-center justify-content-center mb-2" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-user fa-2x"></i>
                </div>
                <h6>{currentUser.name}</h6>
                <p className="text-muted small">{currentUser.email}</p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Current Role</Form.Label>
                <div>
                  <Badge bg={getRoleColor(currentUser.role)} className="p-2">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </Badge>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>New Role</Form.Label>
                <Form.Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  <small>
                    <strong>User:</strong> Can report issues and comment<br />
                    <strong>Moderator:</strong> Can moderate comments and help resolve issues<br />
                    <strong>Admin:</strong> Full access to all system features
                  </small>
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRoleUpdate}
            disabled={!newRole || newRole === currentUser?.role}
          >
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;