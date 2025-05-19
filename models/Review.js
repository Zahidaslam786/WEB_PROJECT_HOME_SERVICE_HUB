const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  reply: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure a user can only leave one review per booking
reviewSchema.index({ booking: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
