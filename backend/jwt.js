const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token, callback) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return callback(err);
    return callback(null, user);
  });
};

module.exports = {
  generateToken,
  verifyToken
};
