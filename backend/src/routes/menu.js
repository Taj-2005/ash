const express = require('express');
const { 
  getAllMenuItems, 
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { authenticateToken, checkVendorRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { menuItemSchema } = require('../validations/schemas');

const router = express.Router();


router.get('/items', getAllMenuItems);
router.get('/items/:id', getMenuItemById);


router.post('/items', authenticateToken, checkVendorRole, validate(menuItemSchema), createMenuItem);
router.put('/items/:id', authenticateToken, checkVendorRole, validate(menuItemSchema), updateMenuItem);
router.delete('/items/:id', authenticateToken, checkVendorRole, deleteMenuItem);

module.exports = router;