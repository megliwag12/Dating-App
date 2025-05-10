/**
 * Reviews & Verifications Component
 * Handles the functionality for the reviews tab system
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Reviews component loaded - simplified version');
  window.reviewsComponentLoaded = true;
  // Initialize review tabs
  initReviewTabs();
});

/**
 * Initialize the review tabs system
 */
function initReviewTabs() {
  const tabs = document.querySelectorAll('.review-tab');
  
  if (tabs.length > 0) {
    console.log('Found review tabs:', tabs.length);
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        console.log('Tab clicked:', this.getAttribute('data-target'));
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Hide all tab content
        document.querySelectorAll('.review-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show the selected tab content
        const targetId = this.getAttribute('data-target');
        const targetContent = document.getElementById(`${targetId}-content`);
        
        if (targetContent) {
          targetContent.classList.add('active');
          console.log('Activated tab content:', targetId);
        } else {
          console.log('Target content not found:', targetId + '-content');
        }
      });
    });
  } else {
    console.log('Review tabs not found');
  }
}

// Simple function to show notifications
function showNotification(message, type = 'info') {
  console.log(`Notification (${type}):`, message);
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('visible');
  }, 10);
  
  // Automatically remove after delay
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}