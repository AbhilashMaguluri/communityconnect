import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const APITest = () => {
  const [apiStatus, setApiStatus] = useState('testing');
  const [issuesCount, setIssuesCount] = useState(0);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const testAPIConnection = React.useCallback(async () => {
    try {
      console.log('Testing API connection to:', API_URL);
      // Use environment variable for API URL
      const healthResponse = await axios.get(`${API_URL}/api/issues`);
      console.log('API Response:', healthResponse.data);
      if (healthResponse.data) {
        // Support both array and nested issue collections
        const payload = healthResponse.data;
        const issuesArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data?.issues)
            ? payload.data.issues
            : Array.isArray(payload.data)
              ? payload.data
              : [];
        setIssuesCount(issuesArray.length);
        setApiStatus('connected');
      }
    } catch (err) {
      console.error('API Test Failed:', err);
      setError(`API Connection Failed: ${err.message}`);
      setApiStatus('failed');
    }
  }, [API_URL]);

  useEffect(() => {
    testAPIConnection();
  }, [testAPIConnection]);

  return (
    <div className="container mt-5">
      <Card>
        <Card.Header>
          <h3>🔧 Community Connect API Test</h3>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>API Status: </strong>
            {apiStatus === 'testing' && (
              <span className="text-warning">
                <Spinner animation="border" size="sm" className="me-2" />
                Testing...
              </span>
            )}
            {apiStatus === 'connected' && (
              <span className="text-success">✅ Connected</span>
            )}
            {apiStatus === 'failed' && (
              <span className="text-danger">❌ Failed</span>
            )}
          </div>

          {apiStatus === 'connected' && (
            <Alert variant="success">
              <h5>🎉 Success!</h5>
              <p>Found <strong>{issuesCount}</strong> issues in the database.</p>
            </Alert>
          )}

          {error && (
            <Alert variant="danger">
              <h5>⚠️ Error Details:</h5>
              <pre>{error}</pre>
            </Alert>
          )}

          <Button 
            variant="primary" 
            onClick={testAPIConnection}
            disabled={apiStatus === 'testing'}
          >
            {apiStatus === 'testing' ? 'Testing...' : 'Test Again'}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default APITest;