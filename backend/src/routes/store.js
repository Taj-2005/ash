const express = require('express');
const router = express.Router();
const { getStoreStatus, updateStoreStatus } = require('../controllers/storeController');
const { authenticateToken } = require('../middleware/auth');

router.get('/status', getStoreStatus);

router.post('/status', authenticateToken, updateStoreStatus);

module.exports = router;