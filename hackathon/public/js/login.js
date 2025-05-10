document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

async function handleLogin(e) {
  e.preventDefault();
  
  // Get form values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  // Validate form
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  // Create login data
  const loginData = {
    email,
    password
  };
  
  try {
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    // Make API request
    const response = await apiRequest('/users/login', 'POST', loginData);
    
    // Store token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Show success message
    showSuccess('Login successful! Redirecting...');
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
    
  } catch (error) {
    // Reset submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
    
    // Show error message
    showError(error.message || 'Invalid credentials');
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
    formContainer.insertBefore(errorEl, document.getElementById('loginForm'));
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
    formContainer.insertBefore(successEl, document.getElementById('loginForm'));
  }
  
  // Set success message
  successEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  
  // Scroll to success message
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}