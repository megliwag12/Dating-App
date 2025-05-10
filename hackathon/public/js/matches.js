document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize
  loadMatches();
  
  // Add event listeners for tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      switchTab(tabName);
    });
  });
});

// Switch between tabs
function switchTab(tabName) {
  // Hide all tab content
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.classList.remove('active');
  });
  
  // Show selected tab content
  document.getElementById(tabName).style.display = 'block';
  
  // Add active class to selected tab button
  document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
  
  // Load conversations if switching to conversations tab
  if (tabName === 'conversations') {
    loadConversations();
  }
}

// Load matches from API
async function loadMatches() {
  try {
    // Show loading state
    const matchesContainer = document.getElementById('matchesContainer');
    matchesContainer.innerHTML = '<div class="loading">Loading your matches...</div>';
    
    // Get matches from API
    const matches = await apiRequest('/matches/matches', 'GET');
    
    // Display matches
    if (matches && matches.length > 0) {
      displayMatches(matches);
    } else {
      showNoMatchesMessage();
    }
  } catch (error) {
    console.error('Error loading matches:', error);
    showNoMatchesMessage();
  }
}

// Display matches
function displayMatches(matches) {
  const matchesContainer = document.getElementById('matchesContainer');
  matchesContainer.innerHTML = '';
  
  const matchTemplate = document.getElementById('matchCardTemplate');
  
  matches.forEach(match => {
    const matchCard = document.importNode(matchTemplate.content, true);
    
    // Set match data
    const photoElement = matchCard.querySelector('.profile-photo');
    if (match.profile.photos && match.profile.photos.length > 0) {
      photoElement.src = match.profile.photos[0].url;
    } else {
      photoElement.src = 'images/placeholder.jpg';
    }
    
    matchCard.querySelector('.profile-name').textContent = match.profile.name;
    matchCard.querySelector('.profile-age-location').textContent = `${match.profile.age} • ${match.profile.gender}`;
    
    // Set message button link
    matchCard.querySelector('.message-btn').href = `messages.html?userId=${match._id}`;
    
    // Set view profile button event
    matchCard.querySelector('.view-profile-btn').addEventListener('click', () => {
      viewProfile(match._id);
    });
    
    matchesContainer.appendChild(matchCard);
  });
}

// Show no matches message
function showNoMatchesMessage() {
  const matchesContainer = document.getElementById('matchesContainer');
  matchesContainer.innerHTML = '';
  
  const noMatchesMessage = document.querySelector('.no-matches-message');
  noMatchesMessage.style.display = 'block';
  
  matchesContainer.appendChild(noMatchesMessage);
}

// Load conversations
async function loadConversations() {
  try {
    // Show loading state
    const conversationsContainer = document.getElementById('conversationsContainer');
    conversationsContainer.innerHTML = '<div class="loading">Loading your conversations...</div>';
    
    // In a real app, we would fetch conversations from the API
    // For this demo, we'll generate placeholder data
    const conversations = await getPlaceholderConversations();
    
    // Display conversations
    if (conversations && conversations.length > 0) {
      displayConversations(conversations);
    } else {
      showNoConversationsMessage();
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    showNoConversationsMessage();
  }
}

// Display conversations
function displayConversations(conversations) {
  const conversationsContainer = document.getElementById('conversationsContainer');
  conversationsContainer.innerHTML = '';
  
  const conversationTemplate = document.getElementById('conversationItemTemplate');
  
  conversations.forEach(conversation => {
    const conversationItem = document.importNode(conversationTemplate.content, true);
    
    // Set conversation data
    const photoElement = conversationItem.querySelector('.conversation-photo');
    if (conversation.photo) {
      photoElement.src = conversation.photo;
    } else {
      photoElement.src = 'images/placeholder.jpg';
    }
    
    conversationItem.querySelector('.conversation-name').textContent = conversation.name;
    conversationItem.querySelector('.conversation-last-message').textContent = conversation.lastMessage;
    conversationItem.querySelector('.conversation-time').textContent = conversation.time;
    
    // Add click event to navigate to messages
    const conversationElement = conversationItem.querySelector('.conversation-item');
    conversationElement.addEventListener('click', () => {
      window.location.href = `messages.html?userId=${conversation.userId}`;
    });
    
    conversationsContainer.appendChild(conversationItem);
  });
}

// Show no conversations message
function showNoConversationsMessage() {
  const conversationsContainer = document.getElementById('conversationsContainer');
  conversationsContainer.innerHTML = '';
  
  const noConversationsMessage = document.querySelector('.no-conversations-message');
  noConversationsMessage.style.display = 'block';
  
  conversationsContainer.appendChild(noConversationsMessage);
}

// Get placeholder conversations (for demo)
async function getPlaceholderConversations() {
  // In a real app, this would be an API call
  // For the demo, we'll return placeholder data
  
  // Get matches to use their data
  const matches = await apiRequest('/matches/matches', 'GET');
  
  if (!matches || matches.length === 0) {
    return [];
  }
  
  // Create placeholder conversations from matches
  return matches.slice(0, 5).map(match => {
    return {
      userId: match._id,
      name: match.profile.name,
      photo: match.profile.photos && match.profile.photos.length > 0 ? match.profile.photos[0].url : null,
      lastMessage: 'Hey there! How are you doing?',
      time: '2 hours ago'
    };
  });
}

// View profile
function viewProfile(userId) {
  // In a real app, this would navigate to a profile page
  // For the demo, we'll just show an alert
  alert(`View profile for user ${userId}`);
}