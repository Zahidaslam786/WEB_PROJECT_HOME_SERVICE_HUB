// Main JavaScript for Home Service Hub

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  checkAuthStatus();
  
  // Setup invite functionality
  setupInviteForm();
  
  // Setup search functionality
  setupSearch();
});

// Check if user is logged in and update UI accordingly
function checkAuthStatus() {
  fetch('/api/auth/check-auth')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.user) {
        // User is logged in
        updateLoggedInUI(data.user);
        loadUserData(data.user.id);
      } else {
        // User is not logged in
        updateLoggedOutUI();
      }
    })
    .catch(error => {
      console.error('Error checking auth status:', error);
    });
}

// Update UI for logged in users
function updateLoggedInUI(user) {
  // Update auth buttons
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    authContainer.innerHTML = `
      <span class="welcome-text">Welcome, ${user.name}</span>
      <a href="#" class="auth-btn logout-btn" id="logout-btn">Logout</a>
    `;
    
    // Add logout functionality
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      fetch('/api/auth/logout')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            window.location.reload();
          }
        });
    });
  }
  
  // Show user dashboard and hide login required overlay
  const loginRequired = document.getElementById('login-required');
  const userData = document.getElementById('user-data');
  
  if (loginRequired && userData) {
    loginRequired.style.display = 'none';
    userData.style.display = 'block';
  }
  
  // Show invite form properly
  const inviteForm = document.getElementById('invite-form-container');
  if (inviteForm) {
    inviteForm.classList.add('logged-in');
  }
}

// Update UI for logged out users
function updateLoggedOutUI() {
  // Show login required overlay and hide user dashboard
  const loginRequired = document.getElementById('login-required');
  const userData = document.getElementById('user-data');
  
  if (loginRequired && userData) {
    loginRequired.style.display = 'flex';
    userData.style.display = 'none';
  }
}

// Load user-specific data
function loadUserData(userId) {
  // Fetch user bookings
  fetch(`/api/user/bookings`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateDashboardCounts('booking-count', data.bookings.length);
      }
    })
    .catch(error => {
      console.error('Error loading bookings:', error);
    });
    
  // Fetch user favorites
  fetch(`/api/user/favorites`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateDashboardCounts('favorite-count', data.favorites.length);
      }
    })
    .catch(error => {
      console.error('Error loading favorites:', error);
    });
    
  // Fetch user offers
  fetch(`/api/user/offers`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateDashboardCounts('offers-count', data.offers.length);
      }
    })
    .catch(error => {
      console.error('Error loading offers:', error);
    });
}

// Update dashboard counters
function updateDashboardCounts(elementId, count) {
  const countElement = document.getElementById(elementId);
  if (countElement) {
    countElement.textContent = count;
  }
}

// Setup invite form functionality
function setupInviteForm() {
  const inviteBtn = document.getElementById('send-invite-btn');
  const inviteMessage = document.getElementById('invite-message');
  
  if (inviteBtn) {
    inviteBtn.addEventListener('click', function() {
      const emailInput = document.getElementById('friend-email');
      const email = emailInput.value.trim();
      
      if (!email || !validateEmail(email)) {
        showInviteMessage('Please enter a valid email address', 'error');
        return;
      }
      
      // Send invitation
      fetch('/api/user/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showInviteMessage('Invitation sent successfully!', 'success');
          emailInput.value = '';
        } else {
          showInviteMessage(data.message || 'Failed to send invitation', 'error');
        }
      })
      .catch(error => {
        console.error('Error sending invitation:', error);
        showInviteMessage('An error occurred. Please try again later.', 'error');
      });
    });
  }
}

// Display invite message
function showInviteMessage(message, type) {
  const inviteMessage = document.getElementById('invite-message');
  if (inviteMessage) {
    inviteMessage.textContent = message;
    inviteMessage.className = type;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      inviteMessage.textContent = '';
      inviteMessage.className = '';
    }, 5000);
  }
}

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Setup search functionality
function setupSearch() {
  const searchForm = document.querySelector('.search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const searchInput = document.querySelector('.search-input').value.trim();
      const locationSelect = document.querySelector('.location-select').value;
      
      // Redirect to services page with search params
      if (searchInput || locationSelect !== 'Select City') {
        const params = new URLSearchParams();
        if (searchInput) params.append('q', searchInput);
        if (locationSelect !== 'Select City') params.append('location', locationSelect);
        
        window.location.href = `services.html?${params.toString()}`;
      }
    });
  }
}

// Add this new function to handle logout across all pages

/**
 * Global logout function that can be called from any page
 */
function logoutUser() {
  return fetch('/api/auth/logout')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success notification
        showNotification('Successfully logged out', 'success');
        
        // Redirect to home after delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        
        return true;
      } else {
        showNotification('Logout failed', 'error');
        return false;
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
      showNotification('An error occurred during logout', 'error');
      return false;
    });
}

/**
 * Display notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success' or 'error')
 */
function showNotification(message, type = 'success') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('global-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'global-notification';
    document.body.appendChild(notification);
  }
  
  // Set notification content and class
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Show notification
  notification.style.display = 'block';
  
  // Hide notification after delay
  setTimeout(() => {
    notification.classList.add('hiding');
    setTimeout(() => {
      notification.style.display = 'none';
      notification.classList.remove('hiding');
    }, 500);
  }, 3000);
}
