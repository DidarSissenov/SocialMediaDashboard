const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const router = express.Router();
const User = require('../models/user');

// Route to start the OAuth process for Instagram
router.get('/oauth', (req, res) => {
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    res.redirect(instagramAuthUrl);
});

// Callback route for Instagram OAuth
router.get('/oauth/callback', async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(400).send('Code not found');
        }

         // Preparing payload for access token request
        const payload = {
            client_id: process.env.INSTAGRAM_CLIENT_ID,
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
            code,
        };

         // Request access token from Instagram
        const response = await axios.post('https://api.instagram.com/oauth/access_token', qs.stringify(payload), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!req.session.userId) {
            return res.status(401).send('User not authenticated');
        }

        // Save access token to user's profile in the database
        const accessToken = response.data.access_token;
        await User.findByIdAndUpdate(req.session.userId, { instagramAccessToken: accessToken });
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error during Instagram authentication:', error.response ? error.response.data : error);
        res.status(500).send('Error during Instagram authentication');
    }
});

// Check if the user has linked their Instagram account
router.get('/check-link', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ isLinked: false, message: 'User not authenticated' });
    }

    try {
        const user = await User.findById(req.session.userId);
        res.json({ isLinked: Boolean(user && user.instagramAccessToken) });
    } catch (error) {
        console.error('Error checking Instagram link:', error);
        res.status(500).send('Error checking Instagram link.');
    }
});

// Fetch basic data from the user's Instagram account
router.get('/basic-data', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not authenticated');
    }

    const accessToken = await User.findById(req.session.userId).then(user => user.instagramAccessToken);

    if (!accessToken) {
        return res.status(401).send('Instagram access token not found');
    }

    try {
        // Fetch user's profile information
        const profileResponse = await axios.get(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`);
        const profileData = profileResponse.data;

        // Fetch user's recent media
        const mediaResponse = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,timestamp&access_token=${accessToken}`);
        const mediaData = mediaResponse.data.data;

        res.json({ profile: profileData, media: mediaData });
    } catch (error) {
        console.error('Error fetching basic Instagram data:', error);
        res.status(500).send('Error fetching basic Instagram data');
    }
});

module.exports = router;
