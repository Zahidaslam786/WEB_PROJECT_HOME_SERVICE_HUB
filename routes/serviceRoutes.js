const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', serviceController.listServices);
router.post('/', authenticate, serviceController.createService);

module.exports = router;
