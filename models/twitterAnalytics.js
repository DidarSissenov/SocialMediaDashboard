const mongoose = require('mongoose');

const twitterAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  followerCount: Number,
  postCount: Number,
});

const TwitterAnalytics = mongoose.model('TwitterAnalytics', twitterAnalyticsSchema);
module.exports = TwitterAnalytics;