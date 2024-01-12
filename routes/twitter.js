const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const User = require('../models/user');
require('dotenv').config();

const router = express.Router();

// Initialize Twitter client for OAuth 2.0
const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send('User not authenticated');
    }
    next();
};

// Start the OAuth process
router.get('/oauth', isAuthenticated, (req, res) => {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
        process.env.TWITTER_CALLBACK_URL, {
            scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
        }
    );

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;
    res.redirect(url);
});

// Callback endpoint
router.get('/twitter-callback', isAuthenticated, async (req, res) => {
    const { state, code } = req.query;
    const { codeVerifier, state: sessionState } = req.session;

    if (state !== sessionState) {
        return res.status(400).send('Invalid state');
    }

    try {
        const { accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: process.env.TWITTER_CALLBACK_URL,
        });

        // Save tokens in the database 
        const userClient = new TwitterApi(accessToken);
        const twitterProfile = await userClient.v2.me();
        const twitterUserId = twitterProfile.data.id;

        const user = await User.findById(req.session.userId);
        user.twitterAccessToken = accessToken;
        user.twitterRefreshToken = refreshToken;
        user.twitterUserId = twitterUserId;
        await user.save();

        res.redirect('/dashboard'); // Redirect to frontend dashboard
    } catch (error) {
        console.error('Error during Twitter OAuth:', error);
        res.status(500).send('Error during Twitter OAuth');
    }
});

router.get('/check-link', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const isLinked = Boolean(user.twitterAccessToken); 
        res.json({ isLinked });
    } catch (error) {
        console.error('Error checking Twitter link:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Fetch user profile
router.get('/my-profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || !user.twitterAccessToken) {
            return res.status(403).send('User is not linked with Twitter');
        }

        const userClient = new TwitterApi(user.twitterAccessToken);

        try {
            // Fetching additional fields
            const userProfile = await userClient.v2.me({
                'user.fields': ['description', 'public_metrics']
            });
            res.json(userProfile.data);
        } catch (error) {
            if (error.code === 401 && user.twitterRefreshToken) {
                // refresh the token
                const refreshTokenClient = new TwitterApi({
                    clientId: process.env.TWITTER_CLIENT_ID,
                    clientSecret: process.env.TWITTER_CLIENT_SECRET,
                });

                const newTokens = await refreshTokenClient.refreshOAuth2Token(user.twitterRefreshToken);
                user.twitterAccessToken = newTokens.accessToken;
                user.twitterRefreshToken = newTokens.refreshToken;
                await user.save();

                // Retry fetching the user profile with the new access token
                const refreshedClient = new TwitterApi(newTokens.accessToken);
                const refreshedProfile = await refreshedClient.v2.me({
                    'user.fields': ['description', 'public_metrics']
                });
                res.json(refreshedProfile.data);
            } else {
                console.error('Error fetching Twitter profile:', error);
                res.status(error.code || 500).send(error);
            }
        }
    } catch (error) {
        console.error('Error in /my-profile route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/post-tweet', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.twitterAccessToken) {
      return res.status(403).send('User is not linked with Twitter');
    }

    const userClient = new TwitterApi(user.twitterAccessToken);
    await userClient.v2.tweet(req.body.text);
    res.send('Tweet posted successfully');
  } catch (error) {
    console.error('Error posting tweet:', error);
    res.status(500).send('Error posting tweet');
  }
});


module.exports = router;
