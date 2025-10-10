import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TrendingIssues from '../components/TrendingIssues';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={8} className="mx-auto text-center">
              <h1 className="hero-title fade-in">
                Community Connect
              </h1>
              <p className="hero-subtitle fade-in">
                Bridging the gap between citizens and local authorities for better community governance
              </p>
              <div className="mt-4 fade-in">
                {isAuthenticated ? (
                  <div>
                    <Link to="/report-issue">
                      <Button variant="light" size="lg" className="me-3 mb-2">
                        <i className="fas fa-plus-circle me-2"></i>
                        Report an Issue
                      </Button>
                    </Link>
                    <Link to="/issues">
                      <Button variant="outline-light" size="lg" className="mb-2">
                        <i className="fas fa-list me-2"></i>
                        Browse Issues
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <Link to="/register">
                      <Button variant="light" size="lg" className="me-3 mb-2">
                        <i className="fas fa-user-plus me-2"></i>
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/issues">
                      <Button variant="outline-light" size="lg" className="mb-2">
                        <i className="fas fa-eye me-2"></i>
                        View Issues
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary">
                How It Works
              </h2>
              <p className="lead text-muted">
                Simple steps to make your community better
              </p>
            </Col>
          </Row>
          
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="fas fa-camera fa-3x text-primary"></i>
                  </div>
                  <Card.Title>Report Issues</Card.Title>
                  <Card.Text>
                    Take photos and describe local problems like damaged roads, 
                    water supply issues, or sanitation concerns with GPS location.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="fas fa-vote-yea fa-3x text-success"></i>
                  </div>
                  <Card.Title>Community Voting</Card.Title>
                  <Card.Text>
                    Community members can vote on reported issues to prioritize 
                    the most urgent problems that need immediate attention.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="fas fa-tools fa-3x text-warning"></i>
                  </div>
                  <Card.Title>Track Resolution</Card.Title>
                  <Card.Text>
                    Authorities review, assign, and update the status of issues. 
                    Citizens can track progress from reported to resolved.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-primary">
                Issue Categories
              </h2>
              <p className="lead text-muted">
                Report various types of community issues
              </p>
            </Col>
          </Row>
          
          <Row>
            {[
              { icon: 'fas fa-road', title: 'Roads & Transport', color: 'primary' },
              { icon: 'fas fa-tint', title: 'Water Supply', color: 'info' },
              { icon: 'fas fa-bolt', title: 'Electricity', color: 'warning' },
              { icon: 'fas fa-trash-alt', title: 'Sanitation', color: 'success' },
              { icon: 'fas fa-shield-alt', title: 'Public Safety', color: 'danger' },
              { icon: 'fas fa-hospital', title: 'Health Services', color: 'info' },
              { icon: 'fas fa-graduation-cap', title: 'Education', color: 'primary' },
              { icon: 'fas fa-leaf', title: 'Environment', color: 'success' }
            ].map((category, index) => (
              <Col lg={3} md={4} sm={6} className="mb-4" key={index}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className={`${category.icon} fa-2x text-${category.color} mb-2`}></i>
                    <Card.Title className="h6">{category.title}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Trending Issues Section */}
      <section className="py-5 bg-light">
        <Container>
          <TrendingIssues limit={6} showFilters={false} />
        </Container>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-5 bg-primary text-white">
          <Container>
            <Row className="text-center">
              <Col>
                <h2 className="mb-3">Ready to Make a Difference?</h2>
                <p className="lead mb-4">
                  Join thousands of citizens working together to improve their communities
                </p>
                <Link to="/register">
                  <Button variant="light" size="lg">
                    <i className="fas fa-user-plus me-2"></i>
                    Join Community Connect
                  </Button>
                </Link>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </>
  );
};

export default Home;