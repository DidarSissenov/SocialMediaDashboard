const jwt = require('jsonwebtoken');


/*
*Middleware to authenticate users based on JWT tokens.
*/

function auth(req, res, next) {
  // Retrieve the token from the request header
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
     // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
}

module.exports = auth;
