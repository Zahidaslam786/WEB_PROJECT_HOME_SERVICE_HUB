const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, bookingController.createBooking);
router.get('/my', authenticate, bookingController.getUserBookings);
router.delete('/:id', authenticate, bookingController.cancelBooking);

module.exports = router;
