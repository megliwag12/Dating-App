const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Initialize data directory
const DATA_DIR = path.join(__dirname, 'data');
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(path.join(DATA_DIR, 'users'));
fs.ensureDirSync(path.join(DATA_DIR, 'search_history'));
fs.ensureDirSync(path.join(DATA_DIR, 'chat_history'));

// JWT secret (in production this would be in environment variables)
const JWT_SECRET = 'datamatch_secret_key_2023';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Helper function to get user data file path
const getUserFile = (userId) => path.join(DATA_DIR, 'users', `${userId}.json`);

// Helper function to get user data
const getUserData = async (userId) => {
  try {
    const filePath = getUserFile(userId);
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    return null;
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
};

// Helper function to save user data
const saveUserData = async (userId, data) => {
  try {
    const filePath = getUserFile(userId);
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

// Create demo user data if it doesn't exist
const createDemoData = async () => {
  // Create admin user
  const adminUser = {
    id: 'admin123',
    email: 'admin@datamatch.com',
    password: 'password123', // In reality, this would be hashed
    name: 'Admin User',
    tagline: 'DataMatch Administrator',
    age: 30,
    gender: 'prefer-not-to-say',
    about: 'I manage the DataMatch platform and ensure everything runs smoothly.',
    interests: ['technology', 'data science', 'artificial intelligence'],
    lookingFor: 'networking',
    createdAt: new Date().toISOString(),
    profileCompletion: 100,
    stats: {
      matches: 45,
      visitors: 120,
      likes: 78
    },
    linkedin: {
      url: 'https://linkedin.com/in/datamatch-admin',
      experience: [
        {
          title: 'Platform Administrator',
          company: 'DataMatch',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: null,
          description: 'Managing the DataMatch platform and user experience.'
        },
        {
          title: 'Data Scientist',
          company: 'Tech Innovations Inc.',
          location: 'Seattle, WA',
          startDate: '2017-05',
          endDate: '2019-12',
          description: 'Worked on machine learning algorithms and data analysis.'
        }
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          startDate: '2015',
          endDate: '2017'
        },
        {
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Data Science',
          startDate: '2011',
          endDate: '2015'
        }
      ],
      skills: ['Machine Learning', 'Python', 'Data Analysis', 'SQL', 'Leadership', 'Project Management']
    },
    searchHistory: [
      {
        searchQuery: 'data science professionals',
        category: 'profession',
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        searchQuery: 'machine learning',
        category: 'interests',
        timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        searchQuery: 'San Francisco',
        category: 'location',
        timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ],
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA'
    },
    distance: 25,
    availability: [
      {
        date: '2023-05-15',
        startTime: '09:00',
        endTime: '12:00'
      },
      {
        date: '2023-05-17',
        startTime: '14:00',
        endTime: '16:00'
      }
    ],
    settings: {
      showLinkedin: true,
      showLocation: true,
      showAvailability: true,
      saveSearchHistory: true
    }
  };
  
  await saveUserData(adminUser.id, adminUser);
  
  // Create demo user
  const demoUser = {
    id: 'demo123',
    email: 'demo@datamatch.com',
    password: 'demo123', // In reality, this would be hashed
    name: 'Demo User',
    tagline: 'Exploring DataMatch',
    age: 28,
    gender: 'female',
    about: 'I\'m curious about technology and connecting with professionals in the data science field.',
    interests: ['machine learning', 'big data', 'startups', 'hiking', 'photography'],
    lookingFor: 'networking',
    createdAt: new Date().toISOString(),
    profileCompletion: 85,
    stats: {
      matches: 12,
      visitors: 45,
      likes: 23
    },
    linkedin: {
      url: 'https://linkedin.com/in/datamatch-demo',
      experience: [
        {
          title: 'Data Analyst',
          company: 'Tech Startup',
          location: 'Austin, TX',
          startDate: '2021-03',
          endDate: null,
          description: 'Analyzing user behavior and creating insights for product development.'
        },
        {
          title: 'Marketing Analyst',
          company: 'Digital Agency',
          location: 'Chicago, IL',
          startDate: '2019-06',
          endDate: '2021-02',
          description: 'Used data-driven approaches to optimize marketing campaigns.'
        }
      ],
      education: [
        {
          institution: 'University of Texas',
          degree: 'Bachelor of Business Administration',
          field: 'Marketing Analytics',
          startDate: '2015',
          endDate: '2019'
        }
      ],
      skills: ['Data Analysis', 'SQL', 'R', 'Marketing', 'Tableau', 'Communication']
    },
    searchHistory: [
      {
        searchQuery: 'tech startups',
        category: 'interests',
        timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
      },
      {
        searchQuery: 'data analyst',
        category: 'profession',
        timestamp: new Date(Date.now() - 129600000).toISOString() // 36 hours ago
      }
    ],
    location: {
      lat: 30.2672,
      lng: -97.7431,
      address: 'Austin, TX'
    },
    distance: 15,
    availability: [
      {
        date: '2023-05-20',
        startTime: '13:00',
        endTime: '15:00'
      }
    ],
    settings: {
      showLinkedin: true,
      showLocation: true,
      showAvailability: true,
      saveSearchHistory: true
    }
  };
  
  await saveUserData(demoUser.id, demoUser);
  
  // Create demo chat history
  const chatData = {
    participants: ['admin123', 'demo123'],
    messages: [
      {
        senderId: 'admin123',
        text: 'Welcome to DataMatch! How are you finding the platform so far?',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        read: true
      },
      {
        senderId: 'demo123',
        text: 'Thank you! I\'m really enjoying it. The interface is intuitive and I\'ve already connected with some interesting professionals.',
        timestamp: new Date(Date.now() - 169200000).toISOString(), // 2 days ago, 1 hour later
        read: true
      },
      {
        senderId: 'admin123',
        text: 'That\'s great to hear! Have you tried the LinkedIn integration feature?',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: true
      },
      {
        senderId: 'demo123',
        text: 'Not yet, but I plan to try it today. Does it pull in all my professional experience automatically?',
        timestamp: new Date(Date.now() - 82800000).toISOString(), // 1 day ago, 1 hour later
        read: true
      },
      {
        senderId: 'admin123',
        text: 'Yes, it pulls in your work history, education, and skills. It really helps create better matches based on professional compatibility!',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false
      }
    ]
  };
  
  await fs.writeJson(path.join(DATA_DIR, 'chat_history', 'admin123_demo123.json'), chatData, { spaces: 2 });
};

// Routes

// Register a new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if user already exists
    const users = await fs.readdir(path.join(DATA_DIR, 'users'));
    let existingUser = false;
    
    for (const user of users) {
      const userData = await fs.readJson(path.join(DATA_DIR, 'users', user));
      if (userData.email === email) {
        existingUser = true;
        break;
      }
    }
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user ID
    const userId = `user_${Date.now()}`;
    
    // Create user object
    const newUser = {
      id: userId,
      email,
      password, // In production, this would be hashed
      name,
      tagline: '',
      createdAt: new Date().toISOString(),
      profileCompletion: 20,
      stats: {
        matches: 0,
        visitors: 0,
        likes: 0
      },
      settings: {
        showLinkedin: true,
        showLocation: true,
        showAvailability: true,
        saveSearchHistory: true
      }
    };
    
    // Save user to file
    await saveUserData(userId, newUser);
    
    // Create and sign JWT
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        profileCompletion: newUser.profileCompletion
      }
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
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Find user by email
    const users = await fs.readdir(path.join(DATA_DIR, 'users'));
    let user = null;
    
    for (const userFile of users) {
      const userData = await fs.readJson(path.join(DATA_DIR, 'users', userFile));
      if (userData.email === email) {
        user = userData;
        break;
      }
    }
    
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }
    
    // Validate password (in production, this would compare hashed passwords)
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create and sign JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive information
    const { password, ...userProfile } = user;
    
    res.json(userProfile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.post('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fields that can be updated
    const updatableFields = [
      'name', 'tagline', 'age', 'gender', 'about',
      'interests', 'lookingFor', 'nicheInterests'
    ];

    // Update user fields
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Calculate profile completion
    let completionFields = 0;
    let totalFields = 8; // name, tagline, age, gender, about, interests, lookingFor, nicheInterests
    let bonusFields = 0;

    if (user.name) completionFields++;
    if (user.tagline) completionFields++;
    if (user.age) completionFields++;
    if (user.gender) completionFields++;
    if (user.about) completionFields++;
    if (user.interests && user.interests.length > 0) completionFields++;
    if (user.lookingFor) completionFields++;
    if (user.nicheInterests && user.nicheInterests.length > 0) completionFields++;

    // Bonus points for having additional data
    if (user.linkedin && user.linkedin.experience && user.linkedin.experience.length > 0) bonusFields++;
    if (user.linkedin && user.linkedin.education && user.linkedin.education.length > 0) bonusFields++;
    if (user.location && user.location.lat && user.location.lng) bonusFields++;
    if (user.availability && user.availability.length > 0) bonusFields++;

    // Calculate percentage including bonus (max 100%)
    const baseCompletion = Math.round((completionFields / totalFields) * 80); // Basic info is 80% max
    const bonusCompletion = Math.round((bonusFields / 4) * 20); // Bonus info is 20% max

    user.profileCompletion = Math.min(100, baseCompletion + bonusCompletion);

    // Save updated user
    await saveUserData(user.id, user);

    // Remove sensitive information
    const { password, ...userProfile } = user;

    res.json(userProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LinkedIn profile integration
app.post('/api/users/linkedin', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Now we accept both manual LinkedIn profile data entry or a LinkedIn URL
    const { linkedinUrl, manualData } = req.body;

    let linkedinData = null;

    if (manualData) {
      // Use the manually entered data
      linkedinData = {
        url: manualData.url || '',
        experience: manualData.experience || [],
        education: manualData.education || [],
        skills: manualData.skills || []
      };
    } else if (linkedinUrl) {
      // For a real app, this would use the LinkedIn API
      // Since we don't have LinkedIn API access, we'll use the URL to extract the username
      // and generate some plausible data based on that

      let username = 'user';
      try {
        // Try to extract username from URL
        const urlParts = linkedinUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        if (lastPart && lastPart !== 'in' && lastPart.length > 0) {
          username = lastPart;
        }
      } catch (e) {
        console.error('Error parsing LinkedIn URL:', e);
      }

      // Generate variation based on username
      const hashCode = str => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      };

      const hash = hashCode(username);

      // List of possible job titles, companies, and skills
      const jobTitles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
                         'Marketing Specialist', 'Business Analyst', 'Project Manager', 'Content Creator',
                         'Financial Analyst', 'Human Resources Specialist'];

      const companies = ['Tech Solutions Inc.', 'Digital Innovations', 'Data Analytics Co.', 'Creative Design Agency',
                        'Marketing Experts Ltd', 'Business Consulting Group', 'Project Management Inc.',
                        'Content Productions', 'Financial Services Corp', 'HR Solutions'];

      const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL',
                         'Boston, MA', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Portland, OR'];

      const schools = ['University of Technology', 'State University', 'Tech Institute', 'Liberal Arts College',
                       'City University', 'Online University', 'Community College', 'International University',
                       'Technical College', 'Business School'];

      const degrees = ['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Arts',
                      'Master of Business Administration', 'Associate Degree', 'Ph.D.', 'Certificate',
                      'Diploma', 'Professional Certification'];

      const fields = ['Computer Science', 'Business Administration', 'Data Science', 'Design',
                     'Marketing', 'Finance', 'Project Management', 'Communications',
                     'Psychology', 'Engineering'];

      const allSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker',
                         'Marketing', 'SEO', 'Social Media', 'Project Management', 'Agile',
                         'UI/UX Design', 'Photoshop', 'Illustrator', 'Data Analysis',
                         'Machine Learning', 'Leadership', 'Communication', 'Teamwork',
                         'Financial Analysis', 'Accounting', 'HR Management', 'Recruiting'];

      // Select items based on hash
      const getItem = (array, offset = 0) => array[(hash + offset) % array.length];

      // Select random skills (between 5-10)
      const numSkills = 5 + (hash % 6);
      const skills = [];
      for (let i = 0; i < numSkills; i++) {
        const skill = getItem(allSkills, i * 100);
        if (!skills.includes(skill)) {
          skills.push(skill);
        }
      }

      // Create 1-3 experiences
      const numExperiences = 1 + (hash % 3);
      const experiences = [];

      for (let i = 0; i < numExperiences; i++) {
        // Calculate dates with most recent first
        const endYear = 2023 - i;
        const endMonth = ((hash + i * 10) % 12) + 1;
        const duration = 6 + (hash % 36); // 6 months to 3.5 years
        const startMonth = ((endMonth - 1 - duration) % 12) + 1;
        const startYear = endYear - Math.floor((endMonth - 1 + duration) / 12);

        experiences.push({
          title: getItem(jobTitles, i),
          company: getItem(companies, i),
          location: getItem(locations, i),
          startDate: `${startYear}-${String(startMonth).padStart(2, '0')}`,
          endDate: i === 0 ? null : `${endYear}-${String(endMonth).padStart(2, '0')}`,
          description: `Working on various ${getItem(skills, i * 10)} and ${getItem(skills, i * 20)} projects.`
        });
      }

      // Create 1-2 education entries
      const numEducation = 1 + (hash % 2);
      const education = [];

      for (let i = 0; i < numEducation; i++) {
        const endYear = 2015 - i * 4;
        const startYear = endYear - 4;

        education.push({
          institution: getItem(schools, i),
          degree: getItem(degrees, i),
          field: getItem(fields, i),
          startDate: String(startYear),
          endDate: String(endYear)
        });
      }

      linkedinData = {
        url: linkedinUrl,
        experience: experiences,
        education: education,
        skills: skills
      };
    } else {
      return res.status(400).json({ message: 'Either LinkedIn URL or manual data is required' });
    }

    // Save LinkedIn data to user profile
    user.linkedin = linkedinData;

    // Update profile completion if it's the first time adding LinkedIn
    if (user.profileCompletion < 100) {
      user.profileCompletion = Math.min(100, user.profileCompletion + 10);
    }

    // Save updated user
    await saveUserData(user.id, user);

    res.json({ linkedin: linkedinData });
  } catch (error) {
    console.error('LinkedIn profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get LinkedIn profile data
app.get('/api/users/linkedin', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.linkedin) {
      return res.status(404).json({ message: 'LinkedIn profile not found' });
    }
    
    res.json({ linkedin: user.linkedin });
  } catch (error) {
    console.error('LinkedIn profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record search history
app.post('/api/users/search-history', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { searchQuery, category = 'general' } = req.body;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Check if user has opted to save search history
    if (user.settings && user.settings.saveSearchHistory === false) {
      return res.json({ message: 'Search history saving is disabled' });
    }
    
    // Create search record
    const searchRecord = {
      searchQuery,
      category,
      timestamp: new Date().toISOString()
    };
    
    // Initialize search history array if it doesn't exist
    if (!user.searchHistory) {
      user.searchHistory = [];
    }
    
    // Add search to user history
    user.searchHistory.push(searchRecord);
    
    // Limit history to last 50 searches
    if (user.searchHistory.length > 50) {
      user.searchHistory = user.searchHistory.slice(-50);
    }
    
    // Save updated user
    await saveUserData(user.id, user);
    
    // Also save to global search history for analytics
    const searchHistoryFile = path.join(DATA_DIR, 'search_history', `${new Date().toISOString().split('T')[0]}.json`);
    let dailySearches = [];
    
    if (await fs.pathExists(searchHistoryFile)) {
      dailySearches = await fs.readJson(searchHistoryFile);
    }
    
    dailySearches.push({
      userId: user.id,
      ...searchRecord
    });
    
    await fs.writeJson(searchHistoryFile, dailySearches, { spaces: 2 });
    
    res.json({ message: 'Search history recorded' });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get search history
app.get('/api/users/search-history', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.searchHistory) {
      return res.json({ 
        searchHistory: [],
        analytics: generateEmptyAnalytics()
      });
    }
    
    // Generate analytics from search history
    const analytics = generateSearchAnalytics(user.searchHistory);
    
    res.json({
      searchHistory: user.searchHistory,
      analytics
    });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate search analytics
function generateSearchAnalytics(searchHistory) {
  if (!searchHistory || searchHistory.length === 0) {
    return generateEmptyAnalytics();
  }
  
  // Get top categories
  const categories = {};
  searchHistory.forEach(search => {
    const category = search.category || 'general';
    categories[category] = (categories[category] || 0) + 1;
  });
  
  const topCategories = Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get common terms
  const terms = {};
  searchHistory.forEach(search => {
    const words = search.searchQuery.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length >= 3) {
        terms[word] = (terms[word] || 0) + 1;
      }
    });
  });
  
  const commonTerms = Object.entries(terms)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Calculate recent activity
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const thisWeekStart = today - (now.getDay() * 86400000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  
  const recentActivity = {
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  };
  
  searchHistory.forEach(search => {
    const searchDate = new Date(search.timestamp).getTime();
    
    if (searchDate >= today) {
      recentActivity.today++;
    }
    
    if (searchDate >= thisWeekStart) {
      recentActivity.thisWeek++;
    }
    
    if (searchDate >= thisMonthStart) {
      recentActivity.thisMonth++;
    }
  });
  
  return {
    topCategories,
    commonTerms,
    recentActivity
  };
}

function generateEmptyAnalytics() {
  return {
    topCategories: [],
    commonTerms: [],
    recentActivity: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  };
}

// Clear search history
app.delete('/api/users/search-history', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear search history
    user.searchHistory = [];
    
    // Save updated user
    await saveUserData(user.id, user);
    
    res.json({ message: 'Search history cleared' });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update search history settings
app.post('/api/users/settings/search-history', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { saveSearchHistory } = req.body;
    
    if (saveSearchHistory === undefined) {
      return res.status(400).json({ message: 'saveSearchHistory setting is required' });
    }
    
    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }
    
    user.settings.saveSearchHistory = Boolean(saveSearchHistory);
    
    // Save updated user
    await saveUserData(user.id, user);
    
    res.json({ 
      message: `Search history saving ${user.settings.saveSearchHistory ? 'enabled' : 'disabled'}`,
      settings: user.settings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update chat conversation
app.post('/api/users/chat', auth, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    
    if (!recipientId || !message) {
      return res.status(400).json({ message: 'Recipient ID and message are required' });
    }
    
    const user = await getUserData(req.user.id);
    const recipient = await getUserData(recipientId);
    
    if (!user || !recipient) {
      return res.status(404).json({ message: 'User or recipient not found' });
    }
    
    // Create message object
    const messageObj = {
      senderId: user.id,
      text: message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Sort IDs to create consistent conversation ID
    const participants = [user.id, recipientId].sort();
    const conversationId = participants.join('_');
    const chatFile = path.join(DATA_DIR, 'chat_history', `${conversationId}.json`);
    
    // Check if conversation exists
    let conversation = { participants, messages: [] };
    
    if (await fs.pathExists(chatFile)) {
      conversation = await fs.readJson(chatFile);
    }
    
    // Add message to conversation
    conversation.messages.push(messageObj);
    
    // Save conversation
    await fs.writeJson(chatFile, conversation, { spaces: 2 });
    
    res.json({ message: 'Message sent' });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat history with a specific user
app.get('/api/users/chat/:recipientId', auth, async (req, res) => {
  try {
    const { recipientId } = req.params;
    
    const user = await getUserData(req.user.id);
    const recipient = await getUserData(recipientId);
    
    if (!user || !recipient) {
      return res.status(404).json({ message: 'User or recipient not found' });
    }
    
    // Sort IDs to create consistent conversation ID
    const participants = [user.id, recipientId].sort();
    const conversationId = participants.join('_');
    const chatFile = path.join(DATA_DIR, 'chat_history', `${conversationId}.json`);
    
    // Check if conversation exists
    let messages = [];
    
    if (await fs.pathExists(chatFile)) {
      const conversation = await fs.readJson(chatFile);
      messages = conversation.messages.map(msg => ({
        ...msg,
        isFromCurrentUser: msg.senderId === user.id
      }));
    }
    
    // Get recipient info
    const recipientInfo = {
      id: recipient.id,
      name: recipient.name,
      avatar: recipient.avatar || null,
      online: Math.random() > 0.5 // Random online status for demo
    };
    
    res.json({
      messages,
      recipientInfo
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get list of conversations
app.get('/api/users/conversations', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all chat files
    const chatFiles = await fs.readdir(path.join(DATA_DIR, 'chat_history'));
    const conversations = [];
    
    // Find conversations involving the current user
    for (const file of chatFiles) {
      const conversationId = file.replace('.json', '');
      const participants = conversationId.split('_');
      
      if (participants.includes(user.id)) {
        const conversation = await fs.readJson(path.join(DATA_DIR, 'chat_history', file));
        
        // Get the other participant
        const recipientId = participants[0] === user.id ? participants[1] : participants[0];
        const recipient = await getUserData(recipientId);
        
        if (recipient) {
          // Get the last message
          const lastMessage = conversation.messages[conversation.messages.length - 1] || {};
          
          // Count unread messages
          const unreadCount = conversation.messages.filter(
            msg => msg.senderId !== user.id && !msg.read
          ).length;
          
          conversations.push({
            recipientId,
            recipientName: recipient.name,
            recipientAvatar: recipient.avatar || null,
            lastMessage: lastMessage.text || '',
            lastMessageDate: lastMessage.timestamp || '',
            unreadCount,
            online: Math.random() > 0.5 // Random online status for demo
          });
        }
      }
    }
    
    res.json({ conversations });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
app.post('/api/users/chat/:recipientId/read', auth, async (req, res) => {
  try {
    const { recipientId } = req.params;
    
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Sort IDs to create consistent conversation ID
    const participants = [user.id, recipientId].sort();
    const conversationId = participants.join('_');
    const chatFile = path.join(DATA_DIR, 'chat_history', `${conversationId}.json`);
    
    // Check if conversation exists
    if (await fs.pathExists(chatFile)) {
      const conversation = await fs.readJson(chatFile);
      
      // Mark messages from recipient as read
      conversation.messages = conversation.messages.map(msg => {
        if (msg.senderId === recipientId && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });
      
      // Save updated conversation
      await fs.writeJson(chatFile, conversation, { spaces: 2 });
    }
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save user location
app.post('/api/users/location', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { location, distance, showLocation, coords, preferences, frequentLocations } = req.body;

    // If browser geolocation coordinates are provided, use them for primary location
    if (coords && coords.latitude && coords.longitude) {
      // Create or update location object
      if (!user.location) {
        user.location = {};
      }

      user.location.lat = coords.latitude;
      user.location.lng = coords.longitude;
      user.location.type = "primary";
      user.location.lastUpdated = new Date().toISOString();

      // Try to get address from coordinates using reverse geocoding
      // In a real app, you would use a geocoding service like Google Maps or Mapbox
      // For this demo, we'll generate a plausible address based on the coordinates

      // Generate a plausible city based on coordinates
      const cities = {
        // US cities with approximate coordinates
        "New York": { lat: 40.7128, lng: -74.0060 },
        "Los Angeles": { lat: 34.0522, lng: -118.2437 },
        "Chicago": { lat: 41.8781, lng: -87.6298 },
        "Houston": { lat: 29.7604, lng: -95.3698 },
        "Phoenix": { lat: 33.4484, lng: -112.0740 },
        "Philadelphia": { lat: 39.9526, lng: -75.1652 },
        "San Antonio": { lat: 29.4241, lng: -98.4936 },
        "San Diego": { lat: 32.7157, lng: -117.1611 },
        "Dallas": { lat: 32.7767, lng: -96.7970 },
        "San Francisco": { lat: 37.7749, lng: -122.4194 },
        "Austin": { lat: 30.2672, lng: -97.7431 },
        "Seattle": { lat: 47.6062, lng: -122.3321 },
        "Denver": { lat: 39.7392, lng: -104.9903 },
        "Boston": { lat: 42.3601, lng: -71.0589 },
        "Portland": { lat: 45.5051, lng: -122.6750 }
      };

      // Find the closest city
      let closestCity = "Unknown Location";
      let minDistance = Number.MAX_VALUE;

      for (const [city, cityCoords] of Object.entries(cities)) {
        const distance = Math.sqrt(
          Math.pow(coords.latitude - cityCoords.lat, 2) +
          Math.pow(coords.longitude - cityCoords.lng, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }

      // Generate a random street address
      const streetNumbers = ["123", "456", "789", "1024", "2048", "555", "777", "888", "999", "101"];
      const streetNames = ["Main St", "Oak Ave", "Maple Rd", "Pine Ln", "Cedar Blvd", "Washington Ave", "Franklin St", "Jefferson Rd", "Madison Ave", "Lincoln Blvd"];

      // Use a hash of the coordinates to select consistent street info
      const hashCode = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      };

      const coordStr = `${coords.latitude},${coords.longitude}`;
      const hash = hashCode(coordStr);

      const streetNumber = streetNumbers[hash % streetNumbers.length];
      const streetName = streetNames[(hash + 1) % streetNames.length];

      // Make this street + city
      const address = `${closestCity}, ${streetNumber} ${streetName}`;
      user.location.address = address;
      user.location.city = closestCity;
      user.location.formattedAddress = address;
    } else if (location) {
      // Manual location update
      user.location = {
        ...location,
        type: "manual",
        lastUpdated: new Date().toISOString()
      };
    }

    // Update frequent locations if provided
    if (frequentLocations && Array.isArray(frequentLocations) && frequentLocations.length > 0) {
      // Initialize or update frequent locations array
      if (!user.frequentLocations) {
        user.frequentLocations = [];
      }

      // Add new locations, avoiding duplicates
      frequentLocations.forEach(newLocation => {
        if (!newLocation.lat || !newLocation.lng || !newLocation.name) {
          return; // Skip invalid locations
        }

        // Check if this location already exists (based on coords)
        const exists = user.frequentLocations.some(loc =>
          loc.lat === newLocation.lat &&
          loc.lng === newLocation.lng
        );

        if (!exists) {
          user.frequentLocations.push({
            ...newLocation,
            added: new Date().toISOString()
          });
        }
      });

      // Limit to maximum 10 frequent locations
      if (user.frequentLocations.length > 10) {
        user.frequentLocations = user.frequentLocations.slice(-10);
      }
    }

    // Update location preferences
    if (preferences) {
      if (!user.locationPreferences) {
        user.locationPreferences = {};
      }

      user.locationPreferences = {
        ...user.locationPreferences,
        ...preferences
      };
    }

    // Update distance preference
    if (distance !== undefined) {
      user.distance = parseInt(distance) || 25;

      // Store in preferences too for consistency
      if (!user.locationPreferences) {
        user.locationPreferences = {};
      }
      user.locationPreferences.maxDistance = user.distance;
    }

    // Update visibility settings
    if (showLocation !== undefined) {
      if (!user.settings) {
        user.settings = {};
      }
      user.settings.showLocation = Boolean(showLocation);
    }

    // Save updated user
    await saveUserData(user.id, user);

    res.json({
      message: 'Location settings updated',
      location: user.location,
      frequentLocations: user.frequentLocations || [],
      preferences: user.locationPreferences || {},
      distance: user.distance,
      showLocation: user.settings?.showLocation
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user location
app.get('/api/users/location', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      location: user.location || null,
      frequentLocations: user.frequentLocations || [],
      preferences: user.locationPreferences || {},
      distance: user.distance || 25,
      showLocation: user.settings?.showLocation !== false
    });
  } catch (error) {
    console.error('Location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get locations of potential matches
app.get('/api/locations/matches', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { maxDistance } = req.query;
    const maxDistanceValue = parseInt(maxDistance) || user.distance || 25;

    // Get all user files
    const userFiles = await fs.readdir(path.join(DATA_DIR, 'users'));
    const matchLocations = [];

    // User needs to have a location to find nearby matches
    if (!user.location || !user.location.lat || !user.location.lng) {
      return res.status(400).json({ message: 'You need to set your location first' });
    }

    // Loop through all users
    for (const file of userFiles) {
      const userId = file.replace('.json', '');

      // Skip current user
      if (userId === user.id) continue;

      const otherUser = await getUserData(userId);

      // Skip users with no location or who don't want to share it
      if (!otherUser || !otherUser.location || !otherUser.location.lat || !otherUser.location.lng ||
          (otherUser.settings && otherUser.settings.showLocation === false)) {
        continue;
      }

      // Calculate distance between users
      const distance = calculateDistance(
        user.location.lat, user.location.lng,
        otherUser.location.lat, otherUser.location.lng
      );

      // Only include users within the max distance
      if (distance <= maxDistanceValue) {
        matchLocations.push({
          userId: otherUser.id,
          name: otherUser.name,
          location: {
            lat: otherUser.location.lat,
            lng: otherUser.location.lng,
            address: otherUser.location.address,
            city: otherUser.location.city || otherUser.location.address.split(',')[0].trim()
          },
          distance: Math.round(distance),
          compatibility: calculateCompatibilityScore(user, otherUser)
        });
      }
    }

    res.json({ matchLocations });
  } catch (error) {
    console.error('Match locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  const distanceMiles = distanceKm * 0.621371;

  return distanceMiles;
}

// Helper function to calculate simple compatibility score
function calculateCompatibilityScore(user1, user2) {
  let score = 0;
  let factors = 0;

  // Check interests
  if (user1.interests && user2.interests &&
      Array.isArray(user1.interests) && Array.isArray(user2.interests) &&
      user1.interests.length > 0 && user2.interests.length > 0) {

    const user1Interests = new Set(user1.interests.map(i => i.toLowerCase()));
    const user2Interests = user2.interests.map(i => i.toLowerCase());

    let matchCount = 0;
    for (const interest of user2Interests) {
      if (user1Interests.has(interest)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const maxInterests = Math.max(user1Interests.size, user2Interests.length);
      score += (matchCount / maxInterests) * 100;
      factors++;
    }
  }

  // Check niche interests
  if (user1.nicheInterests && user2.nicheInterests) {
    // Handle both array and object format
    const u1Niche = Array.isArray(user1.nicheInterests) ? user1.nicheInterests :
                    flattenNicheInterests(user1.nicheInterests);
    const u2Niche = Array.isArray(user2.nicheInterests) ? user2.nicheInterests :
                    flattenNicheInterests(user2.nicheInterests);

    if (u1Niche.length > 0 && u2Niche.length > 0) {
      const u1Set = new Set(u1Niche.map(i => i.toLowerCase()));
      const u2List = u2Niche.map(i => i.toLowerCase());

      let matchCount = 0;
      for (const interest of u2List) {
        if (u1Set.has(interest)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const maxInterests = Math.max(u1Set.size, u2List.length);
        score += (matchCount / maxInterests) * 100;
        factors++;
      }
    }
  }

  // Return average score or 0 if no factors matched
  return factors > 0 ? Math.round(score / factors) : 0;
}

// Helper function to flatten niche interests from object format
function flattenNicheInterests(nicheObj) {
  if (Array.isArray(nicheObj)) return nicheObj;

  const flattened = [];
  for (const category of nicheObj) {
    if (category.interests && Array.isArray(category.interests)) {
      flattened.push(...category.interests);
    }
  }
  return flattened;
}

// Update location settings
app.post('/api/users/settings/location', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { showLocation } = req.body;
    
    if (showLocation === undefined) {
      return res.status(400).json({ message: 'showLocation setting is required' });
    }
    
    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }
    
    user.settings.showLocation = Boolean(showLocation);
    
    // Save updated user
    await saveUserData(user.id, user);
    
    res.json({ 
      message: `Location sharing ${user.settings.showLocation ? 'enabled' : 'disabled'}`,
      settings: user.settings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save availability
app.post('/api/users/availability', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { availability, preferences, recurring } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability data is required and must be an array' });
    }

    // Initialize availability array if it doesn't exist
    if (!user.availability) {
      user.availability = [];
    }

    // Handle recurring availability if provided
    if (recurring && recurring.pattern) {
      // Generate recurring dates based on pattern
      const recurringSlots = generateRecurringAvailability(recurring);

      // Merge with existing availability
      if (recurringSlots.length > 0) {
        // Add new recurring slots
        user.availability = [
          ...user.availability,
          ...recurringSlots
        ];
      }
    } else {
      // Regular one-time availability slots
      user.availability = [
        ...user.availability,
        ...availability.filter(slot => slot.date && slot.startTime && slot.endTime)
      ];
    }

    // Remove any duplicate slots
    user.availability = removeDuplicateSlots(user.availability);

    // Update availability preferences if provided
    if (preferences) {
      if (!user.availabilityPreferences) {
        user.availabilityPreferences = {};
      }

      // Update preferences
      user.availabilityPreferences = {
        ...user.availabilityPreferences,
        ...preferences
      };
    }

    // Save updated user
    await saveUserData(user.id, user);

    res.json({
      message: 'Availability updated',
      availability: user.availability,
      preferences: user.availabilityPreferences || {}
    });
  } catch (error) {
    console.error('Availability update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get availability
app.get('/api/users/availability', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter for future availability only if requested
    let availability = user.availability || [];
    if (req.query.futureOnly === 'true') {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      availability = availability.filter(slot => {
        // Keep slots for today or future dates
        if (slot.date > today) return true;

        // For today, check if the slot's end time is in the future
        if (slot.date === today) {
          const slotEndTime = new Date(`${slot.date}T${slot.endTime}`);
          return slotEndTime > now;
        }

        return false;
      });
    }

    res.json({
      availability: availability,
      preferences: user.availabilityPreferences || {},
      showAvailability: user.settings?.showAvailability !== false
    });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an availability slot
app.delete('/api/users/availability/:slotId', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { slotId } = req.params;

    if (!user.availability) {
      return res.status(404).json({ message: 'No availability slots found' });
    }

    // Remove the specified slot
    const originalLength = user.availability.length;
    user.availability = user.availability.filter((slot, index) => index.toString() !== slotId);

    if (user.availability.length === originalLength) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Save updated user
    await saveUserData(user.id, user);

    res.json({
      message: 'Availability slot deleted',
      availability: user.availability
    });
  } catch (error) {
    console.error('Availability delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate recurring availability
function generateRecurringAvailability(recurring) {
  const { pattern, startDate, endDate, times, weekdays } = recurring;

  if (!pattern || !startDate || !times || !times.length) {
    return [];
  }

  const slots = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start);
  end.setMonth(end.getMonth() + 3); // Default to 3 months if no end date

  if (pattern === 'weekly' && weekdays && weekdays.length) {
    // Generate weekly slots for the specified weekdays
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Check if this weekday is included
      if (weekdays.includes(dayOfWeek)) {
        // Add slots for each time range for this day
        times.forEach(time => {
          if (time.startTime && time.endTime) {
            slots.push({
              date: currentDate.toISOString().split('T')[0],
              startTime: time.startTime,
              endTime: time.endTime,
              recurring: true
            });
          }
        });
      }

      // Advance to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (pattern === 'monthly') {
    // Generate monthly slots on the same day of month
    const dayOfMonth = start.getDate();
    const currentDate = new Date(start);

    while (currentDate <= end) {
      // Add slots for each time range for this day
      times.forEach(time => {
        if (time.startTime && time.endTime) {
          slots.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: time.startTime,
            endTime: time.endTime,
            recurring: true
          });
        }
      });

      // Advance to next month
      currentDate.setMonth(currentDate.getMonth() + 1);

      // Handle edge cases for months with different lengths
      if (currentDate.getDate() !== dayOfMonth) {
        currentDate.setDate(0); // Last day of previous month
      }
    }
  }

  return slots;
}

// Helper function to remove duplicate availability slots
function removeDuplicateSlots(slots) {
  const seen = new Set();
  return slots.filter(slot => {
    const key = `${slot.date}-${slot.startTime}-${slot.endTime}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Update availability settings
app.post('/api/users/settings/availability', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { showAvailability } = req.body;

    if (showAvailability === undefined) {
      return res.status(400).json({ message: 'showAvailability setting is required' });
    }

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }

    user.settings.showAvailability = Boolean(showAvailability);

    // Save updated user
    await saveUserData(user.id, user);

    res.json({
      message: `Availability sharing ${user.settings.showAvailability ? 'enabled' : 'disabled'}`,
      settings: user.settings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Niche interests management
app.post('/api/users/niche-interests', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { nicheInterests, category } = req.body;

    if (!nicheInterests || !Array.isArray(nicheInterests)) {
      return res.status(400).json({ message: 'Niche interests must be provided as an array' });
    }

    // Initialize niche interests if it doesn't exist
    if (!user.nicheInterests) {
      user.nicheInterests = [];
    }

    // If a category is specified, either add to that category or create it
    if (category) {
      // Check if the category already exists
      let categoryExists = false;
      user.nicheInterests = user.nicheInterests.map(item => {
        if (item.category === category) {
          categoryExists = true;
          return {
            category,
            interests: [...new Set([...item.interests, ...nicheInterests])] // Unique interests only
          };
        }
        return item;
      });

      // If category doesn't exist, add it
      if (!categoryExists) {
        user.nicheInterests.push({
          category,
          interests: nicheInterests
        });
      }
    } else {
      // Just add all interests as a flat array if no category is specified
      user.nicheInterests = [...new Set([...user.nicheInterests, ...nicheInterests])];
    }

    // Recalculate profile completion
    let completionFields = 0;
    let totalFields = 8; // name, tagline, age, gender, about, interests, lookingFor, nicheInterests
    let bonusFields = 0;

    if (user.name) completionFields++;
    if (user.tagline) completionFields++;
    if (user.age) completionFields++;
    if (user.gender) completionFields++;
    if (user.about) completionFields++;
    if (user.interests && user.interests.length > 0) completionFields++;
    if (user.lookingFor) completionFields++;
    if (user.nicheInterests && (Array.isArray(user.nicheInterests) ?
        user.nicheInterests.length > 0 : Object.keys(user.nicheInterests).length > 0)) {
      completionFields++;
    }

    // Bonus points for having additional data
    if (user.linkedin && user.linkedin.experience && user.linkedin.experience.length > 0) bonusFields++;
    if (user.linkedin && user.linkedin.education && user.linkedin.education.length > 0) bonusFields++;
    if (user.location && user.location.lat && user.location.lng) bonusFields++;
    if (user.availability && user.availability.length > 0) bonusFields++;

    // Calculate percentage including bonus (max 100%)
    const baseCompletion = Math.round((completionFields / totalFields) * 80); // Basic info is 80% max
    const bonusCompletion = Math.round((bonusFields / 4) * 20); // Bonus info is 20% max

    user.profileCompletion = Math.min(100, baseCompletion + bonusCompletion);

    // Save updated user
    await saveUserData(user.id, user);

    res.json({
      message: 'Niche interests updated',
      nicheInterests: user.nicheInterests
    });
  } catch (error) {
    console.error('Niche interests update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get niche interests
app.get('/api/users/niche-interests', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      nicheInterests: user.nicheInterests || []
    });
  } catch (error) {
    console.error('Niche interests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update LinkedIn visibility settings
app.post('/api/users/settings/linkedin', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { showLinkedin } = req.body;
    
    if (showLinkedin === undefined) {
      return res.status(400).json({ message: 'showLinkedin setting is required' });
    }
    
    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }
    
    user.settings.showLinkedin = Boolean(showLinkedin);
    
    // Save updated user
    await saveUserData(user.id, user);
    
    res.json({ 
      message: `LinkedIn profile sharing ${user.settings.showLinkedin ? 'enabled' : 'disabled'}`,
      settings: user.settings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search for matches
app.post('/api/matches/search', auth, async (req, res) => {
  try {
    const {
      query,
      category,
      distance,
      includeNicheInterests = true,
      prioritizeAvailability = false,
      minCompatibility = 0,
      filterOptions = {}
    } = req.body;

    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all users
    const userFiles = await fs.readdir(path.join(DATA_DIR, 'users'));
    const matches = [];

    for (const file of userFiles) {
      const userId = file.replace('.json', '');

      // Skip current user
      if (userId === user.id) continue;

      const potentialMatch = await getUserData(userId);

      if (!potentialMatch) continue;

      // Check filters before spending time on calculations
      if (!passesFilters(potentialMatch, filterOptions)) {
        continue;
      }

      // Calculate initial match score
      let matchScore = 0;
      let matchReason = '';
      const matchDetails = {}; // For storing detailed compatibility breakdown

      // First, we'll apply any specific search query filters
      if (query) {
        const searchTerm = query.toLowerCase();
        matchScore = calculateQueryMatch(user, potentialMatch, searchTerm, category, matchDetails);

        if (matchScore > 0 && !matchReason) {
          // Set a reason based on where the match was found
          if (matchDetails.matchedInterests && matchDetails.matchedInterests.length > 0) {
            matchReason = `Shares interests in: ${matchDetails.matchedInterests.slice(0, 3).join(', ')}${matchDetails.matchedInterests.length > 3 ? '...' : ''}`;
          } else if (matchDetails.matchedProfessional) {
            matchReason = matchDetails.matchedProfessional;
          } else if (matchDetails.matchedLocation) {
            matchReason = matchDetails.matchedLocation;
          } else if (matchDetails.matchedNicheInterests && matchDetails.matchedNicheInterests.length > 0) {
            matchReason = `Shares niche interests in: ${matchDetails.matchedNicheInterests.slice(0, 3).join(', ')}${matchDetails.matchedNicheInterests.length > 3 ? '...' : ''}`;
          } else {
            matchReason = `Matched your search for "${query}"`;
          }
        }
      } else {
        // If no specific query, calculate comprehensive compatibility score
        const scores = calculateFullCompatibility(user, potentialMatch, {
          includeNicheInterests,
          prioritizeAvailability
        });

        // Extract scores and details
        matchScore = scores.totalScore;
        matchReason = scores.primaryReason;
        Object.assign(matchDetails, scores.details);
      }

      // Distance filtering
      let distanceMiles = Infinity;
      let withinDistance = true;
      if (user.location && user.location.lat && user.location.lng &&
          potentialMatch.location && potentialMatch.location.lat && potentialMatch.location.lng) {

        // Calculate distance using our helper function
        distanceMiles = calculateDistance(
          user.location.lat, user.location.lng,
          potentialMatch.location.lat, potentialMatch.location.lng
        );

        // Check if within specified distance (from parameters or user settings)
        const maxDistance = distance || user.distance || 50;
        withinDistance = distanceMiles <= maxDistance;
      }

      // Only include users with sufficient match score and within distance (if specified)
      if (matchScore >= minCompatibility && withinDistance) {
        // Remove sensitive data
        const { password, searchHistory, settings, ...matchData } = potentialMatch;

        // Round match score
        matchScore = Math.min(100, Math.round(matchScore));

        matches.push({
          ...matchData,
          matchScore,
          matchReason,
          matchDetails,
          distance: Math.round(distanceMiles)
        });
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      matches,
      totalMatches: matches.length,
      filters: {
        includeNicheInterests,
        prioritizeAvailability,
        minCompatibility,
        distance: distance || user.distance || 50,
        ...filterOptions
      }
    });
  } catch (error) {
    console.error('Match search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get advanced match suggestions
app.get('/api/matches/suggestions', auth, async (req, res) => {
  try {
    const user = await getUserData(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get parameters
    const { count = 5, includeDetails = true } = req.query;
    const maxResults = Math.min(parseInt(count) || 5, 20); // Limit to 20 max

    // Get all users
    const userFiles = await fs.readdir(path.join(DATA_DIR, 'users'));
    const allMatches = [];

    // Keep track of different match types
    const matchTypes = {
      locationBased: [],
      availabilityBased: [],
      professionalBased: [],
      nicheInterestBased: []
    };

    for (const file of userFiles) {
      const userId = file.replace('.json', '');

      // Skip current user
      if (userId === user.id) continue;

      const potentialMatch = await getUserData(userId);
      if (!potentialMatch) continue;

      // Calculate specialized match scores
      const locationScore = calculateLocationCompatibility(user, potentialMatch);
      const availabilityScore = calculateAvailabilityCompatibility(user, potentialMatch);
      const professionalScore = calculateProfessionalCompatibility(user, potentialMatch);
      const nicheInterestScore = calculateNicheInterestCompatibility(user, potentialMatch);

      // Store matches by type if above threshold
      if (locationScore.score > 70) {
        matchTypes.locationBased.push({
          userId: potentialMatch.id,
          name: potentialMatch.name,
          score: locationScore.score,
          reason: locationScore.reason,
          details: includeDetails ? 'locationDetails' : null
        });
      }

      if (availabilityScore.score > 70) {
        matchTypes.availabilityBased.push({
          userId: potentialMatch.id,
          name: potentialMatch.name,
          score: availabilityScore.score,
          reason: availabilityScore.reason,
          details: includeDetails ? 'availabilityDetails' : null
        });
      }

      if (professionalScore.score > 70) {
        matchTypes.professionalBased.push({
          userId: potentialMatch.id,
          name: potentialMatch.name,
          score: professionalScore.score,
          reason: professionalScore.reason,
          details: includeDetails ? 'professionalDetails' : null
        });
      }

      if (nicheInterestScore.score > 70) {
        matchTypes.nicheInterestBased.push({
          userId: potentialMatch.id,
          name: potentialMatch.name,
          score: nicheInterestScore.score,
          reason: nicheInterestScore.reason,
          details: includeDetails ? 'nicheInterestDetails' : null
        });
      }

      // Calculate overall compatibility score
      const totalScore = calculateFullCompatibility(user, potentialMatch, {
        includeNicheInterests: true,
        prioritizeAvailability: false
      });

      if (totalScore.totalScore > 50) {
        allMatches.push({
          userId: potentialMatch.id,
          name: potentialMatch.name,
          score: totalScore.totalScore,
          reason: totalScore.primaryReason,
          details: includeDetails ? totalScore.details : null,
          distanceMiles: calculateDistance(
            user.location?.lat || 0, user.location?.lng || 0,
            potentialMatch.location?.lat || 0, potentialMatch.location?.lng || 0
          )
        });
      }
    }

    // Sort all match types by score
    for (const key in matchTypes) {
      matchTypes[key].sort((a, b) => b.score - a.score);
      matchTypes[key] = matchTypes[key].slice(0, maxResults);
    }

    // Sort overall matches by score
    allMatches.sort((a, b) => b.score - a.score);
    const topMatches = allMatches.slice(0, maxResults);

    res.json({
      topMatches,
      locationBased: matchTypes.locationBased,
      availabilityBased: matchTypes.availabilityBased,
      professionalBased: matchTypes.professionalBased,
      nicheInterestBased: matchTypes.nicheInterestBased,
      totalPotentialMatches: allMatches.length
    });
  } catch (error) {
    console.error('Match suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check if a user passes filter criteria
function passesFilters(user, filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return true; // No filters applied
  }

  // Age filter
  if (filters.minAge !== undefined && user.age < filters.minAge) {
    return false;
  }
  if (filters.maxAge !== undefined && user.age > filters.maxAge) {
    return false;
  }

  // Gender filter
  if (filters.gender && filters.gender !== 'any' && user.gender !== filters.gender) {
    return false;
  }

  // Looking for filter
  if (filters.lookingFor && filters.lookingFor !== 'any' && user.lookingFor !== filters.lookingFor) {
    return false;
  }

  // Has LinkedIn data filter
  if (filters.hasLinkedIn && (!user.linkedin || !user.linkedin.experience || user.linkedin.experience.length === 0)) {
    return false;
  }

  // Has location data filter
  if (filters.hasLocation && (!user.location || !user.location.lat || !user.location.lng)) {
    return false;
  }

  // Has availability filter
  if (filters.hasAvailability && (!user.availability || user.availability.length === 0)) {
    return false;
  }

  // Has niche interests filter
  if (filters.hasNicheInterests && (!user.nicheInterests ||
      (Array.isArray(user.nicheInterests) ? user.nicheInterests.length === 0 :
      Object.keys(user.nicheInterests).length === 0))) {
    return false;
  }

  return true;
}

// Helper function to calculate query-based match score
function calculateQueryMatch(user, potentialMatch, searchTerm, category, matchDetails = {}) {
  let matchScore = 0;

  // Interest matching
  if (category === 'interests' || category === 'general') {
    // Match by interests
    if (potentialMatch.interests && Array.isArray(potentialMatch.interests)) {
      const matchingInterests = potentialMatch.interests.filter(
        interest => interest.toLowerCase().includes(searchTerm)
      );

      if (matchingInterests.length > 0) {
        matchScore += matchingInterests.length * 10;
        matchDetails.matchedInterests = matchingInterests;
      }
    }

    // Match by niche interests
    if (potentialMatch.nicheInterests) {
      const nicheInterests = Array.isArray(potentialMatch.nicheInterests) ?
                             potentialMatch.nicheInterests :
                             flattenNicheInterests(potentialMatch.nicheInterests);

      const matchingNicheInterests = nicheInterests.filter(
        interest => interest.toLowerCase().includes(searchTerm)
      );

      if (matchingNicheInterests.length > 0) {
        matchScore += matchingNicheInterests.length * 12;
        matchDetails.matchedNicheInterests = matchingNicheInterests;
      }
    }
  }

  // Professional matching
  if (category === 'profession' || category === 'general') {
    // Match by LinkedIn data
    if (potentialMatch.linkedin) {
      // Check job titles
      if (potentialMatch.linkedin.experience) {
        for (const exp of potentialMatch.linkedin.experience) {
          if (exp.title && exp.company && (
              exp.title.toLowerCase().includes(searchTerm) ||
              exp.company.toLowerCase().includes(searchTerm))) {
            matchScore += 15;
            matchDetails.matchedProfessional = `Works as ${exp.title} at ${exp.company}`;
            break;
          }
        }
      }

      // Check skills
      if (potentialMatch.linkedin.skills && Array.isArray(potentialMatch.linkedin.skills)) {
        const matchingSkills = potentialMatch.linkedin.skills.filter(
          skill => skill.toLowerCase().includes(searchTerm)
        );

        if (matchingSkills.length > 0) {
          matchScore += matchingSkills.length * 5;
          if (!matchDetails.matchedProfessional) {
            matchDetails.matchedProfessional = `Has skills in ${matchingSkills.join(', ')}`;
          }
          matchDetails.matchedSkills = matchingSkills;
        }
      }
    }
  }

  // Location matching
  if (category === 'location' || category === 'general') {
    // Match by location
    if (potentialMatch.location && potentialMatch.location.address) {
      if (potentialMatch.location.address.toLowerCase().includes(searchTerm)) {
        matchScore += 20;
        matchDetails.matchedLocation = `Located in ${potentialMatch.location.address}`;
      }
    }

    // Match by frequent locations if available
    if (potentialMatch.frequentLocations && Array.isArray(potentialMatch.frequentLocations)) {
      const matchingLocations = potentialMatch.frequentLocations.filter(loc =>
        loc.name && loc.name.toLowerCase().includes(searchTerm) ||
        loc.address && loc.address.toLowerCase().includes(searchTerm)
      );

      if (matchingLocations.length > 0) {
        matchScore += matchingLocations.length * 8;
        if (!matchDetails.matchedLocation) {
          matchDetails.matchedLocation = `Frequently visits ${matchingLocations[0].name}`;
        }
        matchDetails.matchedFrequentLocations = matchingLocations.map(l => l.name);
      }
    }
  }

  // Name match gives some points
  if (potentialMatch.name && potentialMatch.name.toLowerCase().includes(searchTerm)) {
    matchScore += 5;
    matchDetails.matchedName = true;
  }

  // Bio/about match gives some points
  if (potentialMatch.about && potentialMatch.about.toLowerCase().includes(searchTerm)) {
    matchScore += 10;
    matchDetails.matchedAbout = true;
  }

  return matchScore;
}

// Helper function to calculate comprehensive compatibility
function calculateFullCompatibility(user, potentialMatch, options = {}) {
  const {
    includeNicheInterests = true,
    prioritizeAvailability = false
  } = options;

  // Default weights
  let weights = {
    interests: 30,
    professional: 30,
    location: 25,
    availability: 15,
    nicheInterests: 20
  };

  // Adjust weights if prioritizing availability
  if (prioritizeAvailability) {
    weights = {
      interests: 25,
      professional: 25,
      location: 20,
      availability: 30,
      nicheInterests: 15
    };
  }

  // Calculate individual compatibility scores
  const interestCompatibility = calculateInterestCompatibility(user, potentialMatch);
  const professionalCompatibility = calculateProfessionalCompatibility(user, potentialMatch);
  const locationCompatibility = calculateLocationCompatibility(user, potentialMatch);
  const availabilityCompatibility = calculateAvailabilityCompatibility(user, potentialMatch);

  // Only calculate niche interests if requested
  const nicheInterestCompatibility = includeNicheInterests ?
                                    calculateNicheInterestCompatibility(user, potentialMatch) :
                                    { score: 0, reason: '', details: {} };

  // Calculate total score with appropriate weighting
  let totalFactors = 0;
  let totalWeightedScore = 0;

  // Only include factors with non-zero scores
  if (interestCompatibility.score > 0) {
    totalWeightedScore += (interestCompatibility.score * weights.interests);
    totalFactors += weights.interests;
  }

  if (professionalCompatibility.score > 0) {
    totalWeightedScore += (professionalCompatibility.score * weights.professional);
    totalFactors += weights.professional;
  }

  if (locationCompatibility.score > 0) {
    totalWeightedScore += (locationCompatibility.score * weights.location);
    totalFactors += weights.location;
  }

  if (availabilityCompatibility.score > 0) {
    totalWeightedScore += (availabilityCompatibility.score * weights.availability);
    totalFactors += weights.availability;
  }

  if (nicheInterestCompatibility.score > 0) {
    totalWeightedScore += (nicheInterestCompatibility.score * weights.nicheInterests);
    totalFactors += weights.nicheInterests;
  }

  // Calculate normalized score (0-100)
  const totalScore = totalFactors > 0 ? Math.round(totalWeightedScore / totalFactors) : 0;

  // Determine primary reason for match
  const scores = [
    { type: 'interests', score: interestCompatibility.score * weights.interests, reason: interestCompatibility.reason },
    { type: 'professional', score: professionalCompatibility.score * weights.professional, reason: professionalCompatibility.reason },
    { type: 'location', score: locationCompatibility.score * weights.location, reason: locationCompatibility.reason },
    { type: 'availability', score: availabilityCompatibility.score * weights.availability, reason: availabilityCompatibility.reason }
  ];

  if (includeNicheInterests) {
    scores.push({
      type: 'nicheInterests',
      score: nicheInterestCompatibility.score * weights.nicheInterests,
      reason: nicheInterestCompatibility.reason
    });
  }

  // Sort by highest score to find primary reason
  scores.sort((a, b) => b.score - a.score);
  const primaryReason = scores[0]?.reason || 'Potential match based on multiple factors';

  return {
    totalScore,
    primaryReason,
    details: {
      interestScore: interestCompatibility.score,
      professionalScore: professionalCompatibility.score,
      locationScore: locationCompatibility.score,
      availabilityScore: availabilityCompatibility.score,
      nicheInterestScore: includeNicheInterests ? nicheInterestCompatibility.score : undefined,
      interestDetails: interestCompatibility.details,
      professionalDetails: professionalCompatibility.details,
      locationDetails: locationCompatibility.details,
      availabilityDetails: availabilityCompatibility.details,
      nicheInterestDetails: includeNicheInterests ? nicheInterestCompatibility.details : undefined
    }
  };
}

// Helper function for interest compatibility calculation
function calculateInterestCompatibility(user, potentialMatch) {
  let score = 0;
  let reason = '';
  const details = {};

  if (user.interests && potentialMatch.interests &&
      Array.isArray(user.interests) && Array.isArray(potentialMatch.interests) &&
      user.interests.length > 0 && potentialMatch.interests.length > 0) {

    // Create sets for more efficient matching
    const userInterests = new Set(user.interests.map(i => i.toLowerCase()));
    const matchInterests = potentialMatch.interests.map(i => i.toLowerCase());

    // Count matching interests
    let matchCount = 0;
    const matchingInterests = [];
    for (const interest of matchInterests) {
      if (userInterests.has(interest)) {
        matchCount++;
        matchingInterests.push(interest);
      }
    }

    if (matchCount > 0) {
      // Calculate a score based on percentage of shared interests
      const maxInterests = Math.max(userInterests.size, matchInterests.length);
      score = (matchCount / maxInterests) * 100;

      details.matchingInterests = matchingInterests;
      details.matchingInterestCount = matchCount;
      details.totalUserInterests = userInterests.size;
      details.totalMatchInterests = matchInterests.length;

      if (matchCount === 1) {
        reason = `Shares 1 common interest with you`;
      } else {
        reason = `Shares ${matchCount} common interests with you`;
      }
    }
  }

  return { score, reason, details };
}

// Helper function for professional compatibility calculation
function calculateProfessionalCompatibility(user, potentialMatch) {
  let score = 0;
  let reason = '';
  const details = {
    sharedSkills: [],
    sharedCompanies: [],
    sharedSchools: []
  };

  if (user.linkedin && potentialMatch.linkedin) {
    // Skills compatibility
    if (user.linkedin.skills && potentialMatch.linkedin.skills &&
        Array.isArray(user.linkedin.skills) && Array.isArray(potentialMatch.linkedin.skills) &&
        user.linkedin.skills.length > 0 && potentialMatch.linkedin.skills.length > 0) {

      const userSkills = new Set(user.linkedin.skills.map(s => s.toLowerCase()));
      const matchSkills = potentialMatch.linkedin.skills.map(s => s.toLowerCase());

      let skillMatchCount = 0;
      for (const skill of matchSkills) {
        if (userSkills.has(skill)) {
          skillMatchCount++;
          details.sharedSkills.push(skill);
        }
      }

      if (skillMatchCount > 0) {
        const maxSkills = Math.max(userSkills.size, matchSkills.length);
        score += (skillMatchCount / maxSkills) * 50;

        if (reason === '' && skillMatchCount > 1) {
          reason = `Shares ${skillMatchCount} professional skills with you`;
        }
      }
    }

    // Company compatibility
    if (user.linkedin.experience && potentialMatch.linkedin.experience &&
        Array.isArray(user.linkedin.experience) && Array.isArray(potentialMatch.linkedin.experience) &&
        user.linkedin.experience.length > 0 && potentialMatch.linkedin.experience.length > 0) {

      // Extract companies
      const userCompanies = user.linkedin.experience.map(e => e.company?.toLowerCase()).filter(Boolean);
      const matchCompanies = potentialMatch.linkedin.experience.map(e => e.company?.toLowerCase()).filter(Boolean);

      // Check for same company
      for (const company of userCompanies) {
        for (const matchCompany of matchCompanies) {
          if (company === matchCompany) {
            // Same company bonus
            score += 30;
            const companyName = potentialMatch.linkedin.experience.find(e => e.company.toLowerCase() === matchCompany)?.company;
            details.sharedCompanies.push(companyName);

            if (reason === '') {
              reason = `Worked at the same company: ${companyName}`;
            }
            break;
          }
        }
      }
    }

    // Education compatibility
    if (user.linkedin.education && potentialMatch.linkedin.education &&
        Array.isArray(user.linkedin.education) && Array.isArray(potentialMatch.linkedin.education) &&
        user.linkedin.education.length > 0 && potentialMatch.linkedin.education.length > 0) {

      const userSchools = user.linkedin.education.map(e => e.institution?.toLowerCase()).filter(Boolean);
      const matchSchools = potentialMatch.linkedin.education.map(e => e.institution?.toLowerCase()).filter(Boolean);

      // Check for same school
      for (const school of userSchools) {
        for (const matchSchool of matchSchools) {
          if (school === matchSchool) {
            score += 20;
            const schoolName = potentialMatch.linkedin.education.find(e => e.institution.toLowerCase() === matchSchool)?.institution;
            details.sharedSchools.push(schoolName);

            if (reason === '') {
              reason = `Attended the same school: ${schoolName}`;
            }
            break;
          }
        }
      }
    }
  }

  // Normalize score to 0-100
  score = Math.min(100, score);

  // If we have shared elements but no reason yet, create a general one
  if (score > 0 && reason === '') {
    if (details.sharedSkills.length > 0) {
      reason = `Has professional skills in ${details.sharedSkills.slice(0, 3).join(', ')}`;
    } else if (details.sharedCompanies.length > 0) {
      reason = `Professional connection through ${details.sharedCompanies[0]}`;
    } else if (details.sharedSchools.length > 0) {
      reason = `Academic connection through ${details.sharedSchools[0]}`;
    } else {
      reason = 'Has compatible professional background';
    }
  }

  return { score, reason, details };
}

// Helper function for location compatibility calculation
function calculateLocationCompatibility(user, potentialMatch) {
  let score = 0;
  let reason = '';
  const details = {};

  if (user.location && potentialMatch.location) {
    // Calculate distance if coordinates are available
    if (user.location.lat && user.location.lng &&
        potentialMatch.location.lat && potentialMatch.location.lng) {

      const distanceMiles = calculateDistance(
        user.location.lat, user.location.lng,
        potentialMatch.location.lat, potentialMatch.location.lng
      );

      details.distanceMiles = Math.round(distanceMiles);

      // Maximum distance from user preferences or default to 50 miles
      const maxDistance = user.distance || 50;

      // Score decreases linearly with distance
      if (distanceMiles <= maxDistance) {
        // Scale from 0 to 100 based on distance
        score = 100 * (1 - distanceMiles / maxDistance);

        if (distanceMiles < 1) {
          reason = `Less than a mile away from you`;
        } else {
          reason = `${Math.round(distanceMiles)} miles away from you`;
        }
      }

      // Check frequent locations for overlap
      if (user.frequentLocations && potentialMatch.frequentLocations &&
          Array.isArray(user.frequentLocations) && Array.isArray(potentialMatch.frequentLocations) &&
          user.frequentLocations.length > 0 && potentialMatch.frequentLocations.length > 0) {

        const sharedLocations = [];

        // Find locations that are close to each other
        for (const userLoc of user.frequentLocations) {
          for (const matchLoc of potentialMatch.frequentLocations) {
            if (userLoc.lat && userLoc.lng && matchLoc.lat && matchLoc.lng) {
              const locDistance = calculateDistance(
                userLoc.lat, userLoc.lng, matchLoc.lat, matchLoc.lng
              );

              // If locations are within 1 mile of each other
              if (locDistance < 1) {
                sharedLocations.push({
                  userLocation: userLoc.name,
                  matchLocation: matchLoc.name,
                  distance: locDistance
                });
              }
            }
          }
        }

        if (sharedLocations.length > 0) {
          // Bonus points for shared frequent locations (up to +20%)
          score = Math.min(100, score + (sharedLocations.length * 5));
          details.sharedLocations = sharedLocations;

          if (score > 0 && reason === '') {
            reason = `Frequents the same places as you`;
          }
        }
      }
    } else if (user.location.address && potentialMatch.location.address) {
      // Simple text-based location matching as fallback
      const userCity = user.location.city || user.location.address.split(',')[0]?.trim().toLowerCase();
      const matchCity = potentialMatch.location.city || potentialMatch.location.address.split(',')[0]?.trim().toLowerCase();

      if (userCity && matchCity && userCity === matchCity) {
        score = 80;
        details.sameCity = true;
        details.city = userCity;

        if (reason === '') {
          reason = `Lives in the same city as you (${userCity})`;
        }
      }
    }
  }

  return { score, reason, details };
}

// Helper function for availability compatibility calculation
function calculateAvailabilityCompatibility(user, potentialMatch) {
  let score = 0;
  let reason = '';
  const details = {
    overlappingSlots: []
  };

  if (user.availability && potentialMatch.availability &&
      Array.isArray(user.availability) && Array.isArray(potentialMatch.availability) &&
      user.availability.length > 0 && potentialMatch.availability.length > 0) {

    // Check for overlapping availability
    let overlapCount = 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Only consider future availability
    const userFutureSlots = user.availability.filter(slot => slot.date >= today);
    const matchFutureSlots = potentialMatch.availability.filter(slot => slot.date >= today);

    for (const userSlot of userFutureSlots) {
      for (const matchSlot of matchFutureSlots) {
        // Date matching
        if (userSlot.date === matchSlot.date) {
          // Check if time slots overlap
          const userStart = timeToMinutes(userSlot.startTime);
          const userEnd = timeToMinutes(userSlot.endTime);
          const matchStart = timeToMinutes(matchSlot.startTime);
          const matchEnd = timeToMinutes(matchSlot.endTime);

          if (userStart < matchEnd && userEnd > matchStart) {
            overlapCount++;

            // Calculate overlap duration in minutes
            const overlapStart = Math.max(userStart, matchStart);
            const overlapEnd = Math.min(userEnd, matchEnd);
            const overlapDuration = overlapEnd - overlapStart;

            details.overlappingSlots.push({
              date: userSlot.date,
              userTime: `${userSlot.startTime}-${userSlot.endTime}`,
              matchTime: `${matchSlot.startTime}-${matchSlot.endTime}`,
              overlapMinutes: overlapDuration
            });
          }
        }
      }
    }

    if (overlapCount > 0) {
      // Scale based on number of overlaps (max 100)
      score = Math.min(100, overlapCount * 20);
      details.overlapCount = overlapCount;

      // Consider preferences if available
      if (user.availabilityPreferences && potentialMatch.availabilityPreferences) {
        // Check for preference compatibility
        let preferenceMatch = 0;

        if (user.availabilityPreferences.preferredDays &&
            potentialMatch.availabilityPreferences.preferredDays) {
          // Count matching preferred days
          const userDays = new Set(user.availabilityPreferences.preferredDays);
          const matchDays = potentialMatch.availabilityPreferences.preferredDays;

          for (const day of matchDays) {
            if (userDays.has(day)) {
              preferenceMatch++;
            }
          }
        }

        if (user.availabilityPreferences.preferredTimeOfDay &&
            potentialMatch.availabilityPreferences.preferredTimeOfDay &&
            user.availabilityPreferences.preferredTimeOfDay ===
            potentialMatch.availabilityPreferences.preferredTimeOfDay) {
          preferenceMatch += 2;
        }

        // Bonus points for preference compatibility (up to +20%)
        if (preferenceMatch > 0) {
          score = Math.min(100, score + preferenceMatch * 5);
          details.preferenceMatch = preferenceMatch;
        }
      }

      if (overlapCount === 1) {
        reason = `Has 1 overlapping availability slot with you`;
      } else {
        reason = `Has ${overlapCount} overlapping availability slots with you`;
      }
    }
  }

  return { score, reason, details };
}

// Helper function to calculate niche interests compatibility
function calculateNicheInterestCompatibility(user, potentialMatch) {
  let score = 0;
  let reason = '';
  const details = {
    matchingInterests: [],
    matchingCategories: []
  };

  // Skip if either user doesn't have niche interests
  if (!user.nicheInterests || !potentialMatch.nicheInterests) {
    return { score: 0, reason: '', details };
  }

  // Handle different data structures (array vs. categorized object)
  let userNicheInterests, matchNicheInterests;

  // Process user's niche interests
  if (Array.isArray(user.nicheInterests)) {
    userNicheInterests = new Set(user.nicheInterests.map(i => i.toLowerCase()));
    details.userFormat = 'array';
  } else {
    userNicheInterests = new Map(); // Map of category -> Set of interests
    for (const item of user.nicheInterests) {
      if (item.category && item.interests && Array.isArray(item.interests)) {
        userNicheInterests.set(
          item.category.toLowerCase(),
          new Set(item.interests.map(i => i.toLowerCase()))
        );
      }
    }
    details.userFormat = 'categorized';
  }

  // Process match's niche interests
  if (Array.isArray(potentialMatch.nicheInterests)) {
    matchNicheInterests = potentialMatch.nicheInterests.map(i => ({
      interest: i.toLowerCase(),
      category: null
    }));
    details.matchFormat = 'array';
  } else {
    matchNicheInterests = [];
    for (const item of potentialMatch.nicheInterests) {
      if (item.category && item.interests && Array.isArray(item.interests)) {
        for (const interest of item.interests) {
          matchNicheInterests.push({
            interest: interest.toLowerCase(),
            category: item.category.toLowerCase()
          });
        }
      }
    }
    details.matchFormat = 'categorized';
  }

  // Find matching interests
  if (details.userFormat === 'array') {
    // Simple array matching
    let matchCount = 0;
    for (const item of matchNicheInterests) {
      if (userNicheInterests.has(item.interest)) {
        matchCount++;
        details.matchingInterests.push(item.interest);
      }
    }

    if (matchCount > 0) {
      // Calculate score based on percentage of matches
      const userCount = userNicheInterests.size;
      const matchCount = matchNicheInterests.length;
      const maxCount = Math.max(userCount, matchCount);

      score = (matchCount / maxCount) * 100;

      if (details.matchingInterests.length === 1) {
        reason = `Shares 1 niche interest with you`;
      } else {
        reason = `Shares ${details.matchingInterests.length} niche interests with you`;
      }
    }
  } else {
    // Categorized matching (more sophisticated)
    let categoryMatches = new Map(); // Map of category -> number of matches

    for (const item of matchNicheInterests) {
      if (item.category) {
        // Check if user has this category
        if (userNicheInterests.has(item.category)) {
          // Get user's interests in this category
          const userInterests = userNicheInterests.get(item.category);

          // Check if this specific interest matches
          if (userInterests.has(item.interest)) {
            // Record match
            if (!categoryMatches.has(item.category)) {
              categoryMatches.set(item.category, 0);
            }
            categoryMatches.set(item.category, categoryMatches.get(item.category) + 1);

            details.matchingInterests.push(item.interest);
            if (!details.matchingCategories.includes(item.category)) {
              details.matchingCategories.push(item.category);
            }
          }
        }
      } else {
        // Match has uncategorized interest, check against all user categories
        for (const [category, interests] of userNicheInterests.entries()) {
          if (interests.has(item.interest)) {
            if (!categoryMatches.has(category)) {
              categoryMatches.set(category, 0);
            }
            categoryMatches.set(category, categoryMatches.get(category) + 1);

            details.matchingInterests.push(item.interest);
            if (!details.matchingCategories.includes(category)) {
              details.matchingCategories.push(category);
            }
            break; // Count each interest match only once
          }
        }
      }
    }

    // Calculate score based on category matches
    if (categoryMatches.size > 0) {
      let totalCategoryScore = 0;
      let totalCategories = userNicheInterests.size;

      for (const [category, matchCount] of categoryMatches.entries()) {
        // Get total interests in this category
        const userInterestsInCategory = userNicheInterests.get(category).size;

        // Calculate per-category score (weight by size of category)
        const categoryScore = (matchCount / userInterestsInCategory) * 100;
        totalCategoryScore += categoryScore;
      }

      // Average score across all categories
      score = totalCategoryScore / totalCategories;

      if (details.matchingCategories.length === 1) {
        reason = `Shares interest in ${details.matchingCategories[0]} with you`;
      } else {
        reason = `Shares interests in ${details.matchingCategories.length} categories with you`;
      }
    }
  }

  return {
    score: Math.min(100, Math.round(score)),
    reason,
    details
  };
}

// Helper function to convert time to minutes for comparison
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Start server
app.listen(PORT, async () => {
  console.log(`DataMatch server running on port ${PORT}`);
  
  // Create demo data if it doesn't exist
  const usersDir = path.join(DATA_DIR, 'users');
  const users = await fs.readdir(usersDir);
  
  if (users.length === 0) {
    console.log('Creating demo data...');
    await createDemoData();
    console.log('Demo data created');
  }
});