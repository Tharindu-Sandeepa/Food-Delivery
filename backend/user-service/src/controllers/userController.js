const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const bcrypt = require('bcryptjs');
const {sendPasswordResetEmail} = require('../utils/email');
const crypto = require('crypto'); 

// Helper function to create a user
const createUserHelper = async (userData) => {
  const { name, email, password, role, phone, address, restaurantId } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse('Email already in use', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    address,
    // restaurantId
  });

  return user;
};

//   Register user

exports.register = asyncHandler(async (req, res, next) => {
  const user = await createUserHelper(req.body);
  sendTokenResponse(user, 200, res);
});

//     Login user
//   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

//    Get current logged in user
//  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

//    Update user details
//   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

//     Update password
//    PUT /api/v1/auth/updatepassword

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//   Get all users (Admin only)
//   GET /api/v1/users
//   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .select('-password')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments({});

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: users
  });
});

//    Get single user (Admin only)
//   GET /api/v1/users/:id
//   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

//    Create user (Admin only)
//    POST /api/v1/users
//  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await createUserHelper(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

//     Update user (Admin only)
//    PUT /api/v1/users/:id
//  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Check if user exists
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  
  let updateData = { ...req.body };

  // Hash password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    select: '-password'
  });

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

//    Delete user (Admin only)
//    DELETE /api/v1/users/:id
//  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  if (process.env.NODE_ENV !== 'production') {
    delete cookieOptions.secure;
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user
    });
};


//    Forgot Password (Send Reset Email)
//    POST /api/v1/users/forgotpassword
//  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('No user with that email', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Verify the update
  const updatedUser = await User.findOne({ email: req.body.email });
  console.log('Stored Hashed Token:', updatedUser.passwordResetToken);
  console.log('Stored Expires:', updatedUser.passwordResetExpires);

  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      token: resetToken,
      expires: user.passwordResetExpires
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});


//    Get single user by ID (Public)
//    GET /api/v1/users/public/:id
//   Public
exports.getPublicUser = asyncHandler(async (req, res, next) => {

  // Check if user ID is provided
  console.log("user id ", req.params.id);

  // Validate ObjectId
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorResponse('Invalid user ID', 400));
  }

  const user = await User.findById(req.params.id).select('_id name email role');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});


//    Reset Password
//   PUT /api/v1/users/resetpassword/:token
//  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('Received token:', req.params.token);
  console.log('Hashed token:', hashedToken);
  console.log('Current time:', new Date());

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    console.log('No user found with matching token or token expired');
    console.log('Stored hashed token:', user ? user.passwordResetToken : 'No user');
    return next(new ErrorResponse('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});