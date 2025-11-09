const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Demo users
const users = [
  { id: '1', email: 'admin@demo.com', password: 'demo123', role: 'admin' },
  { id: '2', email: 'user@demo.com', password: 'demo123', role: 'user' }
];

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = users.find(u => u.email === email);
  
  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
  
  // Create JWT payload
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
  
  // Sign token
  jwt.sign(
    payload,
    process.env.JWT_SECRET || 'demo-secret-key',
    { expiresIn: '5h' },
    (err, token) => {
      if (err) throw err;
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    }
  );
});

// Get current user
router.get('/user', (req, res) => {
  // In demo mode, return admin user
  if (process.env.NODE_ENV !== 'production') {
    return res.json({
      success: true,
      user: {
        id: '1',
        email: 'admin@demo.com',
        role: 'admin'
      }
    });
  }
  
  // In production, verify token and return user
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      user: decoded.user
    });
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;