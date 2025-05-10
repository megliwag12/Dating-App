const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 18 }).withMessage('Age must be at least 18'),
  body('gender').isIn(['male', 'female', 'non-binary', 'other']).withMessage('Invalid gender')
];

// Routes
router.post('/register', registerValidation, UserController.register);
router.post('/login', UserController.login);
router.get('/profile', auth, UserController.getProfile);
router.put('/profile', auth, UserController.updateProfile);

module.exports = router;
