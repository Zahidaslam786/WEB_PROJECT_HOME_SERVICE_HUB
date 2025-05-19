/**
 * Handles the logout process for the user
 * @returns {Promise<boolean>} Whether logout was successful
 */
function handleLogout(event) {
  if (event) {
    event.preventDefault();
  }
  
  return fetch('/api/auth/logout', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showLogoutMessage('Logout successful!');
      
      // Redirect to home page after delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      return true;
    } else {
      showLogoutMessage('Logout failed. Please try again.', true);
      return false;
    }
  })
  .catch(error => {
    console.error('Logout error:', error);
    showLogoutMessage('An error occurred during logout.', true);
    return false;
  });
}

/**
 * Shows a message to the user after logout attempt
 * @param {string} message - The message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showLogoutMessage(message, isError = false) {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `logout-message${isError ? ' error' : ''}`;
  
  // Create message content
  messageEl.innerHTML = `
    <div style="display: flex; align-items: center;">
      <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}" 
         style="margin-right: 10px; color: ${isError ? '#e74c3c' : '#2ecc71'}; font-size: 18px;"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(messageEl);
  
  // Remove after delay
  setTimeout(() => {
    messageEl.classList.add('fadeOut');
    setTimeout(() => {
      messageEl.remove();
    }, 400);
  }, 3000);
}

/**
 * Adds logout buttons to the page
 */
function addLogoutButtons() {
  // Add stylesheet if it doesn't exist
  if (!document.querySelector('link[href="/public/css/logout.css"]')) {
    const logoutStyles = document.createElement('link');
    logoutStyles.rel = 'stylesheet';
    logoutStyles.href = '/public/css/logout.css';
    document.head.appendChild(logoutStyles);
  }
  
  // Check if user is logged in
  fetch('/api/auth/check-auth')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.user) {
        // Update header auth buttons
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
          authContainer.innerHTML = `
            <span style="margin-right: 10px; color: #4CAF50; font-weight: 500;">Welcome, ${data.user.name}</span>
            <button class="logout-btn" id="nav-logout-btn">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          `;
          
          // Add event listener to the logout button
          document.getElementById('nav-logout-btn').addEventListener('click', handleLogout);
        }
        
        // Add floating logout button
        const floatingBtn = document.createElement('button');
        floatingBtn.className = 'logout-btn logout-floating';
        floatingBtn.id = 'floating-logout-btn';
        floatingBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        floatingBtn.addEventListener('click', handleLogout);
        document.body.appendChild(floatingBtn);
      }
    })
    .catch(error => {
      console.error('Error checking auth status:', error);
    });
}

// Initialize logout functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', addLogoutButtons);
