const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateUserProfile);

// User bookings routes
router.get('/bookings', userController.getUserBookings);

// User favorites routes
router.get('/favorites', userController.getUserFavorites);
router.post('/favorites', userController.addFavorite);
router.delete('/favorites/:serviceId', userController.removeFavorite);

// User offers/recommendations routes
router.get('/offers', userController.getUserOffers);

// User invitation routes
router.post('/send-invite', userController.sendInvitation);

// User notifications routes
router.get('/notifications', userController.getNotifications);
router.post('/notifications/mark-read', userController.markNotificationsRead);

// Account management routes
router.delete('/account', userController.deleteAccount);

module.exports = router;
