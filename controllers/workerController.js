const Worker = require('../models/Worker');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// Get all workers with filtering options
exports.getAllWorkers = async (req, res) => {
  try {
    let query = {};
    
    // Filter by skill
    if (req.query.skill) {
      query.skills = { $in: [req.query.skill] };
    }
    
    // Filter by service
    if (req.query.service) {
      const service = await Service.findById(req.query.service);
      if (service) {
        query.services = { $in: [service._id] };
      }
    }
    
    // Filter by rating
    if (req.query.rating) {
      query.rating = { $gte: parseFloat(req.query.rating) };
    }
    
    // Fetch workers with user data
    const workers = await Worker.find(query)
      .populate('user', 'name email profileImage')
      .populate('services', 'name price')
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workers',
      error: error.message
    });
  }
};

// Get worker profile
exports.getWorkerProfile = async (req, res) => {
  try {
    const workerId = req.params.id || req.worker._id;
    
    const worker = await Worker.findById(workerId)
      .populate('user', 'name email profileImage phone')
      .populate('services')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: {
          path: 'user',
          select: 'name profileImage'
        }
      });
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching worker profile',
      error: error.message
    });
  }
};

// Update worker profile
exports.updateWorkerProfile = async (req, res) => {
  try {
    const updates = req.body;
    const workerId = req.worker._id;
    
    // Prevent updating user reference
    delete updates.user;
    
    const updatedWorker = await Worker.findByIdAndUpdate(
      workerId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedWorker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully',
      data: updatedWorker
    });
  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating worker profile',
      error: error.message
    });
  }
};

// Get worker availability
exports.getWorkerAvailability = async (req, res) => {
  try {
    const workerId = req.params.workerId;
    
    const worker = await Worker.findById(workerId).select('availability');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    // Also get booked slots to show complete availability
    const bookings = await Booking.find({
      worker: workerId,
      status: { $in: ['confirmed', 'pending'] },
      startTime: { $gte: new Date() }
    }).select('startTime endTime');
    
    res.status(200).json({
      success: true,
      availability: worker.availability,
      bookings: bookings
    });
  } catch (error) {
    console.error('Get worker availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching worker availability',
      error: error.message
    });
  }
};
