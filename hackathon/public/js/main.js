// DataMatch - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Main.js: Document loaded');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to home page
      window.location.href = 'index.html';
    });
  }
  
  // Profile page functionality
  const initProfilePage = () => {
    console.log('Main.js: Initializing profile page');

    // Initialize components if we're on the profile page
    if (document.querySelector('.profile-content')) {
      // Initialize components if the deep-data section is active and components are loaded
      if (document.querySelector('#deep-data.active') && typeof initSpotifyIntegration === 'function') {
        console.log('Main.js: Deep Data section is active, initializing components');
        initSpotifyIntegration();
      }

      // Initialize components if the reviews section is active and components are loaded
      if (document.querySelector('#reviews.active') && typeof initReviewTabs === 'function') {
        console.log('Main.js: Reviews section is active, initializing components');
        initReviewTabs();
      }
    }

    // Tab navigation
    const profileNavItems = document.querySelectorAll('.profile-nav-item');
    const profileSections = document.querySelectorAll('.profile-section');
    
    profileNavItems.forEach(item => {
      item.addEventListener('click', function() {
        // Update active tab
        profileNavItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding section
        const targetSection = this.getAttribute('data-target');
        profileSections.forEach(section => {
          section.classList.remove('active');
          if (section.id === targetSection) {
            section.classList.add('active');

            // Initialize specific components when their sections are activated
            if (targetSection === 'deep-data' && typeof initSpotifyIntegration === 'function') {
              console.log('Main.js: Initializing deep data components');
              initSpotifyIntegration();
            }

            if (targetSection === 'reviews' && typeof initReviewTabs === 'function') {
              console.log('Main.js: Initializing review components');
              initReviewTabs();
            }
          }
        });
      });
    });
    
    // Load user profile
    fetchUserProfile();
  };
  
  // Function to fetch user profile
  const fetchUserProfile = async () => {
    // Check for and initialize components if present on the page
    if (typeof initSpotifyIntegration === 'function' && document.getElementById('deep-data')) {
      console.log('Main.js: Deep Data components available');
      window.deepDataComponentsAvailable = true;
    }

    if (typeof initReviewTabs === 'function' && document.getElementById('reviews')) {
      console.log('Main.js: Review components available');
      window.reviewComponentsAvailable = true;
    }

    if (!token) {
      // Redirect to login if not logged in
      window.location.href = 'index.html';
      return;
    }
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const userData = await response.json();
      
      // Update profile UI with user data
      updateProfileUI(userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Handle token expired or invalid
      if (error.message === 'Token is not valid' || error.message === 'No token, authorization denied') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      }
    }
  };
  
  // Function to update profile UI with user data
  const updateProfileUI = (userData) => {
    // Basic profile info
    const profileNameElement = document.getElementById('profile-name');
    const profileTaglineElement = document.getElementById('profile-tagline');
    const completionProgressElement = document.getElementById('completion-progress');
    const completionPercentageElement = document.getElementById('completion-percentage');
    const profileMatchCountElement = document.getElementById('profile-match-count');
    const profileVisitorsElement = document.getElementById('profile-visitors');
    const profileLikesElement = document.getElementById('profile-likes');
    
    if (profileNameElement && userData.name) {
      profileNameElement.textContent = userData.name;
    }
    
    if (profileTaglineElement && userData.tagline) {
      profileTaglineElement.textContent = userData.tagline;
    }
    
    if (completionProgressElement && userData.profileCompletion !== undefined) {
      completionProgressElement.style.width = `${userData.profileCompletion}%`;
    }
    
    if (completionPercentageElement && userData.profileCompletion !== undefined) {
      completionPercentageElement.textContent = `${userData.profileCompletion}%`;
    }
    
    // Stats
    if (userData.stats) {
      if (profileMatchCountElement && userData.stats.matches !== undefined) {
        profileMatchCountElement.textContent = userData.stats.matches;
      }
      
      if (profileVisitorsElement && userData.stats.visitors !== undefined) {
        profileVisitorsElement.textContent = userData.stats.visitors;
      }
      
      if (profileLikesElement && userData.stats.likes !== undefined) {
        profileLikesElement.textContent = userData.stats.likes;
      }
    }
    
    // Form fields for basic info
    const nameInput = document.getElementById('name');
    const taglineInput = document.getElementById('tagline');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const aboutTextarea = document.getElementById('about');
    const lookingForSelect = document.getElementById('looking-for');
    
    if (nameInput && userData.name) {
      nameInput.value = userData.name;
    }
    
    if (taglineInput && userData.tagline) {
      taglineInput.value = userData.tagline;
    }
    
    if (ageInput && userData.age) {
      ageInput.value = userData.age;
    }
    
    if (genderSelect && userData.gender) {
      genderSelect.value = userData.gender;
    }
    
    if (aboutTextarea && userData.about) {
      aboutTextarea.value = userData.about;
    }
    
    if (lookingForSelect && userData.lookingFor) {
      lookingForSelect.value = userData.lookingFor;
    }
    
    // Interests
    const interestsContainer = document.getElementById('interests-container');
    if (interestsContainer) {
      const AVAILABLE_INTERESTS = [
        'technology', 'data science', 'artificial intelligence', 'machine learning',
        'programming', 'web development', 'startups', 'entrepreneurship',
        'finance', 'marketing', 'design', 'UX/UI', 'product management',
        'blockchain', 'cryptocurrency', 'cloud computing', 'cybersecurity',
        'big data', 'IoT', 'mobile development', 'travel', 'music', 
        'photography', 'reading', 'hiking', 'cooking', 'fitness', 'art'
      ];
      
      // Clear container
      interestsContainer.innerHTML = '';
      
      // Add interest tags
      AVAILABLE_INTERESTS.forEach(interest => {
        const interestTag = document.createElement('div');
        interestTag.className = 'interest-tag';
        if (userData.interests && userData.interests.includes(interest)) {
          interestTag.classList.add('selected');
        }
        interestTag.textContent = interest;
        interestTag.dataset.interest = interest;
        
        interestTag.addEventListener('click', function() {
          this.classList.toggle('selected');
        });
        
        interestsContainer.appendChild(interestTag);
      });
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect selected interests
        const selectedInterests = Array.from(document.querySelectorAll('.interest-tag.selected'))
          .map(tag => tag.dataset.interest);
        
        // Prepare update data
        const updateData = {
          name: nameInput.value,
          tagline: taglineInput.value,
          age: parseInt(ageInput.value),
          gender: genderSelect.value,
          about: aboutTextarea.value,
          interests: selectedInterests,
          lookingFor: lookingForSelect.value
        };
        
        try {
          const response = await fetch('/api/users/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify(updateData)
          });
          
          if (!response.ok) {
            throw new Error('Failed to update profile');
          }
          
          const updatedData = await response.json();
          
          // Update UI with new data
          updateProfileUI(updatedData);
          
          // Show success message
          showNotification('Profile updated successfully', 'success');
        } catch (error) {
          console.error('Error updating profile:', error);
          showNotification('Failed to update profile. Please try again.', 'error');
        }
      });
    }
  };
  
  // Helper function to show notifications
  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${getIconForType(type)}"></i>
        <p>${message}</p>
      </div>
      <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    const timeout = setTimeout(() => {
      removeNotification(notification);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(timeout);
      removeNotification(notification);
    });
  }
  
  // Helper function to remove notification with animation
  function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  // Helper function to get icon for notification type
  function getIconForType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-times-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': default: return 'fa-info-circle';
    }
  }
  
  // Add CSS for notifications
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 1rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      transform: translateY(100px);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
      max-width: 350px;
    }
    
    .notification.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .notification i {
      font-size: 1.25rem;
    }
    
    .notification p {
      margin: 0;
      flex: 1;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      margin-left: 0.75rem;
      color: var(--text-muted);
    }
    
    .notification.success i {
      color: var(--success);
    }
    
    .notification.error i {
      color: var(--error);
    }
    
    .notification.warning i {
      color: var(--warning);
    }
    
    .notification.info i {
      color: var(--info);
    }
  `;
  
  document.head.appendChild(style);
  
  // Initialize based on current page
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('profile.html')) {
    // We're on the profile page
    initProfilePage();
  }
});