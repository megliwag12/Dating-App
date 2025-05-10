/**
 * Floating Hearts Animation for DataMatch
 * Adds a subtle background animation of floating hearts
 */

function createFloatingHearts() {
  // Create container for floating hearts
  const heartsContainer = document.createElement('div');
  heartsContainer.className = 'floating-hearts-container';
  document.body.appendChild(heartsContainer);
  
  // Create floating hearts
  const createHeart = () => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 15 + 10) + 's';
    heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
    heartsContainer.appendChild(heart);
    
    // Remove heart after animation completes
    setTimeout(() => {
      heart.remove();
    }, 25000);
  };
  
  // Create initial hearts
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      createHeart();
    }, i * 500);
  }
  
  // Create new hearts periodically
  setInterval(() => {
    createHeart();
  }, 3000);
}

// Wait for page load
document.addEventListener('DOMContentLoaded', function() {
  // Check if dark theme is active
  if (localStorage.getItem('datamatch_selected_theme') === 'dark') {
    setTimeout(createFloatingHearts, 1000);
  }
});