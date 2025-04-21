// const User = require('../models/User');
// const ErrorResponse = require('../utils/errorResponse');

// const getAllUsers = async (filter, options) => {
//   const users = await User.paginate(filter, options);
//   return users;
// };

// const getUserById = async (userId) => {
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new ErrorResponse(`User not found with id of ${userId}`, 404);
//   }

//   return user;
// };

// const createUser = async (userData) => {
//   // Check if email is already in use
//   const existingUser = await User.findOne({ email: userData.email });
//   if (existingUser) {
//     throw new ErrorResponse('Email already in use', 400);
//   }

//   const user = await User.create(userData);
//   return user;
// };

// const updateUser = async (userId, updateData) => {
//   let user = await User.findById(userId);

//   if (!user) {
//     throw new ErrorResponse(`User not found with id of ${userId}`, 404);
//   }

//   // Make sure user can't change role unless admin
//   if (updateData.role && updateData.role !== user.role) {
//     throw new ErrorResponse('Not authorized to change user role', 403);
//   }

//   user = await User.findByIdAndUpdate(userId, updateData, {
//     new: true,
//     runValidators: true
//   });

//   return user;
// };

// const deleteUser = async (userId) => {
//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ErrorResponse(`User not found with id of ${userId}`, 404);
//   }

//   await user.remove();
//   return { message: 'User removed successfully' };
// };

// const updateUserDetails = async (userId, updateData) => {
//   const allowedUpdates = ['name', 'email', 'phone', 'address'];
//   const isValidOperation = Object.keys(updateData).every(update =>
//     allowedUpdates.includes(update)
//   );

//   if (!isValidOperation) {
//     throw new ErrorResponse('Invalid updates!', 400);
//   }

//   const user = await User.findByIdAndUpdate(userId, updateData, {
//     new: true,
//     runValidators: true
//   });

//   return user;
// };

// const updateUserPassword = async (userId, currentPassword, newPassword) => {
//   const user = await User.findById(userId).select('+password');

//   if (!(await user.matchPassword(currentPassword))) {
//     throw new ErrorResponse('Current password is incorrect', 401);
//   }

//   user.password = newPassword;
//   await user.save();

//   return user;
// };

// module.exports = {
//   getAllUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   deleteUser,
//   updateUserDetails,
//   updateUserPassword
// };