const Booking = require('../models/Booking');

// Create a booking (user must be authenticated)
exports.createBooking = async (req, res) => {
  const { service, worker, startTime, endTime, address, notes } = req.body;
  const booking = new Booking({
    service,
    customer: req.user._id, // Link to logged-in user
    worker,
    startTime,
    endTime,
    address,
    notes,
    status: 'pending'
  });
  await booking.save();
  res.status(201).json({ success: true, booking });
};

// Get bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id }).populate('service worker');
  res.json({ success: true, bookings });
};

// Cancel booking (only by owner)
exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, message: 'Booking cancelled' });
};
