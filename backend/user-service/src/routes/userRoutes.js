const express = require('express');
const {register,login,getMe,updateDetails,updatePassword,getUsers,getUser,createUser,updateUser,deleteUser,forgotPassword,resetPassword} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);


router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

// Admin routes
router.use(protect, authorize('admin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;