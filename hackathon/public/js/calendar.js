// DataMatch - Calendar Integration
document.addEventListener('DOMContentLoaded', function() {
  const calendarGrid = document.getElementById('calendar-grid');
  const currentMonthElement = document.getElementById('current-month');
  const prevMonthButton = document.getElementById('prev-month');
  const nextMonthButton = document.getElementById('next-month');
  const addAvailabilityButton = document.getElementById('add-availability');
  const clearAvailabilityButton = document.getElementById('clear-availability');
  const availabilityToggle = document.getElementById('availability-visibility');
  
  // Current date tracking
  let currentDate = new Date();
  let selectedDates = [];
  let userAvailability = [];
  
  // Initialize calendar
  if (calendarGrid) {
    loadUserAvailability();
    renderCalendar(currentDate);
    
    // Add event listeners
    prevMonthButton.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
    
    nextMonthButton.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
    
    addAvailabilityButton.addEventListener('click', addAvailability);
    clearAvailabilityButton.addEventListener('click', clearSelectedDates);
    
    if (availabilityToggle) {
      availabilityToggle.addEventListener('change', updateAvailabilityVisibility);
    }
  }
  
  // Function to render calendar for a given month
  function renderCalendar(date) {
    if (!calendarGrid) return;
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'day-cell empty';
      calendarGrid.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'day-cell';
      dayCell.dataset.date = formatDate(new Date(date.getFullYear(), date.getMonth(), i));
      
      // Check if this day is today
      if (today.getDate() === i && 
          today.getMonth() === date.getMonth() && 
          today.getFullYear() === date.getFullYear()) {
        dayCell.classList.add('current');
      }
      
      // Check if this day is selected
      if (isDateSelected(new Date(date.getFullYear(), date.getMonth(), i))) {
        dayCell.classList.add('selected');
      }
      
      // Check if this day has availability
      if (hasAvailability(new Date(date.getFullYear(), date.getMonth(), i))) {
        dayCell.classList.add('has-availability');
      }
      
      // Add date number
      const dayNumber = document.createElement('span');
      dayNumber.className = 'day-number';
      dayNumber.textContent = i;
      dayCell.appendChild(dayNumber);
      
      // Add availability indicator if needed
      if (hasAvailability(new Date(date.getFullYear(), date.getMonth(), i))) {
        const indicator = document.createElement('span');
        indicator.className = 'availability-indicator';
        dayCell.appendChild(indicator);
      }
      
      // Add click event to toggle selection
      dayCell.addEventListener('click', () => {
        toggleDateSelection(dayCell);
      });
      
      calendarGrid.appendChild(dayCell);
    }
  }
  
  // Function to toggle date selection
  function toggleDateSelection(dayCell) {
    const dateStr = dayCell.dataset.date;
    const dateObj = new Date(dateStr);
    
    if (isDateSelected(dateObj)) {
      // Remove from selected dates
      selectedDates = selectedDates.filter(d => formatDate(d) !== dateStr);
      dayCell.classList.remove('selected');
    } else {
      // Add to selected dates
      selectedDates.push(dateObj);
      dayCell.classList.add('selected');
    }
  }
  
  // Function to check if a date is selected
  function isDateSelected(date) {
    return selectedDates.some(d => formatDate(d) === formatDate(date));
  }
  
  // Function to check if a date has availability
  function hasAvailability(date) {
    return userAvailability.some(d => formatDate(new Date(d.date)) === formatDate(date));
  }
  
  // Function to add availability to selected dates
  async function addAvailability() {
    if (selectedDates.length === 0) {
      showNotification('Please select dates to add availability', 'warning');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('You must be logged in to update availability', 'error');
        return;
      }
      
      // For each selected date, add a time picker modal
      const availabilityPromises = selectedDates.map(date => {
        return addTimeSlotToDate(date);
      });
      
      // Wait for all time slots to be selected
      const availabilityData = await Promise.all(availabilityPromises);
      
      // Filter out any null values (canceled selections)
      const validAvailabilityData = availabilityData.filter(item => item !== null);
      
      if (validAvailabilityData.length === 0) {
        return; // No valid time slots were added
      }
      
      // Save to server
      const response = await fetch('/api/users/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          availability: validAvailabilityData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save availability');
      }
      
      // Clear selected dates
      clearSelectedDates();
      
      // Reload availability and re-render calendar
      await loadUserAvailability();
      renderCalendar(currentDate);
      
      showNotification('Availability saved successfully', 'success');
    } catch (error) {
      console.error('Error saving availability:', error);
      showNotification('Failed to save availability. Please try again.', 'error');
    }
  }
  
  // Function to add time slot to a date
  function addTimeSlotToDate(date) {
    return new Promise((resolve) => {
      // Create modal overlay
      const modal = document.createElement('div');
      modal.className = 'time-slot-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>Set Availability for ${formatDateFriendly(date)}</h3>
          <form id="time-slot-form">
            <div class="form-group">
              <label for="start-time">Start Time</label>
              <input type="time" id="start-time" required>
            </div>
            <div class="form-group">
              <label for="end-time">End Time</label>
              <input type="time" id="end-time" required>
            </div>
            <div class="form-buttons">
              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-outline" id="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Show modal with animation
      setTimeout(() => {
        modal.style.opacity = '1';
      }, 10);
      
      // Handle form submission
      const form = modal.querySelector('#time-slot-form');
      const cancelBtn = modal.querySelector('#cancel-btn');
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const startTime = this.querySelector('#start-time').value;
        const endTime = this.querySelector('#end-time').value;
        
        // Validate time range
        if (startTime >= endTime) {
          alert('End time must be after start time');
          return;
        }
        
        // Close modal
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
        
        // Resolve with time slot data
        resolve({
          date: formatDate(date),
          startTime,
          endTime
        });
      });
      
      cancelBtn.addEventListener('click', function() {
        // Close modal
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
        
        // Resolve with null to indicate cancellation
        resolve(null);
      });
    });
  }
  
  // Function to clear selected dates
  function clearSelectedDates() {
    selectedDates = [];
    document.querySelectorAll('.day-cell.selected').forEach(cell => {
      cell.classList.remove('selected');
    });
  }
  
  // Function to load user availability from server
  async function loadUserAvailability() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const response = await fetch('/api/users/availability', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load availability');
      }
      
      const data = await response.json();
      userAvailability = data.availability || [];
      
      // Update visibility toggle if it exists
      if (availabilityToggle) {
        availabilityToggle.checked = data.showAvailability !== false; // Default to true
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      userAvailability = [];
    }
  }
  
  // Function to update availability visibility
  async function updateAvailabilityVisibility() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('You must be logged in to update settings', 'error');
        return;
      }
      
      const isVisible = availabilityToggle.checked;
      
      const response = await fetch('/api/users/settings/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          showAvailability: isVisible
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update visibility settings');
      }
      
      showNotification(`Availability is now ${isVisible ? 'visible' : 'hidden'} to others`, 'success');
    } catch (error) {
      console.error('Error updating availability visibility:', error);
      showNotification('Failed to update settings. Please try again.', 'error');
      
      // Revert toggle state
      availabilityToggle.checked = !availabilityToggle.checked;
    }
  }
  
  // Helper function to format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper function to format date in a friendly way
  function formatDateFriendly(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
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
  
  // Add CSS for notifications and modal
  const style = document.createElement('style');
  style.textContent = `
    .time-slot-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 12px;
      padding: 1.5rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .modal-content h3 {
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .form-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    
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
});