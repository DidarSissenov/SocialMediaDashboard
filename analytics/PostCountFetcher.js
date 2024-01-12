const Post = require('../models/Post');

/*
*Fetches the number of posts created by a specific user in the last month.
*/
async function fetchNumberOfPosts(userId) {
   // Create a date object representing one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

   // Count the number of documents where the userId matches and the createdAt date is within the last month
  const postCount = await Post.countDocuments({
    userId: userId,
    createdAt: { $gte: oneMonthAgo }
  });

  return postCount;
}

module.exports = fetchNumberOfPosts;
