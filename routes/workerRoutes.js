const express = require('express');
const router = express.Router();
const { authenticate, isWorker } = require('../middleware/authMiddleware');
const Worker = require('../models/Worker');

// Worker controller with MongoDB functionality
const workerController = {
  getWorkerProfile: async (req, res) => {
    try {
      // Always use logged-in user's worker profile
      const worker = await Worker.findOne({ user: req.user._id });
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Worker profile retrieved successfully',
        worker
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve worker profile',
        error: error.message
      });
    }
  },
  
  updateWorkerProfile: async (req, res) => {
    try {
      const workerId = req.user._id;
      const updates = req.body;
      
      // Use findByIdAndUpdate with options to return the updated document
      const updatedWorker = await Worker.findByIdAndUpdate(
        workerId, 
        updates,
        { new: true, runValidators: true }
      );
      
      if (!updatedWorker) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Worker profile updated successfully',
        worker: updatedWorker
      });
    } catch (error) {
      console.error('Error updating worker profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update worker profile',
        error: error.message
      });
    }
  },
  
  getWorkerAvailability: async (req, res) => {
    try {
      const workerId = req.params.workerId;
      const worker = await Worker.findById(workerId).select('availability');
      
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Worker availability retrieved successfully',
        availability: worker.availability || []
      });
    } catch (error) {
      console.error('Error fetching worker availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve availability',
        error: error.message
      });
    }
  }
};

// Public route to view any worker by id
router.get('/:id', workerController.getWorkerProfile);

// Protected routes
router.use(authenticate);

router.route('/profile')
  .get(isWorker, workerController.getWorkerProfile)
  .put(isWorker, workerController.updateWorkerProfile);

router.get('/availability/:workerId', workerController.getWorkerAvailability);

module.exports = router;
