import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" fixed="top">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>
            <i className="fas fa-users me-2"></i>
            Community Connect
          </BootstrapNavbar.Brand>
        </LinkContainer>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>
                <i className="fas fa-home me-1"></i>
                Home
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/issues">
              <Nav.Link>
                <i className="fas fa-list me-1"></i>
                Browse Issues
              </Nav.Link>
            </LinkContainer>
            
            {isAuthenticated && (
              <LinkContainer to="/report-issue">
                <Nav.Link>
                  <i className="fas fa-plus-circle me-1"></i>
                  Report Issue
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <>
                    <i className="fas fa-user me-1"></i>
                    {user?.name}
                  </>
                } 
                id="user-dropdown"
              >
                <LinkContainer to="/profile">
                  <NavDropdown.Item>
                    <i className="fas fa-user-edit me-2"></i>
                    Profile
                  </NavDropdown.Item>
                </LinkContainer>

                <LinkContainer to="/my-issues">
                  <NavDropdown.Item>
                    <i className="fas fa-folder-open me-2"></i>
                    My Reports
                  </NavDropdown.Item>
                </LinkContainer>
                
                {user?.role === 'admin' && (
                  <LinkContainer to="/admin">
                    <NavDropdown.Item>
                      <i className="fas fa-cog me-2"></i>
                      Admin Dashboard
                    </NavDropdown.Item>
                  </LinkContainer>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link as="button" style={{border: 'none', background: 'none'}}>
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link as="button" style={{border: 'none', background: 'none'}}>
                    <i className="fas fa-user-plus me-1"></i>
                    Register
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;