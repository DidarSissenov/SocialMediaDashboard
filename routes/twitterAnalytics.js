const TwitterAnalytics = require('../models/TwitterAnalytics');
const express = require('express');
const router = express.Router();

// Route to get follower growth data
router.get('/follower-growth/:userId', async (req, res) => {
    try {
      // Fetch analytics data sorted by date
      const analyticsData = await TwitterAnalytics.find({ userId: req.params.userId }).sort('date');
      // Calculate growth for each data point
      const growthData = analyticsData.map((data, index) => {
        // For the first data point, growth is 0
        if (index === 0) return { date: data.date, growth: 0 };
        // Calculate growth from the previous data point
        const growth = data.followerCount - analyticsData[index - 1].followerCount;
        return { date: data.date, growth };
      });
      res.json(growthData);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });

  // Route to get post frequency data
  router.get('/post-frequency/:userId', async (req, res) => {
    try {
       // Fetch analytics data sorted by date
      const analyticsData = await TwitterAnalytics.find({ userId: req.params.userId }).sort('date');
      let frequencyData = {};
      
      // Calculate post frequency by month and year
      analyticsData.forEach((data) => {
        const monthYear = `${data.date.getMonth() + 1}-${data.date.getFullYear()}`;
        frequencyData[monthYear] = (frequencyData[monthYear] || 0) + data.postCount;
      });
  
      res.json(frequencyData);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });

module.exports = router;