// DataMatch - Profile JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Fill any dummy data or initialize components
  initProfilePage();

  // We're now loading the scripts directly in the HTML
  // This function is left for reference but not used anymore
  // loadScript('/js/components/deep-data.js?v=3');
  // loadScript('/js/components/reviews.js?v=3');
});

function initProfilePage() {
  // Initialize tab switching
  initProfileTabs();

  // Additional profile-specific functionality

  // Avatar upload functionality
  const avatarUpload = document.getElementById('avatar-upload');
  const profileAvatar = document.getElementById('profile-avatar');

  if (avatarUpload && profileAvatar) {
    avatarUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          profileAvatar.src = event.target.result;

          // Here you would normally send this to your server
          // For demo, we'll just show a success message
          showNotification('Profile picture updated successfully', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Initialize profile tab navigation
function initProfileTabs() {
  const tabButtons = document.querySelectorAll('.profile-nav-item');
  const tabSections = document.querySelectorAll('.profile-section');

  if (tabButtons.length > 0) {
    console.log('Found tab buttons:', tabButtons.length);

    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        console.log('Switching to tab:', target);

        // Remove active class from all buttons and sections
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabSections.forEach(section => section.classList.remove('active'));

        // Add active class to current button and target section
        this.classList.add('active');

        // Find and activate the target section
        const targetSection = document.getElementById(target);
        if (targetSection) {
          targetSection.classList.add('active');
          console.log('Activated section:', target);

          // If this is the deep-data section, make sure its components are initialized
          if (target === 'deep-data' && typeof initSpotifyIntegration === 'function') {
            console.log('Initializing deep data components');
            initSpotifyIntegration();
          }

          // If this is the reviews section, make sure its components are initialized
          if (target === 'reviews' && typeof initReviewTabs === 'function') {
            console.log('Initializing review components');
            initReviewTabs();
          }
        } else {
          console.log('Target section not found:', target);
        }
      });
    });
  } else {
    console.log('Tab buttons not found');
  }
}

// Helper function to show notifications (defined in main.js but duplicated here for independence)
function showNotification(message, type) {
  // Create notification element if it doesn't exist already
  if (!window.notificationSystem) {
    window.notificationSystem = true;
    
    // Add CSS for notifications if not already added
    const style = document.getElementById('notification-styles');
    if (!style) {
      const newStyle = document.createElement('style');
      newStyle.id = 'notification-styles';
      newStyle.textContent = `
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
      document.head.appendChild(newStyle);
    }
  }
  
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

function removeNotification(notification) {
  notification.classList.remove('show');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

function getIconForType(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-times-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': default: return 'fa-info-circle';
  }
}

/**
 * Dynamically load a script
 * @param {string} src - Path to the script file
 * @param {Function} callback - Optional callback function
 */
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;

  if (callback) {
    script.onload = callback;
  }

  document.head.appendChild(script);
}