document.addEventListener('DOMContentLoaded', function() {
  // Check URL parameters for verification success or password reset
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('verified') === 'true') {
    showMessage('Your email has been verified successfully! You can now login.', 'success');
  }
  if (urlParams.get('reset')) {
    showPasswordResetForm(urlParams.get('reset'));
  }

  // Handle login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showMessage('Login successful! Redirecting...', 'success');
          setTimeout(() => window.location.href = '/', 1500);
        } else {
          showMessage(data.message || 'Login failed', 'error');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        showMessage('An error occurred during login. Please try again.', 'error');
      });
    });
  }

  // Handle registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showMessage(data.message, 'success');
        } else {
          showMessage(data.message || 'Registration failed', 'error');
        }
      })
      .catch(error => {
        console.error('Registration error:', error);
        showMessage('An error occurred during registration. Please try again.', 'error');
      });
    });
  }

  // Handle forgot password form
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value;
      
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showMessage(data.message, 'success');
        } else {
          showMessage(data.message || 'Request failed', 'error');
        }
      })
      .catch(error => {
        console.error('Forgot password error:', error);
        showMessage('An error occurred. Please try again.', 'error');
      });
    });
  }

  // Check if user is already logged in
  checkAuthStatus();
});

// Check authentication status
function checkAuthStatus() {
  fetch('/api/auth/check-auth')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.user) {
        // User is logged in
        document.getElementById('user-greeting')?.textContent = `Hello, ${data.user.name}!`;
        
        // Show logout button if exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.style.display = 'block';
          logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Hide login/register forms if on auth page
        if (window.location.pathname.includes('auth')) {
          document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
          });
          
          // Show logged in message
          const authContainer = document.querySelector('.auth-container');
          if (authContainer) {
            const loggedInMsg = document.createElement('div');
            loggedInMsg.className = 'logged-in-message';
            loggedInMsg.innerHTML = `
              <h2>You are logged in as ${data.user.name}</h2>
              <p>Email: ${data.user.email}</p>
              <button id="logout-btn-auth" class="btn">Logout</button>
              <a href="/" class="btn secondary">Go to Homepage</a>
            `;
            authContainer.appendChild(loggedInMsg);
            
            document.getElementById('logout-btn-auth').addEventListener('click', handleLogout);
          }
        }
      }
    })
    .catch(error => {
      console.error('Auth check error:', error);
    });
}

// Handle logout
function handleLogout(e) {
  e.preventDefault();
  
  fetch('/api/auth/logout')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showMessage('Logged out successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      } else {
        showMessage('Logout failed', 'error');
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
      showMessage('An error occurred during logout', 'error');
    });
}

// Show password reset form
function showPasswordResetForm(token) {
  // Hide all forms
  document.querySelectorAll('.auth-form').forEach(form => {
    form.style.display = 'none';
  });
  
  // Create reset form if it doesn't exist
  let resetForm = document.getElementById('reset-form');
  if (!resetForm) {
    resetForm = document.createElement('form');
    resetForm.id = 'reset-form';
    resetForm.className = 'auth-form';
    resetForm.innerHTML = `
      <h2>Reset Password</h2>
      <div class="form-group">
        <label for="new-password">New Password</label>
        <input type="password" id="new-password" required minlength="8">
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input type="password" id="confirm-password" required minlength="8">
      </div>
      <input type="hidden" id="reset-token" value="${token}">
      <button type="submit" class="btn">Reset Password</button>
    `;
    
    // Add form to document
    document.querySelector('.auth-container')?.appendChild(resetForm);
    
    // Add event listener
    resetForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const resetToken = document.getElementById('reset-token').value;
      
      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }
      
      fetch(`/api/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showMessage(data.message, 'success');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        } else {
          showMessage(data.message || 'Password reset failed', 'error');
        }
      })
      .catch(error => {
        console.error('Reset password error:', error);
        showMessage('An error occurred. Please try again.', 'error');
      });
    });
  }
  
  // Show reset form
  resetForm.style.display = 'block';
}

// Display message function
function showMessage(message, type) {
  // Create or get message container
  let messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    document.body.insertBefore(messageContainer, document.body.firstChild);
  }
  
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  messageContainer.appendChild(messageElement);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}
