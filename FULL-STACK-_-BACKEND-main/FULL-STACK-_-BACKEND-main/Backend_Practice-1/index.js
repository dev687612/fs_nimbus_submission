const express = require('express');
const app = express();
const PORT = 3000;

// Middleware 1: Request Logger
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next(); // Pass control to the next middleware or route handler
};

// Middleware 2: Bearer Token Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  // Check if header exists and has the correct format
  if (authHeader && authHeader.startsWith('Bearer ')) {
    if (token === 'mysecrettoken') {
      next(); // Token is valid, proceed to the route
    } else {
      // Token is incorrect
      res.status(401).json({ message: 'Authorization header missing or incorrect' });
    }
  } else {
    // Header is missing or has the wrong format
    res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }
};

// Apply the logging middleware globally to all routes
app.use(requestLogger);

// Route 1: Public Route
// This route does not use the authenticateToken middleware
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

// Route 2: Protected Route
// We apply the authenticateToken middleware *only* to this route.
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});