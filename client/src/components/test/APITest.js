import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const APITest = () => {
  const [apiStatus, setApiStatus] = useState('testing');
  const [issuesCount, setIssuesCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      
      // Test 1: Basic health check
      const healthResponse = await axios.get('http://localhost:5000/api/issues');
      console.log('API Response:', healthResponse.data);
      
      if (healthResponse.data) {
        setIssuesCount(healthResponse.data.length || 0);
        setApiStatus('connected');
      }
    } catch (err) {
      console.error('API Test Failed:', err);
      setError(`API Connection Failed: ${err.message}`);
      setApiStatus('failed');
    }
  };

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