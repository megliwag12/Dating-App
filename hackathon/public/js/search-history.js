// DataMatch - Search History Integration
document.addEventListener('DOMContentLoaded', function() {
  const searchHistoryContainer = document.getElementById('search-history-container');
  const searchAnalyticsContainer = document.getElementById('search-analytics-container');
  const searchForm = document.getElementById('search-form');
  
  // Load search history when profile page loads
  if (searchHistoryContainer) {
    loadSearchHistory();
  }
  
  // Add event listener to search form
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  // Function to load search history
  async function loadSearchHistory() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to view search history');
        return;
      }
      
      const response = await fetch('/api/users/search-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load search history');
      }
      
      const data = await response.json();
      displaySearchHistory(data.searchHistory);
      displaySearchAnalytics(data.analytics);
    } catch (error) {
      console.error('Error loading search history:', error);
      showError('Failed to load search history. Please try again later.');
    }
  }
  
  // Function to handle new search submissions
  async function handleSearch(e) {
    e.preventDefault();
    
    const searchQuery = document.getElementById('search-query').value.trim();
    const searchCategory = document.getElementById('search-category').value;
    
    if (!searchQuery) {
      showError('Please enter a search query');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to save search history');
        return;
      }
      
      const response = await fetch('/api/users/search-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          searchQuery,
          category: searchCategory
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save search');
      }
      
      // Clear search form
      document.getElementById('search-query').value = '';
      
      // Reload search history to show the new search
      loadSearchHistory();
    } catch (error) {
      console.error('Error saving search:', error);
      showError('Failed to save search. Please try again later.');
    }
  }
  
  // Function to display search history in the UI
  function displaySearchHistory(searchHistory) {
    if (!searchHistoryContainer) return;
    
    if (!searchHistory || searchHistory.length === 0) {
      searchHistoryContainer.innerHTML = '<p>No search history found.</p>';
      return;
    }
    
    // Sort by date (newest first)
    const sortedHistory = [...searchHistory].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    let html = '<h3>Your Recent Searches</h3><ul class="search-history-list">';
    
    sortedHistory.forEach(item => {
      const date = new Date(item.timestamp).toLocaleString();
      html += `
        <li class="search-item">
          <div class="search-query">${escapeHtml(item.searchQuery)}</div>
          <div class="search-meta">
            <span class="search-category">${item.category || 'General'}</span>
            <span class="search-date">${date}</span>
          </div>
          <button class="btn-repeat-search" data-query="${escapeHtml(item.searchQuery)}" data-category="${item.category || 'General'}">
            <i class="fas fa-redo"></i> Repeat
          </button>
        </li>
      `;
    });
    
    html += '</ul>';
    searchHistoryContainer.innerHTML = html;
    
    // Add event listeners to repeat search buttons
    document.querySelectorAll('.btn-repeat-search').forEach(button => {
      button.addEventListener('click', function() {
        const query = this.getAttribute('data-query');
        const category = this.getAttribute('data-category');
        
        // Populate search form with these values
        if (document.getElementById('search-query')) {
          document.getElementById('search-query').value = query;
        }
        if (document.getElementById('search-category')) {
          document.getElementById('search-category').value = category;
        }
        
        // Scroll to search form
        if (searchForm) {
          searchForm.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
  
  // Function to display search analytics
  function displaySearchAnalytics(analytics) {
    if (!searchAnalyticsContainer || !analytics) return;
    
    let html = '<h3>Search Insights</h3><div class="analytics-grid">';
    
    // Most searched categories
    html += '<div class="analytics-card">';
    html += '<h4>Top Categories</h4>';
    if (analytics.topCategories && analytics.topCategories.length > 0) {
      html += '<ul class="analytics-list">';
      analytics.topCategories.forEach(cat => {
        html += `<li><span class="category-name">${cat.name}</span> <span class="category-count">${cat.count}</span></li>`;
      });
      html += '</ul>';
    } else {
      html += '<p>No category data available</p>';
    }
    html += '</div>';
    
    // Search volume over time
    html += '<div class="analytics-card">';
    html += '<h4>Recent Activity</h4>';
    if (analytics.recentActivity) {
      html += `
        <div class="activity-stats">
          <div class="stat">
            <span class="stat-value">${analytics.recentActivity.today || 0}</span>
            <span class="stat-label">Today</span>
          </div>
          <div class="stat">
            <span class="stat-value">${analytics.recentActivity.thisWeek || 0}</span>
            <span class="stat-label">This Week</span>
          </div>
          <div class="stat">
            <span class="stat-value">${analytics.recentActivity.thisMonth || 0}</span>
            <span class="stat-label">This Month</span>
          </div>
        </div>
      `;
    } else {
      html += '<p>No activity data available</p>';
    }
    html += '</div>';
    
    // Common search terms
    html += '<div class="analytics-card">';
    html += '<h4>Common Terms</h4>';
    if (analytics.commonTerms && analytics.commonTerms.length > 0) {
      html += '<div class="tag-cloud">';
      analytics.commonTerms.forEach(term => {
        const fontSize = Math.max(1, Math.min(2, 1 + (term.count / 10))); // Scale font size between 1em and 2em
        html += `<span class="search-tag" style="font-size: ${fontSize}em">${term.term}</span>`;
      });
      html += '</div>';
    } else {
      html += '<p>No common terms found</p>';
    }
    html += '</div>';
    
    html += '</div>'; // Close analytics-grid
    searchAnalyticsContainer.innerHTML = html;
  }
  
  // Helper function to show errors
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert at top of containers if they exist
    if (searchHistoryContainer) {
      searchHistoryContainer.prepend(errorDiv);
      // Remove after 5 seconds
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }
  
  // Helper function to escape HTML
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});