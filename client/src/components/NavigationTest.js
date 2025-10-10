import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const NavigationTest = () => {
  const navigate = useNavigate();

  const testNavigation = () => {
    console.log('Testing navigation to login...');
    navigate('/login');
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h3>🧪 Navigation Test</h3>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <h5>Test Different Navigation Methods:</h5>
          </div>
          
          <div className="d-flex flex-column gap-3">
            <div>
              <strong>1. React Router Link:</strong><br />
              <Link to="/login" className="btn btn-primary">
                Go to Login (Link)
              </Link>
            </div>
            
            <div>
              <strong>2. useNavigate Hook:</strong><br />
              <Button onClick={testNavigation} variant="success">
                Go to Login (useNavigate)
              </Button>
            </div>
            
            <div>
              <strong>3. Direct URL:</strong><br />
              <a href="/login" className="btn btn-warning">
                Go to Login (href)
              </a>
            </div>
            
            <div>
              <strong>4. Window location:</strong><br />
              <Button 
                onClick={() => window.location.href = '/login'} 
                variant="info"
              >
                Go to Login (window.location)
              </Button>
            </div>
          </div>
          
          <hr className="my-4" />
          
          <div>
            <strong>Current URL:</strong> {window.location.href}<br />
            <strong>Navigation working?</strong> Click any button above to test.
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NavigationTest;