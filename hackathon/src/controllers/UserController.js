const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class UserController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password, name, age, gender, location } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const user = new User({
        email,
        password,
        profile: {
          name,
          age,
          gender,
          location,
          interests: req.body.interests || [],
          preferences: req.body.preferences || {}
        }
      });
      
      await user.save();
      
      // Create JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user data without password
      const userData = user.toObject();
      delete userData.password;
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userData
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Create JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user data without password
      const userData = user.toObject();
      delete userData.password;
      
      res.json({
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password')
        .populate('matches', 'profile.name profile.photos');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const { name, age, gender, location, bio, interests, preferences } = req.body;
      
      // Build update object
      const profileUpdate = {};
      
      if (name) profileUpdate['profile.name'] = name;
      if (age) profileUpdate['profile.age'] = age;
      if (gender) profileUpdate['profile.gender'] = gender;
      if (location) profileUpdate['profile.location'] = location;
      if (bio) profileUpdate['profile.bio'] = bio;
      if (interests) profileUpdate['profile.interests'] = interests;
      
      // Handle preferences separately to avoid overwriting
      if (preferences) {
        if (preferences.genderPreference) {
          profileUpdate['profile.preferences.genderPreference'] = preferences.genderPreference;
        }
        if (preferences.minAge) {
          profileUpdate['profile.preferences.minAge'] = preferences.minAge;
        }
        if (preferences.maxAge) {
          profileUpdate['profile.preferences.maxAge'] = preferences.maxAge;
        }
        if (preferences.maxDistance) {
          profileUpdate['profile.preferences.maxDistance'] = preferences.maxDistance;
        }
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: profileUpdate },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new UserController();
