const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const multer = require('multer');
const path = require('path');
const Analytics = require('../models/twitterAnalytics');
const router = express.Router();

// User registration endpoint
router.post('/register', async (req, res) => {
    try {
      let { username, password } = req.body;
  
      // Check if both username and password are provided
      if (!(username && password)) {
        return res.status(400).send("All input is required");
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).send("User already exists. Please login.");
      }
  
      // Create a new user and save to the database
      const user = new User({ username, password });
      await user.save();
  
      res.status(201).send("User registered successfully");
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send("Error in registration. Please try again.");
      }
  });

  // User login endpoint
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if both username and password are provided
      if (!(username && password)) {
        return res.status(400).send('All input is required');
      }
  
      // Authenticate the user
      const user = await User.findOne({ username });
      if (user && (await bcrypt.compare(password, user.password))) {
        // Generate JWT token
        const token = jwt.sign(
          { user_id: user._id, username },
          process.env.JWT_SECRET,
          { expiresIn: '2h' } 
        );

        // Store user ID in session
        req.session.userId = user._id;
        return res.status(200).send(token);
      }
  
      res.status(400).send('Invalid Credentials');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// File upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  res.send('File uploaded!');
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send('User not authenticated');
  }
  next();
};

// Create a new post endpoint
router.post('/posts', upload.single('image'), isAuthenticated, async (req, res) => {
  try {
    const { title, description, scheduledTime } = req.body;
    let imagePath = '';
    if (req.file) {
      // Convert the local file path to a URL
      imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const post = new Post({
      title,
      description,
      scheduledTime: new Date(scheduledTime), // Ensure this is a valid Date object
      image: imagePath,
      user: req.session.userId
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all posts for the logged-in user
router.get('/posts', isAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.session.userId });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific post by ID
router.get('/posts/:id', isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.session.userId });
    if (!post) return res.status(404).send('Post not found');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific post
router.put('/posts/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId }, 
      req.body, 
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a specific post endpoint
router.delete('/posts/:id', isAuthenticated, async (req, res) => {
  try {
    await Post.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Analytics  endpoint
router.get('/analytics', async (req, res) => {
  try {
      const analyticsData = await Analytics.find({}); // Fetch your analytics data
      res.json(analyticsData);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


module.exports = router;
