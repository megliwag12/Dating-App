// DataMatch - Location Integration
document.addEventListener('DOMContentLoaded', function() {
  const locationInput = document.getElementById('location-input');
  const currentLocationBtn = document.getElementById('get-current-location');
  const distanceRange = document.getElementById('distance-range');
  const distanceValue = document.getElementById('distance-value');
  const locationVisibilityToggle = document.getElementById('location-visibility');
  const mapContainer = document.getElementById('location-map');
  
  let map = null;
  let userMarker = null;
  let userLocation = {
    lat: null,
    lng: null,
    address: ''
  };
  
  // Initialize map if container exists
  if (mapContainer) {
    initializeMap();
    loadUserLocation();
    
    // Add event listeners
    if (locationInput) {
      locationInput.addEventListener('change', geocodeAddress);
    }
    
    if (currentLocationBtn) {
      currentLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    if (distanceRange) {
      distanceRange.addEventListener('input', updateDistanceValue);
      // Initial update
      updateDistanceValue();
    }
    
    if (locationVisibilityToggle) {
      locationVisibilityToggle.addEventListener('change', updateLocationVisibility);
    }
  }
  
  // Function to initialize the map
  function initializeMap() {
    // Create a default map centered on a fallback location (e.g., US)
    map = L.map(mapContainer).setView([37.7749, -122.4194], 4);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Resize the map after initialization to fix rendering issues
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
  }
  
  // Function to load user location from server
  async function loadUserLocation() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/users/location', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load location data');
      }
      
      const data = await response.json();
      
      if (data.location) {
        userLocation = {
          lat: data.location.lat,
          lng: data.location.lng,
          address: data.location.address || ''
        };
        
        // Update input field with address
        if (locationInput && userLocation.address) {
          locationInput.value = userLocation.address;
        }
        
        // Update distance slider
        if (distanceRange && data.distance) {
          distanceRange.value = data.distance;
          updateDistanceValue();
        }
        
        // Update visibility toggle
        if (locationVisibilityToggle && data.hasOwnProperty('showLocation')) {
          locationVisibilityToggle.checked = data.showLocation;
        }
        
        // Update map
        updateMapWithLocation(userLocation.lat, userLocation.lng);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  }
  
  // Function to get current location using browser geolocation
  function getCurrentLocation() {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser', 'error');
      return;
    }
    
    // Show loading indicator
    currentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    currentLocationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Update map
        updateMapWithLocation(lat, lng);
        
        // Reverse geocode to get address
        try {
          const address = await reverseGeocode(lat, lng);
          
          // Update user location
          userLocation = {
            lat,
            lng,
            address
          };
          
          // Update input field
          if (locationInput) {
            locationInput.value = address;
          }
          
          // Save location to server
          saveLocation();
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          
          // Still update coordinates even if geocoding fails
          userLocation = {
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          };
          
          if (locationInput) {
            locationInput.value = userLocation.address;
          }
          
          saveLocation();
        }
        
        // Reset button
        currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        currentLocationBtn.disabled = false;
      },
      // Error callback
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'You denied the request for geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get your location timed out';
            break;
        }
        
        showNotification(errorMessage, 'error');
        
        // Reset button
        currentLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        currentLocationBtn.disabled = false;
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }
  
  // Function to geocode an address to coordinates
  async function geocodeAddress() {
    const address = locationInput.value.trim();
    
    if (!address) return;
    
    try {
      // Use Nominatim API (OpenStreetMap) for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Update map
        updateMapWithLocation(lat, lng);
        
        // Update user location
        userLocation = {
          lat,
          lng,
          address: result.display_name || address
        };
        
        // Save location to server
        saveLocation();
      } else {
        showNotification('Could not find this location. Please try a different address.', 'warning');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      showNotification('Failed to find this location. Please try again.', 'error');
    }
  }
  
  // Function to reverse geocode coordinates to address
  async function reverseGeocode(lat, lng) {
    // Use Nominatim API (OpenStreetMap) for reverse geocoding
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    } else {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }
  
  // Function to update the map with a location
  function updateMapWithLocation(lat, lng) {
    if (!map) return;
    
    // Set view to the new location
    map.setView([lat, lng], 13);
    
    // Remove existing marker if any
    if (userMarker) {
      map.removeLayer(userMarker);
    }
    
    // Add a new marker
    userMarker = L.marker([lat, lng]).addTo(map);
    
    // Add a circle to show the match distance
    const distanceInMeters = (parseInt(distanceRange.value) || 25) * 1609.34; // miles to meters
    
    // Remove existing circle if any
    if (window.distanceCircle) {
      map.removeLayer(window.distanceCircle);
    }
    
    // Add new circle
    window.distanceCircle = L.circle([lat, lng], {
      radius: distanceInMeters,
      fillColor: '#4f46e5',
      fillOpacity: 0.1,
      color: '#4f46e5',
      weight: 1
    }).addTo(map);
  }
  
  // Function to update distance range value display
  function updateDistanceValue() {
    if (!distanceValue || !distanceRange) return;
    
    distanceValue.textContent = distanceRange.value;
    
    // If we have a location, update the circle on the map
    if (userLocation.lat && userLocation.lng) {
      const distanceInMeters = parseInt(distanceRange.value) * 1609.34; // miles to meters
      
      if (window.distanceCircle) {
        window.distanceCircle.setRadius(distanceInMeters);
      } else if (map && userMarker) {
        // Create circle if it doesn't exist
        window.distanceCircle = L.circle([userLocation.lat, userLocation.lng], {
          radius: distanceInMeters,
          fillColor: '#4f46e5',
          fillOpacity: 0.1,
          color: '#4f46e5',
          weight: 1
        }).addTo(map);
      }
    }
    
    // Save distance preference to server (debounced)
    if (window.saveDistanceTimeout) {
      clearTimeout(window.saveDistanceTimeout);
    }
    
    window.saveDistanceTimeout = setTimeout(() => {
      saveLocation();
    }, 500);
  }
  
  // Function to save location to server
  async function saveLocation() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('You must be logged in to save location', 'error');
        return;
      }
      
      // Check if we have location data
      if (!userLocation.lat || !userLocation.lng) {
        return;
      }
      
      const distance = parseInt(distanceRange.value) || 25;
      const showLocation = locationVisibilityToggle ? locationVisibilityToggle.checked : true;
      
      const response = await fetch('/api/users/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          location: userLocation,
          distance,
          showLocation
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save location');
      }
      
      // No notification for automatic saves
    } catch (error) {
      console.error('Error saving location:', error);
      showNotification('Failed to save location. Please try again.', 'error');
    }
  }
  
  // Function to update location visibility setting
  async function updateLocationVisibility() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('You must be logged in to update settings', 'error');
        return;
      }
      
      const isVisible = locationVisibilityToggle.checked;
      
      const response = await fetch('/api/users/settings/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          showLocation: isVisible
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update visibility settings');
      }
      
      showNotification(`Location is now ${isVisible ? 'visible' : 'hidden'} to others`, 'success');
    } catch (error) {
      console.error('Error updating location visibility:', error);
      showNotification('Failed to update settings. Please try again.', 'error');
      
      // Revert toggle state
      locationVisibilityToggle.checked = !locationVisibilityToggle.checked;
    }
  }
  
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
});