const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import routes
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');

// Mock API for demo
app.post('/api/users/register', (req, res) => {
  res.json({
    message: 'User registered successfully',
    token: 'mock-jwt-token-for-demo',
    user: {
      _id: '1',
      email: req.body.email,
      profile: {
        name: req.body.name || 'Demo User',
        age: req.body.age || 25,
        gender: req.body.gender || 'other',
        location: req.body.location || 'San Francisco',
        interests: req.body.interests || ['music', 'movies', 'travel'],
        preferences: req.body.preferences || {}
      }
    }
  });
});

app.post('/api/users/login', (req, res) => {
  res.json({
    message: 'Login successful',
    token: 'mock-jwt-token-for-demo',
    user: {
      _id: '1',
      email: req.body.email,
      profile: {
        name: 'Demo User',
        age: 25,
        gender: 'other',
        location: 'San Francisco',
        interests: ['music', 'movies', 'travel'],
        preferences: {}
      }
    }
  });
});

app.get('/api/matches/potential', (req, res) => {
  res.json([
    {
      _id: '2',
      profile: {
        name: 'Alex',
        age: 27,
        gender: 'non-binary',
        location: 'San Francisco',
        bio: 'I love hiking and outdoor activities.',
        interests: ['hiking', 'photography', 'music'],
        photos: [{ url: 'images/placeholder.jpg', isPrimary: true }]
      },
      compatibilityScore: 85
    },
    {
      _id: '3',
      profile: {
        name: 'Jordan',
        age: 24,
        gender: 'female',
        location: 'Oakland',
        bio: 'Foodie and travel enthusiast.',
        interests: ['food', 'travel', 'reading'],
        photos: [{ url: 'images/placeholder.jpg', isPrimary: true }]
      },
      compatibilityScore: 78
    },
    {
      _id: '4',
      profile: {
        name: 'Taylor',
        age: 29,
        gender: 'male',
        location: 'San Jose',
        bio: 'Tech geek and coffee addict.',
        interests: ['tech', 'coffee', 'movies'],
        photos: [{ url: 'images/placeholder.jpg', isPrimary: true }]
      },
      compatibilityScore: 72
    }
  ]);
});

app.post('/api/matches/like/:userId', (req, res) => {
  res.json({
    message: 'User liked successfully',
    isMatch: req.params.userId === '3' // Simulate match with Jordan
  });
});

app.post('/api/matches/dislike/:userId', (req, res) => {
  res.json({
    message: 'User disliked successfully'
  });
});

app.get('/api/matches/matches', (req, res) => {
  res.json([
    {
      _id: '3',
      profile: {
        name: 'Jordan',
        age: 24,
        gender: 'female',
        photos: [{ url: 'images/placeholder.jpg', isPrimary: true }]
      }
    }
  ]);
});

// Connect to MongoDB (commented out for demo)
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected successfully'))
// .catch(err => console.error('MongoDB connection error:', err));

console.log('Running in demo mode without MongoDB');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing
