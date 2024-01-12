const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Ensures username is unique in the database
  },
  password: {
    type: String,
    required: true
  },
  instagramAccessToken: {
    type: String,
    required: false
  },
  twitterAccessToken: {
    type: String,
    required: false
  },
  twitterAccessTokenSecret: {
    type: String,
    required: false
  },
  twitterRefreshToken: {
    type: String,
    required: false
  },
  scheduledPosts: [{
    title: String,
    description: String,
    date: Date,
  }],
  twitterOAuthToken: {
    type: String,
    required: false
  },
  twitterOAuthTokenSecret: {
    type: String,
    required: false
  },
  twitterUserId: {
    type: String,
    required: false
  },
  

});

// Hash password before saving a user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// Generate JWT for user authentication
const jwt = require('jsonwebtoken');
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  };

const User = mongoose.model('User', userSchema);
module.exports = User;
