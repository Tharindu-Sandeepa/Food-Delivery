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

// const loginUser = async (email, password) => {
//   if (!email || !password) {
//     throw new ErrorResponse('Please provide email and password', 400);
//   }

//   const user = await User.findOne({ email }).select('+password');

//   if (!user) {
//     throw new ErrorResponse('Invalid credentials', 401);
//   }

//   const isMatch = await user.matchPassword(password);

//   if (!isMatch) {
//     throw new ErrorResponse('Invalid credentials', 401);
//   }

//   return {
//     token: generateToken(user._id, user.role),
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     }
//   };
// };

// const registerUser = async (userData) => {
//   // Check if user already exists
//   const existingUser = await User.findOne({ email: userData.email });
//   if (existingUser) {
//     throw new ErrorResponse('User already exists', 400);
//   }

//   // Create user
//   const user = await User.create(userData);

//   return {
//     token: generateToken(user._id, user.role),
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     }
//   };
// };

module.exports = {
  generateToken,
  verifyToken,
  loginUser,
  registerUser
};