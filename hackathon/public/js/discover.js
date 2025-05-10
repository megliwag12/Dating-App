document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize
  loadPotentialMatches();
  
  // Add event listeners
  document.getElementById('likeBtn').addEventListener('click', handleLike);
  document.getElementById('dislikeBtn').addEventListener('click', handleDislike);
  document.getElementById('refreshBtn').addEventListener('click', loadPotentialMatches);
  document.getElementById('keepSwipingBtn').addEventListener('click', hideMatchNotification);
  document.getElementById('sendMessageBtn').addEventListener('click', handleSendMessage);
  
  // Photo navigation
  document.getElementById('prevPhotoBtn').addEventListener('click', showPreviousPhoto);
  document.getElementById('nextPhotoBtn').addEventListener('click', showNextPhoto);
});

// Global variables
let potentialMatches = [];
let currentMatchIndex = 0;
let currentPhotoIndex = 0;

// Load potential matches from API
async function loadPotentialMatches() {
  try {
    // Show loading state
    document.getElementById('currentProfile').classList.add('loading');
    
    // Hide no profiles message if visible
    document.getElementById('noProfilesMessage').style.display = 'none';
    
    // Get potential matches from API
    const response = await apiRequest('/matches/potential', 'GET');
    
    // Store potential matches
    potentialMatches = response || [];
    
    // Reset indexes
    currentMatchIndex = 0;
    currentPhotoIndex = 0;
    
    // Show first potential match or no profiles message
    if (potentialMatches.length > 0) {
      showCurrentMatch();
    } else {
      showNoProfilesMessage();
    }
  } catch (error) {
    console.error('Error loading potential matches:', error);
    showNoProfilesMessage();
  } finally {
    // Remove loading state
    document.getElementById('currentProfile').classList.remove('loading');
  }
}

// Show current potential match
function showCurrentMatch() {
  if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) {
    showNoProfilesMessage();
    return;
  }
  
  const match = potentialMatches[currentMatchIndex];
  
  // Update profile card
  document.getElementById('profileName').textContent = `${match.profile.name}, ${match.profile.age}`;
  document.getElementById('profileLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${match.profile.location}`;
  document.getElementById('profileBio').textContent = match.profile.bio || 'No bio available';
  document.getElementById('compatibilityScore').textContent = `${match.compatibilityScore}%`;
  
  // Update profile photo
  updateProfilePhoto(match);
  
  // Update interests
  updateProfileInterests(match);
  
  // Show profile card and hide no profiles message
  document.getElementById('currentProfile').style.display = 'block';
  document.getElementById('noProfilesMessage').style.display = 'none';
  document.getElementsByClassName('match-buttons')[0].style.display = 'flex';
}

// Update profile photo
function updateProfilePhoto(match) {
  const photoElement = document.getElementById('profilePhoto');
  const photos = match.profile.photos;
  
  if (photos && photos.length > 0) {
    photoElement.src = photos[currentPhotoIndex].url;
    
    // Update photo navigation buttons
    document.getElementById('prevPhotoBtn').style.display = photos.length > 1 ? 'block' : 'none';
    document.getElementById('nextPhotoBtn').style.display = photos.length > 1 ? 'block' : 'none';
  } else {
    // Show placeholder image if no photos available
    photoElement.src = 'images/placeholder.jpg';
    
    // Hide photo navigation buttons
    document.getElementById('prevPhotoBtn').style.display = 'none';
    document.getElementById('nextPhotoBtn').style.display = 'none';
  }
}

// Update profile interests
function updateProfileInterests(match) {
  const interestsContainer = document.getElementById('profileInterests');
  interestsContainer.innerHTML = '';
  
  if (match.profile.interests && match.profile.interests.length > 0) {
    match.profile.interests.forEach(interest => {
      const interestTag = document.createElement('span');
      interestTag.className = 'interest-tag';
      interestTag.textContent = interest;
      interestsContainer.appendChild(interestTag);
    });
  } else {
    interestsContainer.innerHTML = '<span class="no-interests">No interests listed</span>';
  }
}

// Show no profiles message
function showNoProfilesMessage() {
  document.getElementById('currentProfile').style.display = 'none';
  document.getElementById('noProfilesMessage').style.display = 'block';
  document.getElementsByClassName('match-buttons')[0].style.display = 'none';
}

// Navigate photos
function showPreviousPhoto() {
  const match = potentialMatches[currentMatchIndex];
  if (match.profile.photos && match.profile.photos.length > 1) {
    currentPhotoIndex = (currentPhotoIndex - 1 + match.profile.photos.length) % match.profile.photos.length;
    updateProfilePhoto(match);
  }
}

function showNextPhoto() {
  const match = potentialMatches[currentMatchIndex];
  if (match.profile.photos && match.profile.photos.length > 1) {
    currentPhotoIndex = (currentPhotoIndex + 1) % match.profile.photos.length;
    updateProfilePhoto(match);
  }
}

// Like user
async function handleLike() {
  if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) {
    return;
  }
  
  const likedUser = potentialMatches[currentMatchIndex];
  
  try {
    // Disable buttons during request
    document.getElementById('likeBtn').disabled = true;
    document.getElementById('dislikeBtn').disabled = true;
    
    // Send like request to API
    const response = await apiRequest(`/matches/like/${likedUser._id}`, 'POST');
    
    // Check if it's a match
    if (response.isMatch) {
      showMatchNotification(likedUser);
    } else {
      // Move to next potential match
      moveToNextMatch();
    }
  } catch (error) {
    console.error('Error liking user:', error);
    // Move to next potential match anyway
    moveToNextMatch();
  } finally {
    // Re-enable buttons
    document.getElementById('likeBtn').disabled = false;
    document.getElementById('dislikeBtn').disabled = false;
  }
}

// Dislike user
async function handleDislike() {
  if (potentialMatches.length === 0 || currentMatchIndex >= potentialMatches.length) {
    return;
  }
  
  const dislikedUser = potentialMatches[currentMatchIndex];
  
  try {
    // Disable buttons during request
    document.getElementById('likeBtn').disabled = true;
    document.getElementById('dislikeBtn').disabled = true;
    
    // Send dislike request to API
    await apiRequest(`/matches/dislike/${dislikedUser._id}`, 'POST');
    
    // Move to next potential match
    moveToNextMatch();
  } catch (error) {
    console.error('Error disliking user:', error);
    // Move to next potential match anyway
    moveToNextMatch();
  } finally {
    // Re-enable buttons
    document.getElementById('likeBtn').disabled = false;
    document.getElementById('dislikeBtn').disabled = false;
  }
}

// Move to next potential match
function moveToNextMatch() {
  currentMatchIndex++;
  currentPhotoIndex = 0;
  
  if (currentMatchIndex < potentialMatches.length) {
    showCurrentMatch();
  } else {
    showNoProfilesMessage();
  }
}

// Show match notification
function showMatchNotification(matchedUser) {
  // Update match notification
  document.getElementById('matchName').textContent = matchedUser.profile.name;
  document.getElementById('matchNameText').textContent = matchedUser.profile.name;
  
  // Update match photo
  const matchPhoto = document.getElementById('matchPhoto');
  if (matchedUser.profile.photos && matchedUser.profile.photos.length > 0) {
    matchPhoto.src = matchedUser.profile.photos[0].url;
  } else {
    matchPhoto.src = 'images/placeholder.jpg';
  }
  
  // Store matched user ID for message button
  document.getElementById('sendMessageBtn').dataset.userId = matchedUser._id;
  
  // Show notification and overlay
  document.getElementById('matchNotification').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

// Hide match notification
function hideMatchNotification() {
  document.getElementById('matchNotification').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  
  // Move to next potential match
  moveToNextMatch();
}

// Handle send message
function handleSendMessage() {
  const userId = document.getElementById('sendMessageBtn').dataset.userId;
  
  // Hide notification
  hideMatchNotification();
  
  // Redirect to messages page with user ID
  window.location.href = `messages.html?userId=${userId}`;
}