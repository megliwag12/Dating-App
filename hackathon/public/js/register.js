document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

async function handleRegister(e) {
  e.preventDefault();
  
  // Get form values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const location = document.getElementById('location').value;
  const bio = document.getElementById('bio').value;
  
  // Get selected interests
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
  const interests = Array.from(interestCheckboxes).map(checkbox => checkbox.value);
  
  // Get gender preferences
  const genderPreferenceSelect = document.getElementById('genderPreference');
  const genderPreference = Array.from(genderPreferenceSelect.selectedOptions).map(option => option.value);
  
  // Get age preferences
  const minAge = parseInt(document.getElementById('minAge').value);
  const maxAge = parseInt(document.getElementById('maxAge').value);
  
  // Get distance preference
  const maxDistance = parseInt(document.getElementById('maxDistance').value);
  
  // Validate form
  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }
  
  if (age < 18) {
    showError('You must be at least 18 years old to register');
    return;
  }
  
  // Create registration data
  const registrationData = {
    email,
    password,
    name,
    age,
    gender,
    location,
    bio,
    interests,
    preferences: {
      genderPreference,
      minAge,
      maxAge,
      maxDistance
    }
  };
  
  try {
    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    // Make API request
    const response = await apiRequest('/users/register', 'POST', registrationData);
    
    // Store token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Show success message
    showSuccess('Account created successfully! Redirecting to dashboard...');
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
    
  } catch (error) {
    // Reset submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
    
    // Show error message
    if (error.errors) {
      // Show validation errors
      const errorMessages = error.errors.map(err => err.msg).join('<br>');
      showError(errorMessages);
    } else {
      // Show general error message
      showError(error.message || 'An error occurred during registration');
    }
  }
}

function showError(message) {
  // Check if error element already exists
  let errorEl = document.querySelector('.form-error');
  
  // Create error element if it doesn't exist
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(errorEl, document.getElementById('registerForm'));
  }
  
  // Set error message
  errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  
  // Scroll to error
  errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess(message) {
  // Check if success element already exists
  let successEl = document.querySelector('.form-success');
  
  // Create success element if it doesn't exist
  if (!successEl) {
    successEl = document.createElement('div');
    successEl.className = 'form-success';
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(successEl, document.getElementById('registerForm'));
  }
  
  // Set success message
  successEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  
  // Scroll to success message
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}