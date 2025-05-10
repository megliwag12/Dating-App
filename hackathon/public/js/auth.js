// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  
  // If no token found and not on login/register page, redirect to login
  if (!token) {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['index.html', 'login.html', 'register.html', 'about.html', ''];
    
    if (!publicPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  } else {
    // If token found and on login/register page, redirect to dashboard
    const currentPage = window.location.pathname.split('/').pop();
    const authPages = ['login.html', 'register.html'];
    
    if (authPages.includes(currentPage)) {
      window.location.href = 'dashboard.html';
    }
    
    // Update UI for logged in users
    updateAuthUI();
  }
}

// Update UI based on authentication status
function updateAuthUI() {
  const token = localStorage.getItem('token');
  const navLinks = document.querySelector('.nav-links');
  
  if (token && navLinks) {
    // Check if we already updated the UI
    if (navLinks.querySelector('#logoutBtn')) return;
    
    // Clear existing nav links
    navLinks.innerHTML = '';
    
    // Add authenticated navigation links
    navLinks.innerHTML = `
      <li><a href="dashboard.html">Dashboard</a></li>
      <li><a href="discover.html">Discover</a></li>
      <li><a href="matches.html">Matches</a></li>
      <li><a href="profile.html">Profile</a></li>
      <li><a href="#" id="logoutBtn" class="btn btn-secondary">Logout</a></li>
    `;
    
    // Add logout event listener
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
}

// Logout function
function logout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Handle API errors
function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error.status === 401) {
    // Unauthorized - clear token and redirect to login
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
  
  return error;
}

// API request helper function
async function apiRequest(url, method = 'GET', data = null) {
  // Check if demo mode is enabled
  const isDemoMode = window.location.search.includes('demo=true');
  if (isDemoMode) {
    console.log('Running in demo mode');
    return demoapiRequest(url, method, data);
  }

  const API_BASE_URL = 'http://localhost:3001/api'; // Use your server port

  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['x-auth-token'] = token;
  }

  const options = {
    method,
    headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making API request to: ${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, options);

    // Check if response is unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return null;
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData.message || 'Something went wrong',
        errors: responseData.errors
      };
    }

    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);

    // If server is not running, fall back to demo mode
    if (error.message && error.message.includes('Failed to fetch')) {
      console.log('Server not available, falling back to demo mode');
      return demoapiRequest(url, method, data);
    }

    throw error;
  }
}

// Demo API fallback function - this will be used if the server is not running
async function demoapiRequest(url, method = 'GET', data = null) {
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

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Add logout event listener if logout button exists
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});