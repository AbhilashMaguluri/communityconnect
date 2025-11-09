import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import IssueCard from '../components/IssueCard';
import { getMyIssues } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyIssues = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const response = await getMyIssues();
      // server returns { success, data: issues, ... } or data. Keep resilient
      const data = response?.data?.data || response?.data || [];
      setIssues(Array.isArray(data) ? data : data.issues || []);
    } catch (err) {
      console.error('Failed to load my issues', err);
      setError('Could not load your reported issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your reported issues...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2>
            <i className="fas fa-folder-open me-2"></i>
            My Reported Issues
            <small className="text-muted ms-2">({issues.length})</small>
          </h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mt-3">
        {issues.length === 0 ? (
          <Col>
            <Alert variant="info">You have not reported any issues yet.</Alert>
          </Col>
        ) : (
          issues.map((issue) => (
            <Col key={issue._id} md={6} lg={4} className="mb-4">
              <IssueCard issue={issue} />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default MyIssues;
