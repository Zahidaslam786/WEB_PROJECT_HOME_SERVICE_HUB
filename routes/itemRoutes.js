const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { isAuth } = require('../middleware/authMiddleware');

router.post('/', isAuth, itemController.createItem);
router.get('/', isAuth, itemController.getItems);
router.get('/:id', isAuth, itemController.getItem);
router.put('/:id', isAuth, itemController.updateItem);
router.delete('/:id', isAuth, itemController.deleteItem);

module.exports = router;
