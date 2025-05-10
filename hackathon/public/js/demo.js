// Demo data for static version
const demoData = {
  user: {
    _id: '1',
    email: 'demo@example.com',
    profile: {
      name: 'Demo User',
      age: 25,
      gender: 'other',
      location: 'San Francisco',
      bio: 'Tech enthusiast and nature lover',
      interests: ['music', 'movies', 'travel', 'hiking', 'photography'],
      photos: [{ url: 'https://randomuser.me/api/portraits/lego/1.jpg', isPrimary: true }]
    }
  },
  potentialMatches: [
    {
      _id: '2',
      profile: {
        name: 'Alex',
        age: 27,
        gender: 'non-binary',
        location: 'San Francisco',
        bio: 'I love hiking and outdoor activities.',
        interests: ['hiking', 'photography', 'music'],
        photos: [{ url: 'https://randomuser.me/api/portraits/lego/2.jpg', isPrimary: true }]
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
        photos: [{ url: 'https://randomuser.me/api/portraits/lego/3.jpg', isPrimary: true }]
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
        photos: [{ url: 'https://randomuser.me/api/portraits/lego/4.jpg', isPrimary: true }]
      },
      compatibilityScore: 72
    }
  ],
  matches: [
    {
      _id: '5',
      profile: {
        name: 'Morgan',
        age: 26,
        gender: 'female',
        photos: [{ url: 'https://randomuser.me/api/portraits/lego/5.jpg', isPrimary: true }]
      }
    }
  ]
};

// Demo registration
function handleRegisterDemo(e) {
  if (e) e.preventDefault();
  
  // Store demo user data
  localStorage.setItem('token', 'demo-token');
  localStorage.setItem('user', JSON.stringify(demoData.user));
  
  // Redirect to discover page
  window.location.href = 'discover.html';
}

// Demo login
function handleLoginDemo(e) {
  if (e) e.preventDefault();
  
  // Store demo user data
  localStorage.setItem('token', 'demo-token');
  localStorage.setItem('user', JSON.stringify(demoData.user));
  
  // Redirect to discover page
  window.location.href = 'discover.html';
}

// Demo potential matches
function loadPotentialMatchesDemo() {
  potentialMatches = demoData.potentialMatches;
  currentMatchIndex = 0;
  currentPhotoIndex = 0;
  
  if (potentialMatches.length > 0) {
    showCurrentMatch();
  } else {
    showNoProfilesMessage();
  }
}

// Demo like user
function handleLikeDemo() {
  if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) {
    return;
  }
  
  const likedUser = potentialMatches[currentMatchIndex];
  
  // Simulate a match with Jordan (ID: 3)
  if (likedUser._id === '3') {
    showMatchNotification(likedUser);
  } else {
    moveToNextMatch();
  }
}

// Demo dislike user
function handleDislikeDemo() {
  if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) {
    return;
  }
  
  moveToNextMatch();
}

// Demo load matches
function loadMatchesDemo() {
  const matches = demoData.matches;
  
  if (matches && matches.length > 0) {
    displayMatches(matches);
  } else {
    showNoMatchesMessage();
  }
}

// Override API request function with demo version
function apiRequest(url, method = 'GET', data = null) {
  console.log(`Demo API request: ${method} ${url}`);
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      if (url === '/users/register') {
        resolve({
          message: 'User registered successfully',
          token: 'demo-token',
          user: demoData.user
        });
      } else if (url === '/users/login') {
        resolve({
          message: 'Login successful',
          token: 'demo-token',
          user: demoData.user
        });
      } else if (url === '/matches/potential') {
        resolve(demoData.potentialMatches);
      } else if (url.startsWith('/matches/like/')) {
        const userId = url.split('/').pop();
        resolve({
          message: 'User liked successfully',
          isMatch: userId === '3' // Match with Jordan
        });
      } else if (url.startsWith('/matches/dislike/')) {
        resolve({
          message: 'User disliked successfully'
        });
      } else if (url === '/matches/matches') {
        resolve(demoData.matches);
      }
    }, 500);
  });
}

// Add demo mode indicator
document.addEventListener('DOMContentLoaded', function() {
  const body = document.body;
  const demoIndicator = document.createElement('div');
  demoIndicator.style.position = 'fixed';
  demoIndicator.style.bottom = '10px';
  demoIndicator.style.right = '10px';
  demoIndicator.style.backgroundColor = 'rgba(255, 75, 127, 0.8)';
  demoIndicator.style.color = 'white';
  demoIndicator.style.padding = '5px 10px';
  demoIndicator.style.borderRadius = '5px';
  demoIndicator.style.zIndex = '1000';
  demoIndicator.style.fontSize = '12px';
  demoIndicator.textContent = 'DEMO MODE';
  body.appendChild(demoIndicator);
  
  // Override login/register forms for demo
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginDemo);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterDemo);
  }
  
  // Demo buttons
  const demoLoginBtn = document.getElementById('demoLoginBtn');
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', handleLoginDemo);
  }
  
  const demoRegisterBtn = document.getElementById('demoRegisterBtn');
  if (demoRegisterBtn) {
    demoRegisterBtn.addEventListener('click', handleRegisterDemo);
  }
  
  // Override discover page functions
  if (window.location.pathname.includes('discover.html')) {
    // Override functions
    window.loadPotentialMatches = loadPotentialMatchesDemo;
    window.handleLike = handleLikeDemo;
    window.handleDislike = handleDislikeDemo;
    
    // Initialize
    loadPotentialMatchesDemo();
    
    // Add event listeners if they don't exist
    if (!document.getElementById('likeBtn').onclick) {
      document.getElementById('likeBtn').addEventListener('click', handleLikeDemo);
    }
    if (!document.getElementById('dislikeBtn').onclick) {
      document.getElementById('dislikeBtn').addEventListener('click', handleDislikeDemo);
    }
  }
  
  // Override matches page functions
  if (window.location.pathname.includes('matches.html')) {
    window.loadMatches = loadMatchesDemo;
    loadMatchesDemo();
  }
});