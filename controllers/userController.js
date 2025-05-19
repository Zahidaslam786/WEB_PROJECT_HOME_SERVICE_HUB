const User = require('../models/User');
const Booking = require('../models/Booking');
const { Service } = require('../models/Service');
const emailService = require('../utils/emailService');
const crypto = require('crypto');

// Get user profile
exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Use JWT-authenticated user
    const userId = req.user._id;

    const { name, phoneNumber, street, city, state, zipCode } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Update address fields
    if (!user.address) user.address = {};
    if (street) user.address.street = street;
    if (city) user.address.city = city;
    if (state) user.address.state = state;
    if (zipCode) user.address.zipCode = zipCode;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileCompletion: user.profileCompletionPercentage
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    // Use JWT-authenticated user
    const userId = req.user._id;

    // Different queries based on user role
    let bookings;

    if (req.user.role === 'worker') {
      // For workers, get worker ID first
      const Worker = require('../models/Worker');
      const worker = await Worker.findOne({ user: userId });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found'
        });
      }

      // Get bookings where this worker is assigned
      bookings = await Booking.find({ worker: worker._id })
        .populate('service', 'name description')
        .populate('customer', 'name email phoneNumber')
        .sort({ scheduledDate: -1 });
    } else {
      // For regular customers, get their bookings
      bookings = await Booking.find({ customer: userId })
        .populate('service', 'name description')
        .populate({
          path: 'worker',
          select: 'rating services',
          populate: {
            path: 'user',
            select: 'name profileImage'
          }
        })
        .sort({ scheduledDate: -1 });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// Get user favorite services
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('favorites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favorites'
    });
  }
};

// Add service to favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceId } = req.body;

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Add to favorites if not already added
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: serviceId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service added to favorites'
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating favorites'
    });
  }
};

// Remove service from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceId } = req.params;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: serviceId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service removed from favorites'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating favorites'
    });
  }
};

// Get personalized offers/recommendations
exports.getUserOffers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's booking history to personalize offers
    const bookingHistory = await Booking.find({
      customer: userId,
      status: 'completed'
    }).populate('service');

    // Get service categories the user has used before
    const userCategories = new Set();
    bookingHistory.forEach(booking => {
      if (booking.service && booking.service.category) {
        userCategories.add(booking.service.category.toString());
      }
    });

    // Find services in those categories or popular ones
    let offers = [];

    if (userCategories.size > 0) {
      // Find services in categories user has used before
      const categoryOffers = await Service.find({
        category: { $in: Array.from(userCategories) },
        isActive: true
      }).limit(3).populate('category', 'name');

      offers = [...categoryOffers];
    }

    // If we don't have enough category-based offers, add popular services
    if (offers.length < 3) {
      const popularOffers = await Service.find({
        isPopular: true,
        isActive: true,
        _id: { $nin: offers.map(o => o._id) } // Exclude services already added
      }).limit(3 - offers.length).populate('category', 'name');

      offers = [...offers, ...popularOffers];
    }

    // Attach a discount to these offers
    const offersWithDiscount = offers.map(service => ({
      service,
      discountPercentage: Math.floor(Math.random() * 11) + 10, // Random discount between 10-20%
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
    }));

    res.status(200).json({
      success: true,
      offers: offersWithDiscount
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching offers'
    });
  }
};

// Send invitation to friend
exports.sendInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists in system
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This user is already registered'
      });
    }

    // Get current user for referral info
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user doesn't have a referral code, generate one
    if (!user.referralCode) {
      user.referralCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      await user.save();
    }

    // Send invitation email
    const inviteUrl = `${req.protocol}://${req.get('host')}/auth?ref=${user.referralCode}`;
    await emailService.sendInvitationEmail(email, inviteUrl, user.name);

    // Track the invitation
    // In a real system, you might store this in a separate collection

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending invitation'
    });
  }
};

// Get user notification
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('notifications');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      notifications: user.notifications || [],
      unreadCount: user.notifications ? user.notifications.filter(n => !n.read).length : 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

// Mark notifications as read
exports.markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification IDs to mark as read'
      });
    }

    // Update the specified notifications to read=true
    await User.updateOne(
      { _id: userId },
      { $set: { "notifications.$[elem].read": true } },
      { arrayFilters: [{ "_id": { $in: notificationIds } }] }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications'
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // In a real application, you might want to:
    // 1. Archive user data instead of deleting
    // 2. Handle associated data (bookings, reviews, etc.)
    // 3. Require password confirmation

    await User.findByIdAndUpdate(userId, {
      isActive: false,
      email: `deleted_${userId}@deleted.com`,
      name: 'Deleted User'
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
};
