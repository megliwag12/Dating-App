const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

// Database file paths
const DB_DIR = path.join(__dirname, 'db');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

// Initialize database files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper functions for database operations
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
};

const findUserByEmail = (email) => {
  const users = readUsers();
  return users.find(user => user.email === email);
};

const findUserById = (id) => {
  const users = readUsers();
  return users.find(user => user._id === id);
};

// Authentication middleware
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes
// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, name, age, gender, location, interests, preferences } = req.body;
    
    // Validate input
    if (!email || !password || !name || !age || !gender || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const users = readUsers();
    const newUser = {
      _id: Date.now().toString(),
      email,
      password: hashedPassword,
      profile: {
        name,
        age,
        gender,
        location,
        coordinates: req.body.coordinates || null,
        bio: req.body.bio || '',
        interests: interests || [],
        photos: [],
        socialProfiles: {
          linkedin: req.body.linkedin || '',
          twitter: req.body.twitter || '',
          instagram: req.body.instagram || ''
        },
        calendar: {
          availability: req.body.availability || [],
          preferredDateActivities: req.body.preferredActivities || []
        },
        jobTitle: req.body.jobTitle || '',
        company: req.body.company || '',
        education: req.body.education || '',
        preferences: preferences || {
          genderPreference: [],
          minAge: 18,
          maxAge: 100,
          maxDistance: 50
        }
      },
      matches: [],
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password
    const userData = { ...newUser };
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
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password
    const userData = { ...user };
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
});

// Get user profile
app.get('/api/users/profile', auth, (req, res) => {
  try {
    const user = findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without password
    const userData = { ...user };
    delete userData.password;
    
    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/profile', auth, (req, res) => {
  try {
    const {
      name, age, gender, location, bio, interests, preferences,
      coordinates, socialProfiles, calendar, jobTitle, company, education
    } = req.body;

    const users = readUsers();
    const userIndex = users.findIndex(user => user._id === req.user.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic profile fields
    if (name) users[userIndex].profile.name = name;
    if (age) users[userIndex].profile.age = age;
    if (gender) users[userIndex].profile.gender = gender;
    if (location) users[userIndex].profile.location = location;
    if (bio) users[userIndex].profile.bio = bio;
    if (interests) users[userIndex].profile.interests = interests;

    // Update coordinates
    if (coordinates) {
      users[userIndex].profile.coordinates = coordinates;
    }

    // Update professional details
    if (jobTitle) users[userIndex].profile.jobTitle = jobTitle;
    if (company) users[userIndex].profile.company = company;
    if (education) users[userIndex].profile.education = education;

    // Handle social profiles
    if (socialProfiles) {
      // Initialize social profiles object if it doesn't exist
      if (!users[userIndex].profile.socialProfiles) {
        users[userIndex].profile.socialProfiles = {};
      }

      if (socialProfiles.linkedin) {
        users[userIndex].profile.socialProfiles.linkedin = socialProfiles.linkedin;
      }
      if (socialProfiles.twitter) {
        users[userIndex].profile.socialProfiles.twitter = socialProfiles.twitter;
      }
      if (socialProfiles.instagram) {
        users[userIndex].profile.socialProfiles.instagram = socialProfiles.instagram;
      }
    }

    // Handle calendar availability
    if (calendar) {
      // Initialize calendar object if it doesn't exist
      if (!users[userIndex].profile.calendar) {
        users[userIndex].profile.calendar = {
          availability: [],
          preferredDateActivities: []
        };
      }

      if (calendar.availability) {
        users[userIndex].profile.calendar.availability = calendar.availability;
      }

      if (calendar.preferredDateActivities) {
        users[userIndex].profile.calendar.preferredDateActivities = calendar.preferredDateActivities;
      }
    }

    // Handle preferences separately to avoid overwriting
    if (preferences) {
      if (preferences.genderPreference) {
        users[userIndex].profile.preferences.genderPreference = preferences.genderPreference;
      }
      if (preferences.minAge) {
        users[userIndex].profile.preferences.minAge = preferences.minAge;
      }
      if (preferences.maxAge) {
        users[userIndex].profile.preferences.maxAge = preferences.maxAge;
      }
      if (preferences.maxDistance) {
        users[userIndex].profile.preferences.maxDistance = preferences.maxDistance;
      }
    }

    writeUsers(users);

    // Return updated user data without password
    const userData = { ...users[userIndex] };
    delete userData.password;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Matching algorithm (simplified version)
const calculateCompatibilityScore = (user1, user2) => {
  let score = 0;
  const weights = {
    interests: 40,
    age: 20,
    location: 40
  };
  
  // Interest compatibility (percentage of shared interests)
  const interests1 = new Set(user1.profile.interests);
  const interests2 = new Set(user2.profile.interests);
  
  let interestScore = 0;
  if (interests1.size > 0 && interests2.size > 0) {
    const sharedInterests = [...interests1].filter(interest => interests2.has(interest));
    const union = new Set([...interests1, ...interests2]);
    interestScore = sharedInterests.length / union.size;
  }
  
  // Age compatibility (inversely proportional to age difference)
  const age1 = user1.profile.age;
  const age2 = user2.profile.age;
  const ageDifference = Math.abs(age1 - age2);
  const ageScore = Math.max(0, 1 - (ageDifference / 20)); // 20 year difference gives score of 0
  
  // Location compatibility (simplified, just exact match)
  const locationScore = user1.profile.location === user2.profile.location ? 1 : 0.5;
  
  // Calculate weighted score
  score = (interestScore * weights.interests) + 
          (ageScore * weights.age) + 
          (locationScore * weights.location);
          
  return Math.min(Math.round(score), 100);
};

// Filter user pool based on preferences
const filterUserPool = (user, userPool) => {
  return userPool.filter(potentialMatch => {
    // Skip the user themselves
    if (potentialMatch._id === user._id) return false;
    
    // Skip already liked or disliked users
    if (user.likes.includes(potentialMatch._id) || 
        user.dislikes.includes(potentialMatch._id)) return false;
    
    // Check gender preference
    const genderPrefs = user.profile.preferences.genderPreference;
    if (genderPrefs && genderPrefs.length > 0 && 
        !genderPrefs.includes(potentialMatch.profile.gender)) return false;
    
    // Check age range
    const minAge = user.profile.preferences.minAge || 18;
    const maxAge = user.profile.preferences.maxAge || 100;
    if (potentialMatch.profile.age < minAge || 
        potentialMatch.profile.age > maxAge) return false;
    
    // All basic criteria passed
    return true;
  });
};

// Get potential matches
app.get('/api/matches/potential', auth, (req, res) => {
  try {
    const users = readUsers();
    const user = findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter users based on preferences
    const userPool = users.filter(u => u._id !== user._id);
    const filteredPool = filterUserPool(user, userPool);
    
    // Calculate compatibility scores
    const potentialMatches = filteredPool.map(match => {
      const compatibilityScore = calculateCompatibilityScore(user, match);
      
      // Format response to exclude sensitive data
      return {
        _id: match._id,
        profile: {
          name: match.profile.name,
          age: match.profile.age,
          gender: match.profile.gender,
          location: match.profile.location,
          bio: match.profile.bio,
          interests: match.profile.interests,
          photos: match.profile.photos
        },
        compatibilityScore
      };
    });
    
    // Sort by compatibility score (highest first)
    potentialMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    res.json(potentialMatches);
  } catch (error) {
    console.error('Get potential matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a user
app.post('/api/matches/like/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const users = readUsers();
    
    const currentUserIndex = users.findIndex(user => user._id === req.user.userId);
    const likedUserIndex = users.findIndex(user => user._id === userId);
    
    if (currentUserIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (likedUserIndex === -1) {
      return res.status(404).json({ message: 'User to like not found' });
    }
    
    const currentUser = users[currentUserIndex];
    const likedUser = users[likedUserIndex];
    
    // Check if already liked
    if (currentUser.likes.includes(userId)) {
      return res.status(400).json({ message: 'User already liked' });
    }
    
    // Add to likes
    currentUser.likes.push(userId);
    
    // Check if this creates a match (both users liked each other)
    const isMatch = likedUser.likes.includes(currentUser._id);
    
    if (isMatch) {
      // Create a match
      currentUser.matches.push(userId);
      likedUser.matches.push(currentUser._id);
    }
    
    // Save changes
    writeUsers(users);
    
    res.json({ 
      message: isMatch ? 'Match created!' : 'User liked successfully',
      isMatch
    });
  } catch (error) {
    console.error('Like user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dislike a user
app.post('/api/matches/dislike/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const users = readUsers();
    
    const currentUserIndex = users.findIndex(user => user._id === req.user.userId);
    const dislikedUserIndex = users.findIndex(user => user._id === userId);
    
    if (currentUserIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (dislikedUserIndex === -1) {
      return res.status(404).json({ message: 'User to dislike not found' });
    }
    
    const currentUser = users[currentUserIndex];
    
    // Check if already disliked
    if (currentUser.dislikes.includes(userId)) {
      return res.status(400).json({ message: 'User already disliked' });
    }
    
    // Add to dislikes
    currentUser.dislikes.push(userId);
    
    // Save changes
    writeUsers(users);
    
    res.json({ message: 'User disliked successfully' });
  } catch (error) {
    console.error('Dislike user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get matches
app.get('/api/matches/matches', auth, (req, res) => {
  try {
    const users = readUsers();
    const user = findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get matches with minimal data
    const matches = user.matches.map(matchId => {
      const matchedUser = findUserById(matchId);
      
      if (!matchedUser) return null;
      
      return {
        _id: matchedUser._id,
        profile: {
          name: matchedUser.profile.name,
          age: matchedUser.profile.age,
          gender: matchedUser.profile.gender,
          photos: matchedUser.profile.photos
        }
      };
    }).filter(match => match !== null);
    
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create some demo users
const createDemoUsers = async () => {
  const users = readUsers();

  // Only create demo users if there are none
  if (users.length === 0) {
    try {
      // Create demo passwords
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('password123', salt);

      // Demo users
      const demoUsers = [
        {
          _id: '1',
          email: 'demo@example.com',
          password,
          profile: {
            name: 'Demo User',
            age: 25,
            gender: 'other',
            location: 'San Francisco',
            coordinates: {
              latitude: 37.7749,
              longitude: -122.4194
            },
            bio: 'Tech enthusiast and nature lover. Working in AI and looking for meaningful connections.',
            interests: ['music', 'movies', 'travel', 'hiking', 'photography', 'artificial intelligence', 'startups'],
            photos: [
              { url: 'https://randomuser.me/api/portraits/lego/1.jpg', isPrimary: true },
              { url: 'https://randomuser.me/api/portraits/lego/6.jpg', isPrimary: false }
            ],
            socialProfiles: {
              linkedin: 'https://www.linkedin.com/in/demouser/',
              twitter: '@demouser',
              instagram: '@demo.user'
            },
            calendar: {
              availability: [
                {
                  day: 'Friday',
                  timeSlots: [
                    { startTime: '19:00', endTime: '22:00' }
                  ]
                },
                {
                  day: 'Saturday',
                  timeSlots: [
                    { startTime: '10:00', endTime: '14:00' },
                    { startTime: '18:00', endTime: '22:00' }
                  ]
                },
                {
                  day: 'Sunday',
                  timeSlots: [
                    { startTime: '11:00', endTime: '18:00' }
                  ]
                }
              ],
              preferredDateActivities: ['coffee', 'dinner', 'hiking', 'museum', 'concert']
            },
            jobTitle: 'AI Research Scientist',
            company: 'TechInnovate',
            education: 'Ph.D. in Computer Science, Stanford University',
            preferences: {
              genderPreference: ['male', 'female', 'non-binary'],
              minAge: 18,
              maxAge: 40,
              maxDistance: 50
            }
          },
          matches: [],
          likes: [],
          dislikes: [],
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          email: 'alex@example.com',
          password,
          profile: {
            name: 'Alex Chen',
            age: 27,
            gender: 'non-binary',
            location: 'San Francisco',
            coordinates: {
              latitude: 37.7833,
              longitude: -122.4167
            },
            bio: 'Product designer with a passion for hiking and outdoor photography. Looking for adventurous spirits!',
            interests: ['hiking', 'photography', 'music', 'design', 'sustainability', 'cooking'],
            photos: [
              { url: 'https://randomuser.me/api/portraits/lego/2.jpg', isPrimary: true },
              { url: 'https://randomuser.me/api/portraits/lego/7.jpg', isPrimary: false }
            ],
            socialProfiles: {
              linkedin: 'https://www.linkedin.com/in/alexchen/',
              twitter: '@alexdesigns',
              instagram: '@alex.outdoors'
            },
            calendar: {
              availability: [
                {
                  day: 'Wednesday',
                  timeSlots: [
                    { startTime: '18:00', endTime: '21:00' }
                  ]
                },
                {
                  day: 'Saturday',
                  timeSlots: [
                    { startTime: '09:00', endTime: '18:00' }
                  ]
                },
                {
                  day: 'Sunday',
                  timeSlots: [
                    { startTime: '09:00', endTime: '18:00' }
                  ]
                }
              ],
              preferredDateActivities: ['hiking', 'photography', 'art gallery', 'cooking class', 'farmers market']
            },
            jobTitle: 'Senior Product Designer',
            company: 'DesignForward',
            education: 'MFA in Design, Rhode Island School of Design',
            preferences: {
              genderPreference: ['female', 'non-binary', 'other'],
              minAge: 21,
              maxAge: 35,
              maxDistance: 30
            }
          },
          matches: [],
          likes: [],
          dislikes: [],
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          email: 'jordan@example.com',
          password,
          profile: {
            name: 'Jordan Kim',
            age: 24,
            gender: 'female',
            location: 'Oakland',
            coordinates: {
              latitude: 37.8044,
              longitude: -122.2711
            },
            bio: 'Food blogger and travel writer. Always planning my next culinary adventure around the world.',
            interests: ['food', 'travel', 'reading', 'writing', 'cooking', 'wine tasting', 'cultural events'],
            photos: [
              { url: 'https://randomuser.me/api/portraits/lego/3.jpg', isPrimary: true },
              { url: 'https://randomuser.me/api/portraits/lego/8.jpg', isPrimary: false }
            ],
            socialProfiles: {
              linkedin: 'https://www.linkedin.com/in/jordankim/',
              twitter: '@jordanfoodwrites',
              instagram: '@jordan.eats.world'
            },
            calendar: {
              availability: [
                {
                  day: 'Tuesday',
                  timeSlots: [
                    { startTime: '19:00', endTime: '22:00' }
                  ]
                },
                {
                  day: 'Thursday',
                  timeSlots: [
                    { startTime: '19:00', endTime: '22:00' }
                  ]
                },
                {
                  day: 'Sunday',
                  timeSlots: [
                    { startTime: '12:00', endTime: '20:00' }
                  ]
                }
              ],
              preferredDateActivities: ['restaurant', 'wine tasting', 'cooking class', 'food festival', 'farmers market']
            },
            jobTitle: 'Food & Travel Writer',
            company: 'Culinary Adventures Magazine',
            education: 'B.A. in Journalism & Culinary Arts, UC Berkeley',
            preferences: {
              genderPreference: ['male', 'non-binary'],
              minAge: 23,
              maxAge: 30,
              maxDistance: 40
            }
          },
          matches: [],
          likes: [],
          dislikes: [],
          createdAt: new Date().toISOString()
        },
        {
          _id: '4',
          email: 'taylor@example.com',
          password,
          profile: {
            name: 'Taylor Morgan',
            age: 29,
            gender: 'male',
            location: 'San Jose',
            coordinates: {
              latitude: 37.3382,
              longitude: -121.8863
            },
            bio: 'Software engineer and coffee enthusiast. Searching for someone to debug life with.',
            interests: ['tech', 'coffee', 'movies', 'programming', 'blockchain', 'sci-fi', 'gaming'],
            photos: [
              { url: 'https://randomuser.me/api/portraits/lego/4.jpg', isPrimary: true },
              { url: 'https://randomuser.me/api/portraits/lego/9.jpg', isPrimary: false }
            ],
            socialProfiles: {
              linkedin: 'https://www.linkedin.com/in/taylormorgan/',
              twitter: '@taylorcodes',
              instagram: '@taylor.tech'
            },
            calendar: {
              availability: [
                {
                  day: 'Monday',
                  timeSlots: [
                    { startTime: '18:00', endTime: '21:00' }
                  ]
                },
                {
                  day: 'Wednesday',
                  timeSlots: [
                    { startTime: '18:00', endTime: '21:00' }
                  ]
                },
                {
                  day: 'Saturday',
                  timeSlots: [
                    { startTime: '13:00', endTime: '23:00' }
                  ]
                }
              ],
              preferredDateActivities: ['coffee', 'tech events', 'escape room', 'board games', 'coding together']
            },
            jobTitle: 'Senior Software Engineer',
            company: 'NextGen Tech',
            education: 'M.S. in Computer Science, Stanford University',
            preferences: {
              genderPreference: ['female'],
              minAge: 25,
              maxAge: 35,
              maxDistance: 50
            }
          },
          matches: [],
          likes: [],
          dislikes: [],
          createdAt: new Date().toISOString()
        },
        {
          _id: '5',
          email: 'morgan@example.com',
          password,
          profile: {
            name: 'Morgan Rivera',
            age: 26,
            gender: 'female',
            location: 'San Francisco',
            coordinates: {
              latitude: 37.7749,
              longitude: -122.4194
            },
            bio: 'Visual artist and musician looking for creative inspiration and genuine connections.',
            interests: ['art', 'music', 'photography', 'painting', 'concerts', 'galleries', 'vintage shopping'],
            photos: [
              { url: 'https://randomuser.me/api/portraits/lego/5.jpg', isPrimary: true },
              { url: 'https://randomuser.me/api/portraits/lego/10.jpg', isPrimary: false }
            ],
            socialProfiles: {
              linkedin: 'https://www.linkedin.com/in/morganrivera/',
              twitter: '@morgan_creates',
              instagram: '@morgan.art.music'
            },
            calendar: {
              availability: [
                {
                  day: 'Thursday',
                  timeSlots: [
                    { startTime: '19:00', endTime: '23:00' }
                  ]
                },
                {
                  day: 'Friday',
                  timeSlots: [
                    { startTime: '19:00', endTime: '23:00' }
                  ]
                },
                {
                  day: 'Sunday',
                  timeSlots: [
                    { startTime: '14:00', endTime: '20:00' }
                  ]
                }
              ],
              preferredDateActivities: ['art galleries', 'live music', 'museum', 'coffee', 'creative workshops']
            },
            jobTitle: 'Freelance Artist & Musician',
            company: 'Self-employed',
            education: 'BFA in Fine Arts, California College of the Arts',
            preferences: {
              genderPreference: ['male', 'other'],
              minAge: 25,
              maxAge: 38,
              maxDistance: 25
            }
          },
          matches: [],
          likes: [],
          dislikes: [],
          createdAt: new Date().toISOString()
        }
      ];
      
      writeUsers(demoUsers);
      console.log('Demo users created successfully');
    } catch (error) {
      console.error('Error creating demo users:', error);
    }
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create demo users
  await createDemoUsers();
});