const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    return user;
  } catch (err) {
    throw new ErrorResponse('Invalid token', 401);
  }
};



module.exports = {
  generateToken,
  verifyToken,
  loginUser,
  registerUser
};