/*
Sissenov Didar
T00621252
COMP-4911
*/

const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const instagramRoutes = require('./routes/instagram');
const twitterRoutes = require('./routes/twitter');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Read SSL certificate files
const privateKey = fs.readFileSync('localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('localhost.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Configure session management
app.use(session({
  secret: 'o2sFasf032Fg3F1kG',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Ensures cookies are sent over HTTPS
    httpOnly: true // Helps mitigate XSS attacks
  }
}));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

// Define routes for different services
app.use('/api/auth', authRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/twitter', twitterRoutes);

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Route for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Send React's index.html file for any other request (SPA handling)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Start the HTTPS server
https.createServer(credentials, app).listen(3000, () => {
   console.log('HTTPS Server running on port 3000');
});