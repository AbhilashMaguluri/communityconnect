import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const Profile = () => {
  return (
    <Container className="mt-5 pt-5">
      <Alert variant="info">
        <Alert.Heading>Profile Page</Alert.Heading>
        <p>This page will allow users to view and edit their profile information and see their reported issues.</p>
        <hr />
        <p className="mb-0">Coming soon in the next iteration!</p>
      </Alert>
    </Container>
  );
};

export default Profile;