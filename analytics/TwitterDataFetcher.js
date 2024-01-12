const TwitterApi = require('twitter-api-v2').TwitterApi;
const TwitterAnalytics = require('../models/TwitterAnalytics');
const User = require('../models/User'); // Assuming this is your user model
const fetchNumberOfPosts = require('./PostCountFetcher');

/*
 * Fetches and stores Twitter data for users in the database.
 */
async function fetchAndStoreTwitterData() {
  // Find all users who have linked their Twitter account
  const users = await User.find({ twitterAccessToken: { $exists: true } });

  // Loop through each user
  for (const user of users) {
    const client = new TwitterApi(user.twitterAccessToken);
    try {
      // Fetch the user's Twitter profile
      const userProfile = await client.v2.me();

      // Fetch the number of posts for the user
      const postCount = await fetchNumberOfPosts(user._id);

      // Create a new TwitterAnalytics document
      const newAnalytics = new TwitterAnalytics({
        userId: user._id,
        date: new Date(),
        followerCount: userProfile.data.public_metrics.followers_count,
        postCount: postCount,
      });

      // Save the analytics data
      await newAnalytics.save();
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
    }
  }
}

module.exports = fetchAndStoreTwitterData;
