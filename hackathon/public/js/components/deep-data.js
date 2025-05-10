/**
 * Deep Data Integration Component
 * Handles functionality for the deep data section including
 * Spotify integration, purchase history, dietary patterns,
 * and text/emoji usage analysis
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Deep Data component loaded');
  window.deepDataComponentLoaded = true;
  // Initialize Spotify integration
  initSpotifyIntegration();
  // Initialize purchase history upload
  initPurchaseHistory();
  // Initialize dietary patterns form
  initDietaryPatterns();
  // Initialize text analysis
  initTextAnalysis();
  // Initialize tooltips
  initDataInfoTooltips();
});

/**
 * Initialize Spotify integration
 */
function initSpotifyIntegration() {
  const spotifyConnectBtn = document.getElementById('connect-spotify');
  const spotifyData = document.getElementById('spotify-data');

  if (spotifyConnectBtn) {
    console.log('Found Spotify connect button');
    spotifyConnectBtn.addEventListener('click', async function() {
      try {
        // Show connecting status
        spotifyConnectBtn.textContent = 'Connecting...';
        spotifyConnectBtn.disabled = true;

        // In a real app, this would redirect to Spotify OAuth
        // Here we'll simulate the connection process
        await simulateSpotifyConnection();

        // Update status and button
        spotifyConnectBtn.textContent = 'Refresh Spotify Data';
        spotifyConnectBtn.disabled = false;

        // Show spotify data section
        if (spotifyData) {
          spotifyData.style.display = 'block';
          // Add mock data
          updateSpotifyDisplay(spotifyData);
        }
      } catch (error) {
        console.error('Error connecting to Spotify:', error);
        spotifyConnectBtn.textContent = 'Connect with Spotify';
        spotifyConnectBtn.disabled = false;
      }
    });
  } else {
    console.log('Spotify connect button not found');
  }
}

/**
 * Simulate Spotify connection and data fetching
 * @returns {Promise<void>}
 */
async function simulateSpotifyConnection() {
  // Simulate connection delay
  return new Promise(resolve => setTimeout(resolve, 1500));
}

/**
 * Update Spotify display
 * @param {HTMLElement} spotifyData - The element to update with Spotify data
 */
function updateSpotifyDisplay(spotifyData) {
  if (!spotifyData) return;

  // Mock Spotify data
  const topArtists = [
    { name: 'Taylor Swift', genre: 'Pop' },
    { name: 'The Weeknd', genre: 'R&B' },
    { name: 'Dua Lipa', genre: 'Pop' },
    { name: 'Kendrick Lamar', genre: 'Hip-Hop' },
    { name: 'Tame Impala', genre: 'Alternative' }
  ];

  const topGenres = ['Pop', 'R&B', 'Hip-Hop', 'Alternative', 'Electronic'];

  const recentlyPlayed = [
    { title: 'Cruel Summer', artist: 'Taylor Swift' },
    { title: 'Blinding Lights', artist: 'The Weeknd' },
    { title: 'Levitating', artist: 'Dua Lipa' }
  ];

  // Find sections within the Spotify data display
  let artistSection = spotifyData.querySelector('.top-artists');
  let genreSection = spotifyData.querySelector('.top-genres');
  let recentSection = spotifyData.querySelector('.recently-played');

  // Create sections if they don't exist
  if (!artistSection) {
    artistSection = document.createElement('div');
    artistSection.className = 'data-section top-artists';
    artistSection.innerHTML = '<h4>Top Artists</h4>';
    spotifyData.appendChild(artistSection);
  }

  if (!genreSection) {
    genreSection = document.createElement('div');
    genreSection.className = 'data-section top-genres';
    genreSection.innerHTML = '<h4>Top Genres</h4>';
    spotifyData.appendChild(genreSection);
  }

  if (!recentSection) {
    recentSection = document.createElement('div');
    recentSection.className = 'data-section recently-played';
    recentSection.innerHTML = '<h4>Recently Played</h4>';
    spotifyData.appendChild(recentSection);
  }

  // Update artists section
  const artistsList = document.createElement('ul');
  artistsList.className = 'data-list';
  topArtists.forEach(artist => {
    const li = document.createElement('li');
    li.innerHTML = `${artist.name} <span class="genre-tag">${artist.genre}</span>`;
    artistsList.appendChild(li);
  });

  // Clear and append
  while (artistSection.childNodes.length > 1) {
    artistSection.removeChild(artistSection.lastChild);
  }
  artistSection.appendChild(artistsList);

  // Update genres section
  const genreTags = document.createElement('div');
  genreTags.className = 'genre-tags';
  topGenres.forEach(genre => {
    const span = document.createElement('span');
    span.className = 'genre-tag';
    span.textContent = genre;
    genreTags.appendChild(span);
  });

  // Clear and append
  while (genreSection.childNodes.length > 1) {
    genreSection.removeChild(genreSection.lastChild);
  }
  genreSection.appendChild(genreTags);

  // Update recently played section
  const recentList = document.createElement('ul');
  recentList.className = 'data-list';
  recentlyPlayed.forEach(track => {
    const li = document.createElement('li');
    li.innerHTML = `${track.title} <span class="artist-name">by ${track.artist}</span>`;
    recentList.appendChild(li);
  });

  // Clear and append
  while (recentSection.childNodes.length > 1) {
    recentSection.removeChild(recentSection.lastChild);
  }
  recentSection.appendChild(recentList);

  // Add insights
  let insightSection = spotifyData.querySelector('.data-insights');
  if (!insightSection) {
    insightSection = document.createElement('div');
    insightSection.className = 'data-insights';
    insightSection.innerHTML = `
      <h4>Music Insights</h4>
      <p>Your music taste suggests you're energetic, emotional, and appreciate both mainstream and alternative culture.</p>
    `;
    spotifyData.appendChild(insightSection);
  }
}

/**
 * Initialize purchase history upload
 */
function initPurchaseHistory() {
  const purchaseFileInput = document.getElementById('purchase-file');
  const purchaseUploadBtn = document.getElementById('purchase-upload');
  const purchaseStatus = document.getElementById('purchase-status');
  const purchasePreview = document.getElementById('purchase-preview');
  
  if (purchaseUploadBtn && purchaseFileInput) {
    purchaseUploadBtn.addEventListener('click', function() {
      purchaseFileInput.click();
    });
    
    purchaseFileInput.addEventListener('change', async function(e) {
      if (!this.files || this.files.length === 0) return;
      
      try {
        const file = this.files[0];
        
        // Update status
        purchaseStatus.textContent = `Uploading ${file.name}...`;
        purchaseStatus.className = 'status-connecting';
        
        // In a real app, this would upload and process the file
        // Here we'll simulate the processing
        await simulatePurchaseProcessing(file);
        
        // Update status
        purchaseStatus.textContent = 'Processed successfully';
        purchaseStatus.className = 'status-connected';
        
        // Show mock data preview
        updatePurchasePreview(purchasePreview);
      } catch (error) {
        console.error('Error processing purchase history:', error);
        purchaseStatus.textContent = 'Processing failed';
        purchaseStatus.className = 'status-error';
      }
    });
  }
}

/**
 * Simulate purchase history processing
 * @param {File} file - The file to process
 * @returns {Promise<void>}
 */
async function simulatePurchaseProcessing(file) {
  // Simulate processing delay
  console.log(`Processing file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
  return new Promise(resolve => setTimeout(resolve, 2000));
}

/**
 * Update purchase history preview
 * @param {HTMLElement} previewElement - The element to update with purchase data
 */
function updatePurchasePreview(previewElement) {
  if (!previewElement) return;
  
  // Mock purchase data
  const categories = [
    { name: 'Dining Out', percentage: 35, amount: '$385.50' },
    { name: 'Books & Education', percentage: 25, amount: '$275.25' },
    { name: 'Travel', percentage: 20, amount: '$220.00' },
    { name: 'Clothing', percentage: 15, amount: '$165.00' },
    { name: 'Entertainment', percentage: 5, amount: '$55.00' }
  ];
  
  // Create HTML for the preview
  previewElement.innerHTML = `
    <div class="data-preview-section">
      <h4>Spending by Category</h4>
      <div class="spending-chart">
        ${categories.map(category => `
          <div class="spending-bar">
            <div class="bar-label">${category.name}</div>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${category.percentage}%"></div>
            </div>
            <div class="bar-value">${category.amount}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="data-insights">
      <h4>Spending Insights</h4>
      <p>Your spending suggests you value experiences, education, and food quality. You're likely to enjoy cultural activities and trying new restaurants.</p>
    </div>
  `;
}

/**
 * Initialize dietary patterns form
 */
function initDietaryPatterns() {
  const dietaryForm = document.getElementById('dietary-form');
  const dietaryStatus = document.getElementById('dietary-status');
  const dietaryPreview = document.getElementById('dietary-preview');
  
  if (dietaryForm) {
    dietaryForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        // Get form data
        const formData = new FormData(dietaryForm);
        const dietaryData = {
          dietType: formData.get('diet-type'),
          restrictions: Array.from(document.querySelectorAll('input[name="restrictions"]:checked'))
            .map(el => el.value),
          cookingFrequency: formData.get('cooking-frequency'),
          foodPreferences: formData.get('food-preferences')
        };
        
        // Update status
        dietaryStatus.textContent = 'Saving...';
        dietaryStatus.className = 'status-connecting';
        
        // In a real app, this would save to the server
        // Here we'll simulate the processing
        await simulateDietarySaving(dietaryData);
        
        // Update status
        dietaryStatus.textContent = 'Saved successfully';
        dietaryStatus.className = 'status-connected';
        
        // Show data preview
        updateDietaryPreview(dietaryPreview, dietaryData);
      } catch (error) {
        console.error('Error saving dietary patterns:', error);
        dietaryStatus.textContent = 'Save failed';
        dietaryStatus.className = 'status-error';
      }
    });
  }
}

/**
 * Simulate dietary data saving
 * @param {Object} data - The dietary data to save
 * @returns {Promise<void>}
 */
async function simulateDietarySaving(data) {
  // Simulate save delay
  console.log('Saving dietary data:', data);
  return new Promise(resolve => setTimeout(resolve, 800));
}

/**
 * Update dietary patterns preview
 * @param {HTMLElement} previewElement - The element to update
 * @param {Object} dietaryData - The dietary data
 */
function updateDietaryPreview(previewElement, dietaryData) {
  if (!previewElement) return;
  
  // Create HTML for the preview
  previewElement.innerHTML = `
    <div class="data-preview-section">
      <h4>Dietary Profile</h4>
      <div class="profile-details">
        <div class="profile-item">
          <span class="profile-label">Diet Type:</span>
          <span class="profile-value">${dietaryData.dietType || 'Not specified'}</span>
        </div>
        
        <div class="profile-item">
          <span class="profile-label">Restrictions:</span>
          <span class="profile-value">${dietaryData.restrictions.length > 0 ? dietaryData.restrictions.join(', ') : 'None'}</span>
        </div>
        
        <div class="profile-item">
          <span class="profile-label">Cooking Frequency:</span>
          <span class="profile-value">${dietaryData.cookingFrequency || 'Not specified'}</span>
        </div>
      </div>
    </div>
    
    <div class="data-preview-section">
      <h4>Food Preferences</h4>
      <p>${dietaryData.foodPreferences || 'No preferences specified'}</p>
    </div>
    
    <div class="data-insights">
      <h4>Dietary Insights</h4>
      <p>Your diet suggests you're health-conscious and mindful about your food choices. You'd likely match well with partners who share similar dietary habits.</p>
    </div>
  `;
}

/**
 * Initialize text analysis section
 */
function initTextAnalysis() {
  const textAnalyzeBtn = document.getElementById('text-analyze');
  const textSample = document.getElementById('text-sample');
  const textStatus = document.getElementById('text-status');
  const textPreview = document.getElementById('text-preview');
  
  if (textAnalyzeBtn && textSample) {
    textAnalyzeBtn.addEventListener('click', async function() {
      if (!textSample.value.trim()) {
        showNotification('Please enter a text sample to analyze', 'error');
        return;
      }
      
      try {
        // Update status
        textStatus.textContent = 'Analyzing...';
        textStatus.className = 'status-connecting';
        
        // In a real app, this would analyze the text
        // Here we'll simulate the analysis
        await simulateTextAnalysis(textSample.value);
        
        // Update status
        textStatus.textContent = 'Analysis complete';
        textStatus.className = 'status-connected';
        
        // Show mock analysis results
        updateTextAnalysisPreview(textPreview, textSample.value);
      } catch (error) {
        console.error('Error analyzing text:', error);
        textStatus.textContent = 'Analysis failed';
        textStatus.className = 'status-error';
      }
    });
  }
}

/**
 * Simulate text analysis
 * @param {string} text - The text to analyze
 * @returns {Promise<void>}
 */
async function simulateTextAnalysis(text) {
  // Simulate analysis delay
  console.log(`Analyzing text sample (${text.length} characters)`);
  return new Promise(resolve => setTimeout(resolve, 1500));
}

/**
 * Update text analysis preview
 * @param {HTMLElement} previewElement - The element to update
 * @param {string} textSample - The text sample that was analyzed
 */
function updateTextAnalysisPreview(previewElement, textSample) {
  if (!previewElement) return;
  
  // Get some basic stats from the text
  const wordCount = textSample.split(/\s+/).filter(Boolean).length;
  const charCount = textSample.length;
  const emojiCount = (textSample.match(/[\p{Emoji}]/gu) || []).length;
  const exclamationCount = (textSample.match(/!/g) || []).length;
  const questionCount = (textSample.match(/\?/g) || []).length;
  
  // Fake sentiment analysis
  const sentiment = Math.random() > 0.5 ? 'Positive' : 'Neutral';
  
  // Mock emotion distribution
  const emotions = [
    { name: 'Joy', percentage: Math.floor(Math.random() * 50) + 20 },
    { name: 'Curiosity', percentage: Math.floor(Math.random() * 30) + 10 },
    { name: 'Enthusiasm', percentage: Math.floor(Math.random() * 20) + 10 }
  ];
  
  // Sort emotions by percentage
  emotions.sort((a, b) => b.percentage - a.percentage);
  
  // Create HTML for the preview
  previewElement.innerHTML = `
    <div class="data-preview-section">
      <h4>Text Statistics</h4>
      <div class="profile-details">
        <div class="profile-item">
          <span class="profile-label">Words:</span>
          <span class="profile-value">${wordCount}</span>
        </div>
        
        <div class="profile-item">
          <span class="profile-label">Characters:</span>
          <span class="profile-value">${charCount}</span>
        </div>
        
        <div class="profile-item">
          <span class="profile-label">Emojis:</span>
          <span class="profile-value">${emojiCount}</span>
        </div>
        
        <div class="profile-item">
          <span class="profile-label">Sentiment:</span>
          <span class="profile-value">${sentiment}</span>
        </div>
      </div>
    </div>
    
    <div class="data-preview-section">
      <h4>Emotional Tone</h4>
      <div class="emotion-chart">
        ${emotions.map(emotion => `
          <div class="emotion-bar">
            <div class="bar-label">${emotion.name}</div>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${emotion.percentage}%"></div>
            </div>
            <div class="bar-value">${emotion.percentage}%</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="data-insights">
      <h4>Communication Insights</h4>
      <p>Your writing style suggests you're ${exclamationCount > 3 ? 'expressive' : 'measured'} and ${questionCount > 3 ? 'inquisitive' : 'direct'}. You tend to ${emojiCount > 3 ? 'use emojis to enhance emotional expression' : 'rely more on words than emojis'}.</p>
    </div>
  `;
}

/**
 * Initialize info tooltips for data sections
 */
function initDataInfoTooltips() {
  document.querySelectorAll('.info-icon').forEach(icon => {
    const tooltip = icon.getAttribute('data-tooltip');
    if (tooltip) {
      icon.addEventListener('mouseenter', function(e) {
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';
        tooltipEl.textContent = tooltip;
        document.body.appendChild(tooltipEl);
        
        const rect = icon.getBoundingClientRect();
        tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 5}px`;
        tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
        tooltipEl.style.opacity = '1';
        
        icon.tooltipEl = tooltipEl;
      });
      
      icon.addEventListener('mouseleave', function() {
        if (icon.tooltipEl) {
          document.body.removeChild(icon.tooltipEl);
          icon.tooltipEl = null;
        }
      });
    }
  });
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
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