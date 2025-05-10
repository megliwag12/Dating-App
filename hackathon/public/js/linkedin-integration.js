// LinkedIn Profile Integration
document.addEventListener('DOMContentLoaded', function() {
  // Get references to LinkedIn elements
  const linkedinSection = document.getElementById('linkedin-data');
  if (!linkedinSection) return;
  
  // Tab switching elements
  const linkedinUrlTab = document.getElementById('linkedin-url-tab');
  const manualEntryTab = document.getElementById('manual-entry-tab');
  const linkedinUrlTabPane = document.getElementById('linkedin-url-tab-pane');
  const manualEntryTabPane = document.getElementById('manual-entry-tab-pane');
  
  // Forms
  const linkedinImportForm = document.getElementById('linkedin-import-form');
  const manualLinkedinForm = document.getElementById('manual-linkedin-form');
  
  // Buttons
  const addExperienceBtn = document.getElementById('add-experience');
  const addEducationBtn = document.getElementById('add-education');
  const editLinkedinDataBtn = document.getElementById('edit-linkedin-data');
  
  // Display containers
  const linkedinDataDisplay = document.getElementById('linkedin-data-display');
  const experienceContainer = document.getElementById('experience-container');
  const educationContainer = document.getElementById('education-container');
  
  // Data display elements
  const linkedinExperienceList = document.getElementById('linkedin-experience');
  const linkedinEducationList = document.getElementById('linkedin-education');
  const linkedinSkillsCloud = document.getElementById('linkedin-skills');
  const linkedinVisibilityToggle = document.getElementById('linkedin-visible');
  
  // Set up event listeners
  
  // Tab switching
  linkedinUrlTab.addEventListener('click', function() {
    // Hide manual entry, show URL import
    linkedinUrlTab.classList.add('active');
    manualEntryTab.classList.remove('active');
    linkedinUrlTabPane.classList.add('show', 'active');
    manualEntryTabPane.classList.remove('show', 'active');
  });
  
  manualEntryTab.addEventListener('click', function() {
    // Hide URL import, show manual entry
    manualEntryTab.classList.add('active');
    linkedinUrlTab.classList.remove('active');
    manualEntryTabPane.classList.add('show', 'active');
    linkedinUrlTabPane.classList.remove('show', 'active');
  });
  
  // Add additional experience entry
  addExperienceBtn.addEventListener('click', function() {
    const newExperience = document.createElement('div');
    newExperience.className = 'experience-entry';
    newExperience.innerHTML = `
      <hr>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" name="title" class="form-control" placeholder="Software Engineer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" name="company" class="form-control" placeholder="Tech Company">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Location</label>
          <input type="text" name="location" class="form-control" placeholder="San Francisco, CA">
        </div>
        <div class="form-group">
          <label>Start Date (YYYY-MM)</label>
          <input type="text" name="startDate" class="form-control" placeholder="2021-01">
        </div>
        <div class="form-group">
          <label>End Date (YYYY-MM or leave blank for current)</label>
          <input type="text" name="endDate" class="form-control" placeholder="2023-02">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" class="form-control" rows="2" placeholder="Brief description of your role and responsibilities"></textarea>
      </div>
      <button type="button" class="btn btn-outline-danger btn-sm remove-entry">Remove</button>
    `;
    
    experienceContainer.appendChild(newExperience);
    
    // Add event listener for the remove button
    newExperience.querySelector('.remove-entry').addEventListener('click', function() {
      experienceContainer.removeChild(newExperience);
    });
  });
  
  // Add additional education entry
  addEducationBtn.addEventListener('click', function() {
    const newEducation = document.createElement('div');
    newEducation.className = 'education-entry';
    newEducation.innerHTML = `
      <hr>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" name="institution" class="form-control" placeholder="University Name">
      </div>
      <div class="form-group">
        <label>Degree</label>
        <input type="text" name="degree" class="form-control" placeholder="Bachelor of Science">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Field of Study</label>
          <input type="text" name="field" class="form-control" placeholder="Computer Science">
        </div>
        <div class="form-group">
          <label>Start Year</label>
          <input type="text" name="startDate" class="form-control" placeholder="2015">
        </div>
        <div class="form-group">
          <label>End Year</label>
          <input type="text" name="endDate" class="form-control" placeholder="2019">
        </div>
      </div>
      <button type="button" class="btn btn-outline-danger btn-sm remove-entry">Remove</button>
    `;
    
    educationContainer.appendChild(newEducation);
    
    // Add event listener for the remove button
    newEducation.querySelector('.remove-entry').addEventListener('click', function() {
      educationContainer.removeChild(newEducation);
    });
  });
  
  // Handle LinkedIn URL import form submission
  linkedinImportForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get the LinkedIn URL
    const linkedinUrl = document.getElementById('linkedin-url').value.trim();
    
    // Validate the URL
    if (!linkedinUrl || !/linkedin\.com\/in\/[\w-]+\/?$/.test(linkedinUrl)) {
      showNotification('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)', 'error');
      return;
    }
    
    try {
      showNotification('Importing LinkedIn profile data...', 'info');
      
      // Call the server API to process the LinkedIn URL
      const response = await apiRequest('/api/users/linkedin', 'POST', { linkedinUrl });
      
      if (response.success) {
        showNotification('LinkedIn profile imported successfully!', 'success');
        // Update the UI with the imported data
        displayLinkedInData(response.linkedinData);
      } else {
        showNotification(response.message || 'Failed to import LinkedIn data', 'error');
      }
    } catch (error) {
      console.error('LinkedIn import error:', error);
      showNotification('An error occurred while importing your LinkedIn profile', 'error');
    }
  });
  
  // Handle manual LinkedIn data form submission
  manualLinkedinForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      showNotification('Saving your professional profile...', 'info');
      
      // Collect data from the form
      const manualData = {
        url: document.getElementById('manual-linkedin-url').value.trim(),
        experience: [],
        education: [],
        skills: document.getElementById('skills-input').value.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      // Collect all experience entries
      const experienceEntries = experienceContainer.querySelectorAll('.experience-entry');
      experienceEntries.forEach(entry => {
        const experience = {
          title: entry.querySelector('input[name="title"]').value.trim(),
          company: entry.querySelector('input[name="company"]').value.trim(),
          location: entry.querySelector('input[name="location"]').value.trim(),
          startDate: entry.querySelector('input[name="startDate"]').value.trim(),
          endDate: entry.querySelector('input[name="endDate"]').value.trim(),
          description: entry.querySelector('textarea[name="description"]').value.trim()
        };
        
        // Only add if at least title and company are provided
        if (experience.title && experience.company) {
          manualData.experience.push(experience);
        }
      });
      
      // Collect all education entries
      const educationEntries = educationContainer.querySelectorAll('.education-entry');
      educationEntries.forEach(entry => {
        const education = {
          institution: entry.querySelector('input[name="institution"]').value.trim(),
          degree: entry.querySelector('input[name="degree"]').value.trim(),
          field: entry.querySelector('input[name="field"]').value.trim(),
          startDate: entry.querySelector('input[name="startDate"]').value.trim(),
          endDate: entry.querySelector('input[name="endDate"]').value.trim()
        };
        
        // Only add if at least institution and degree are provided
        if (education.institution && education.degree) {
          manualData.education.push(education);
        }
      });
      
      // Call the server API to save the manual LinkedIn data
      const response = await apiRequest('/api/users/linkedin', 'POST', { manualData });
      
      if (response.success) {
        showNotification('Professional profile saved successfully!', 'success');
        // Update the UI with the saved data
        displayLinkedInData(response.linkedinData);
      } else {
        showNotification(response.message || 'Failed to save professional profile', 'error');
      }
    } catch (error) {
      console.error('Manual LinkedIn data save error:', error);
      showNotification('An error occurred while saving your professional profile', 'error');
    }
  });
  
  // Handle edit LinkedIn data button
  if (editLinkedinDataBtn) {
    editLinkedinDataBtn.addEventListener('click', function() {
      // Hide the data display and show the data entry form
      linkedinDataDisplay.style.display = 'none';
      
      // Switch to the manual entry tab
      manualEntryTab.click();
      
      // Populate the manual form with existing data
      populateManualForm();
    });
  }
  
  // Handle LinkedIn visibility toggle
  if (linkedinVisibilityToggle) {
    linkedinVisibilityToggle.addEventListener('change', async function() {
      try {
        const visible = linkedinVisibilityToggle.checked;
        
        // Call the server API to update visibility
        await apiRequest('/api/users/settings', 'POST', {
          linkedinVisible: visible
        });
        
        showNotification(
          visible ? 'Your professional data is now visible to others' : 'Your professional data is now hidden',
          'success'
        );
      } catch (error) {
        console.error('Error updating LinkedIn visibility:', error);
        showNotification('Failed to update visibility settings', 'error');
      }
    });
  }
  
  // Load existing LinkedIn data if available
  loadLinkedInData();
  
  // Helper Functions
  
  // Display LinkedIn data in the UI
  function displayLinkedInData(data) {
    if (!data) return;
    
    // Update the LinkedIn data display section
    
    // Experience
    linkedinExperienceList.innerHTML = '';
    if (data.experience && data.experience.length > 0) {
      data.experience.forEach(exp => {
        const li = document.createElement('li');
        const dateRange = exp.startDate + (exp.endDate ? ` - ${exp.endDate}` : ' - Present');
        
        li.innerHTML = `
          <div class="linkedin-item-header">
            <h5>${exp.title}</h5>
            <span class="date-range">${dateRange}</span>
          </div>
          <div class="linkedin-item-subheader">
            <span class="company">${exp.company}</span>
            ${exp.location ? `<span class="location">${exp.location}</span>` : ''}
          </div>
          ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
        `;
        
        linkedinExperienceList.appendChild(li);
      });
    } else {
      linkedinExperienceList.innerHTML = '<li class="empty-list">No professional experience added</li>';
    }
    
    // Education
    linkedinEducationList.innerHTML = '';
    if (data.education && data.education.length > 0) {
      data.education.forEach(edu => {
        const li = document.createElement('li');
        const dateRange = edu.startDate + (edu.endDate ? ` - ${edu.endDate}` : ' - Present');
        
        li.innerHTML = `
          <div class="linkedin-item-header">
            <h5>${edu.institution}</h5>
            <span class="date-range">${dateRange}</span>
          </div>
          <div class="linkedin-item-subheader">
            <span class="degree">${edu.degree}</span>
            ${edu.field ? `<span class="field">${edu.field}</span>` : ''}
          </div>
        `;
        
        linkedinEducationList.appendChild(li);
      });
    } else {
      linkedinEducationList.innerHTML = '<li class="empty-list">No education history added</li>';
    }
    
    // Skills
    linkedinSkillsCloud.innerHTML = '';
    if (data.skills && data.skills.length > 0) {
      data.skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        linkedinSkillsCloud.appendChild(span);
      });
    } else {
      linkedinSkillsCloud.innerHTML = '<p class="empty-list">No skills added</p>';
    }
    
    // Show the data display and hide the forms
    linkedinDataDisplay.style.display = 'block';
  }
  
  // Populate the manual entry form with existing data
  function populateManualForm() {
    // Get user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const linkedinData = userData.linkedinData || {};
    
    // URL
    if (linkedinData.url) {
      document.getElementById('manual-linkedin-url').value = linkedinData.url;
    }
    
    // Clear existing entries
    experienceContainer.innerHTML = '';
    educationContainer.innerHTML = '';
    
    // Add experience entries
    if (linkedinData.experience && linkedinData.experience.length > 0) {
      linkedinData.experience.forEach(exp => {
        addExperienceEntry(exp);
      });
    } else {
      // Add one empty experience entry
      const defaultExp = document.createElement('div');
      defaultExp.className = 'experience-entry';
      defaultExp.innerHTML = `
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" name="title" class="form-control" placeholder="Software Engineer">
        </div>
        <div class="form-group">
          <label>Company</label>
          <input type="text" name="company" class="form-control" placeholder="Tech Company">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Location</label>
            <input type="text" name="location" class="form-control" placeholder="San Francisco, CA">
          </div>
          <div class="form-group">
            <label>Start Date (YYYY-MM)</label>
            <input type="text" name="startDate" class="form-control" placeholder="2021-01">
          </div>
          <div class="form-group">
            <label>End Date (YYYY-MM or leave blank for current)</label>
            <input type="text" name="endDate" class="form-control" placeholder="2023-02">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description" class="form-control" rows="2" placeholder="Brief description of your role and responsibilities"></textarea>
        </div>
      `;
      experienceContainer.appendChild(defaultExp);
    }
    
    // Add education entries
    if (linkedinData.education && linkedinData.education.length > 0) {
      linkedinData.education.forEach(edu => {
        addEducationEntry(edu);
      });
    } else {
      // Add one empty education entry
      const defaultEdu = document.createElement('div');
      defaultEdu.className = 'education-entry';
      defaultEdu.innerHTML = `
        <div class="form-group">
          <label>Institution</label>
          <input type="text" name="institution" class="form-control" placeholder="University Name">
        </div>
        <div class="form-group">
          <label>Degree</label>
          <input type="text" name="degree" class="form-control" placeholder="Bachelor of Science">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Field of Study</label>
            <input type="text" name="field" class="form-control" placeholder="Computer Science">
          </div>
          <div class="form-group">
            <label>Start Year</label>
            <input type="text" name="startDate" class="form-control" placeholder="2015">
          </div>
          <div class="form-group">
            <label>End Year</label>
            <input type="text" name="endDate" class="form-control" placeholder="2019">
          </div>
        </div>
      `;
      educationContainer.appendChild(defaultEdu);
    }
    
    // Skills
    if (linkedinData.skills && linkedinData.skills.length > 0) {
      document.getElementById('skills-input').value = linkedinData.skills.join(', ');
    }
  }
  
  // Add an experience entry to the form with data
  function addExperienceEntry(data = {}) {
    const entry = document.createElement('div');
    entry.className = 'experience-entry';
    
    // Add hr if not the first entry
    const needsHr = experienceContainer.querySelectorAll('.experience-entry').length > 0;
    
    entry.innerHTML = `
      ${needsHr ? '<hr>' : ''}
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" name="title" class="form-control" value="${data.title || ''}" placeholder="Software Engineer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" name="company" class="form-control" value="${data.company || ''}" placeholder="Tech Company">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Location</label>
          <input type="text" name="location" class="form-control" value="${data.location || ''}" placeholder="San Francisco, CA">
        </div>
        <div class="form-group">
          <label>Start Date (YYYY-MM)</label>
          <input type="text" name="startDate" class="form-control" value="${data.startDate || ''}" placeholder="2021-01">
        </div>
        <div class="form-group">
          <label>End Date (YYYY-MM or leave blank for current)</label>
          <input type="text" name="endDate" class="form-control" value="${data.endDate || ''}" placeholder="2023-02">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" class="form-control" rows="2" placeholder="Brief description of your role and responsibilities">${data.description || ''}</textarea>
      </div>
      ${needsHr ? '<button type="button" class="btn btn-outline-danger btn-sm remove-entry">Remove</button>' : ''}
    `;
    
    experienceContainer.appendChild(entry);
    
    // Add event listener for the remove button
    const removeBtn = entry.querySelector('.remove-entry');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        experienceContainer.removeChild(entry);
      });
    }
  }
  
  // Add an education entry to the form with data
  function addEducationEntry(data = {}) {
    const entry = document.createElement('div');
    entry.className = 'education-entry';
    
    // Add hr if not the first entry
    const needsHr = educationContainer.querySelectorAll('.education-entry').length > 0;
    
    entry.innerHTML = `
      ${needsHr ? '<hr>' : ''}
      <div class="form-group">
        <label>Institution</label>
        <input type="text" name="institution" class="form-control" value="${data.institution || ''}" placeholder="University Name">
      </div>
      <div class="form-group">
        <label>Degree</label>
        <input type="text" name="degree" class="form-control" value="${data.degree || ''}" placeholder="Bachelor of Science">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Field of Study</label>
          <input type="text" name="field" class="form-control" value="${data.field || ''}" placeholder="Computer Science">
        </div>
        <div class="form-group">
          <label>Start Year</label>
          <input type="text" name="startDate" class="form-control" value="${data.startDate || ''}" placeholder="2015">
        </div>
        <div class="form-group">
          <label>End Year</label>
          <input type="text" name="endDate" class="form-control" value="${data.endDate || ''}" placeholder="2019">
        </div>
      </div>
      ${needsHr ? '<button type="button" class="btn btn-outline-danger btn-sm remove-entry">Remove</button>' : ''}
    `;
    
    educationContainer.appendChild(entry);
    
    // Add event listener for the remove button
    const removeBtn = entry.querySelector('.remove-entry');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        educationContainer.removeChild(entry);
      });
    }
  }
  
  // Load LinkedIn data from server or localStorage
  async function loadLinkedInData() {
    try {
      // First check localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (userData.linkedinData) {
        // Use cached data
        displayLinkedInData(userData.linkedinData);
      } else {
        // Fetch from server
        const response = await apiRequest('/api/users/linkedin', 'GET');
        if (response.success && response.linkedinData) {
          displayLinkedInData(response.linkedinData);
          
          // Cache the data
          userData.linkedinData = response.linkedinData;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error loading LinkedIn data:', error);
    }
  }
  
  // Helper function to show notifications
  function showNotification(message, type = 'info') {
    // Check if we have a notification element
    let notification = document.querySelector('.notification');
    
    // Create one if it doesn't exist
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Set the message and type
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    
    // Show the notification
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  // Helper function for API requests
  async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`/api${endpoint}`, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'API request failed');
      }
      
      return responseData;
    } catch (error) {
      console.error(`API error (${endpoint}):`, error);
      throw error;
    }
  }
  
  // Helper function to extract username from LinkedIn URL
  function getLinkedInUsername(url) {
    if (!url) return null;
    
    const match = url.match(/linkedin\.com\/in\/([^\/]+)/);
    return match ? match[1] : null;
  }
});