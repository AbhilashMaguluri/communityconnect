import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AuthContext from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import AdminAnalytics from '../components/AdminAnalytics';
import UserManagement from '../components/UserManagement';

const AdminLayout = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Admin Sidebar */}
        <Col md={3} className="mb-4">
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                Admin Panel
              </h5>
            </Card.Header>
            <Card.Body className="p-3">
              <Nav variant="pills" className="flex-column admin-sidebar">
                <LinkContainer to="/admin/dashboard">
                  <Nav.Link>
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </Nav.Link>
                </LinkContainer>
                
                <LinkContainer to="/admin/analytics">
                  <Nav.Link>
                    <i className="fas fa-chart-line me-2"></i>
                    Analytics
                  </Nav.Link>
                </LinkContainer>
                
                <LinkContainer to="/admin/users">
                  <Nav.Link>
                    <i className="fas fa-users me-2"></i>
                    User Management
                  </Nav.Link>
                </LinkContainer>
                
                <LinkContainer to="/issues">
                  <Nav.Link>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    View All Issues
                  </Nav.Link>
                </LinkContainer>
                
                <hr className="my-2" />
                
                <LinkContainer to="/">
                  <Nav.Link>
                    <i className="fas fa-home me-2"></i>
                    Back to Site
                  </Nav.Link>
                </LinkContainer>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* Admin Content */}
        <Col md={9}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;