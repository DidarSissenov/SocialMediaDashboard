// twitterClient.js
require('dotenv').config();
const oauth = require('oauth');

// Initialize and export the OAuth client
const oauthClient = new oauth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0A',
  process.env.TWITTER_CALLBACK_URL,
  'HMAC-SHA1'
);

module.exports = oauthClient;