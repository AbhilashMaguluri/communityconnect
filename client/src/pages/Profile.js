import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Card, Row, Col, Button } from 'react-bootstrap';
import { getProfile, getMyIssues } from '../services/api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileAndIssues = async () => {
      setLoading(true);
      try {
        const profileRes = await getProfile();
        setUser(profileRes.data.data.user || profileRes.data.data);

        setIssuesLoading(true);
        const myIssuesRes = await getMyIssues({ page: 1, limit: 20 });
        setIssues(myIssuesRes.data.data || myIssuesRes.data || myIssuesRes.data.issues || myIssuesRes.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
        setIssuesLoading(false);
      }
    };

    fetchProfileAndIssues();
  }, []);

  return (
    <Container className="mt-5 pt-5">
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <h2>Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}

          {user && (
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col>
                    <h5>{user.name}</h5>
                    <p className="mb-1"><strong>Email:</strong> {user.email}</p>
                    <p className="mb-0"><strong>Role:</strong> {user.role || 'user'}</p>
                  </Col>
                  <Col className="text-end">
                    <Link to="/profile/edit">
                      <Button variant="outline-primary">Edit Profile</Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <h4>My Reported Issues</h4>
          {issuesLoading ? (
            <div className="text-center py-3"><Spinner animation="border" /></div>
          ) : issues && issues.length > 0 ? (
            issues.map((issue) => (
              <Card key={issue._id} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <h5>
                        <Link to={`/issues/${issue._id}`}>{issue.title}</Link>
                      </h5>
                      <p className="mb-1 text-muted">{issue.address?.street || ''} {issue.address?.city ? `— ${issue.address.city}` : ''}</p>
                      <p className="mb-0">{issue.description?.slice(0, 180)}{issue.description && issue.description.length > 180 ? '...' : ''}</p>
                    </Col>
                    <Col md={4} className="text-end">
                      <p className="mb-1"><strong>Status:</strong> {issue.status}</p>
                      <p className="mb-1"><strong>Priority:</strong> {issue.priority}</p>
                      <p className="mb-0 text-muted">Reported: {new Date(issue.createdAt).toLocaleString()}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Alert variant="info">
              You haven't reported any issues yet. Use the <Link to="/report-issue">Report Issue</Link> page to create one.
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default Profile;