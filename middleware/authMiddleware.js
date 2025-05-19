const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT authentication middleware
exports.authenticate = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Alias for routes expecting isAuth
exports.isAuth = exports.authenticate;

/**
 * Authentication and Authorization Middleware
 * Ensures users can only access their own data
 */

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token is in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check if token is in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    // If session authentication is available, try that instead of JWT
    if (req.session && req.session.isAuthenticated && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Admin privileges required to access this resource'
  });
};

// Middleware to check if user is a worker
exports.isWorker = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.user && req.session.user.role === 'worker') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Worker account required to access this resource'
  });
};

// Middleware to ensure a user can only access their own data
exports.canAccessUserData = (req, res, next) => {
  if (!req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const requestedUserId = req.params.userId || req.params.id;
  const currentUserId = req.session.user.id;
  const isAdmin = req.session.user.role === 'admin';
  
  // Allow if admin or accessing own data
  if (isAdmin || requestedUserId === currentUserId) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'You do not have permission to access this data'
  });
};

// Middleware to check booking access permission
exports.canAccessBooking = async (req, res, next) => {
  try {
    if (!req.session.isAuthenticated || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const bookingId = req.params.bookingId;
    const currentUserId = req.session.user.id;
    const isAdmin = req.session.user.role === 'admin';
    
    if (isAdmin) {
      return next(); // Admins can access all bookings
    }
    
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is the customer or the worker of this booking
    const isCustomer = booking.customer.toString() === currentUserId;
    
    if (req.session.user.role === 'worker') {
      const Worker = require('../models/Worker');
      const worker = await Worker.findOne({ user: currentUserId });
      const isBookingWorker = worker && booking.worker.toString() === worker._id.toString();
      
      if (isBookingWorker) {
        return next();
      }
    }
    
    if (isCustomer) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      message: 'You do not have permission to access this booking'
    });
  } catch (error) {
    console.error('Error in canAccessBooking middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking booking access permissions'
    });
  }
};
