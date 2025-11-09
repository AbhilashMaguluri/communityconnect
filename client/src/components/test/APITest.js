import React, { useEffect, useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import API from '../../services/api';

const APITest = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ping = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/api/health');
      setStatus(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container py-4">
      <Card>
        <Card.Header>
          <strong>API Test</strong>
        </Card.Header>
        <Card.Body>
          {loading && <Spinner animation="border" size="sm" className="me-2" />}
          <Button variant="primary" onClick={ping} disabled={loading} className="mb-3">
            Ping /api/health
          </Button>
          {error && <Alert variant="danger">{error}</Alert>}
          {status && (
            <Alert variant="success">
              <div><strong>Message:</strong> {status.message}</div>
              <div><strong>Environment:</strong> {status.environment}</div>
              <div><strong>Timestamp:</strong> {status.timestamp}</div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default APITest;
