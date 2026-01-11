const express = require('express');
const {
    register,
    login,
    getMe,
    verifyEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verifyemail/:token', verifyEmail);

module.exports = router;
